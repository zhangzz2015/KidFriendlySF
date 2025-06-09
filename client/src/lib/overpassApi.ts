import { apiRequest } from "./queryClient";
import type { Location } from "../types/location";

export interface RefreshResponse {
  message: string;
  count: number;
  locations: Location[];
}

export async function refreshLocations(): Promise<RefreshResponse> {
  const response = await apiRequest("POST", "/api/locations/refresh");
  return response.json();
}

export async function getLocations(): Promise<Location[]> {
  const response = await apiRequest("GET", "/api/locations");
  return response.json();
}

export async function getLocationsByType(type: string): Promise<Location[]> {
  const response = await apiRequest("GET", `/api/locations/type/${type}`);
  return response.json();
}
