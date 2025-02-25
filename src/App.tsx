import { useState, useEffect } from 'react';
import { Moon, Sun, X } from 'lucide-react';
import { supabase } from './lib/supabase';
import Map from './components/Map';
import TrafficCard from './components/TrafficCard';
import type { TrafficUpdate } from './types';

function App() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [trafficData, setTrafficData] = useState<TrafficUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    async function fetchTrafficData() {
      try {
        const { data, error: fetchError } = await supabase
          .from('traffic_updates')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);

        if (fetchError) {
          if (fetchError.code === '42P01') {
            setError('Database table not set up yet. Please wait while we set up the database.');
          } else {
            setError(fetchError.message);
          }
          setLoading(false);
          return;
        }

        setTrafficData(data || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch traffic data');
        setLoading(false);
      }
    }

    fetchTrafficData();

    const subscription = supabase
      .channel('traffic_updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'traffic_updates'
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setTrafficData(prev => [payload.new as TrafficUpdate, ...prev].slice(0, 50));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredTrafficData = selectedLocation
    ? trafficData.filter(update => 
        update.cities?.includes(selectedLocation) ||
        Object.keys(update.checkpoint_status || {}).includes(selectedLocation)
      )
    : trafficData;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-6 py-4 rounded-lg shadow-lg max-w-lg w-full" role="alert">
          <strong className="font-bold block mb-2">Error!</strong>
          <span className="block"> {error}</span>
          <p className="mt-4 text-sm">
            Please make sure you've connected to Supabase and the database is properly set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Palestine Traffic & Checkpoint Status</h1>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </div>

        <div className="mb-8">
          <div className="h-[400px] rounded-lg overflow-hidden shadow-lg">
            <Map 
              trafficData={trafficData} 
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          </div>
          {selectedLocation && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg">
              <p className="text-blue-700 dark:text-blue-200">
                Showing updates for: <span className="font-semibold">{selectedLocation}</span>
              </p>
              <button
                onClick={() => setSelectedLocation(null)}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
              >
                <X className="h-4 w-4" />
                Clear filter
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrafficData.map((update) => (
            <TrafficCard key={update.id} update={update} />
          ))}
        </div>

        {filteredTrafficData.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {selectedLocation 
                ? `No traffic updates available for ${selectedLocation}.`
                : 'No traffic updates available yet. Updates will appear here as they come in.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App