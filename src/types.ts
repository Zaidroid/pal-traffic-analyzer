export interface TrafficUpdate {
  id: string;
  message: string;
  timestamp: string;
  cities?: string[];
  traffic_status?: Record<string, string>;
  checkpoint_status?: Record<string, string>;
  incidents?: string[];
}