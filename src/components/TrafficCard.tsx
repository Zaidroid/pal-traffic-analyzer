import { formatDistanceToNow } from 'date-fns';
import type { TrafficUpdate } from '../types';

interface TrafficCardProps {
  update: TrafficUpdate;
}

export default function TrafficCard({ update }: TrafficCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Traffic Update
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
        </span>
      </div>

      {update.cities && update.cities.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cities Affected
          </h4>
          <div className="flex flex-wrap gap-2">
            {update.cities.map((city, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      )}

      {update.traffic_status && Object.keys(update.traffic_status).length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Traffic Conditions
          </h4>
          <div className="space-y-2">
            {Object.entries(update.traffic_status).map(([route, status]) => (
              <div
                key={route}
                className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded"
              >
                <span className="text-sm text-gray-600 dark:text-gray-300">{route}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {update.checkpoint_status && Object.keys(update.checkpoint_status).length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Checkpoint Status
          </h4>
          <div className="space-y-2">
            {Object.entries(update.checkpoint_status).map(([checkpoint, status]) => (
              <div
                key={checkpoint}
                className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded"
              >
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {checkpoint}
                </span>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded ${
                    status.toLowerCase().includes('open')
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : status.toLowerCase().includes('closed')
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                  }`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {update.incidents && update.incidents.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Incidents
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {update.incidents.map((incident, index) => (
              <li
                key={index}
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                {incident}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Original Message
        </h4>
        <p
          dir="rtl"
          lang="ar"
          className="text-sm text-gray-600 dark:text-gray-300"
        >
          {update.message}
        </p>
      </div>
    </div>
  );
}