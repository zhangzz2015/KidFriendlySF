import { locations, type Location, type InsertLocation } from "@shared/schema";

export interface IStorage {
  getLocations(): Promise<Location[]>;
  getLocationsByType(type: string): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  createLocations(locations: InsertLocation[]): Promise<Location[]>;
  clearLocations(): Promise<void>;
  getLocationByOsmId(osmId: string): Promise<Location | undefined>;
}

export class MemStorage implements IStorage {
  private locations: Map<number, Location>;
  private currentId: number;

  constructor() {
    this.locations = new Map();
    this.currentId = 1;
  }

  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocationsByType(type: string): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(
      (location) => location.type === type
    );
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentId++;
    const location: Location = { ...insertLocation, id };
    this.locations.set(id, location);
    return location;
  }

  async createLocations(insertLocations: InsertLocation[]): Promise<Location[]> {
    const createdLocations: Location[] = [];
    for (const insertLocation of insertLocations) {
      const location = await this.createLocation(insertLocation);
      createdLocations.push(location);
    }
    return createdLocations;
  }

  async clearLocations(): Promise<void> {
    this.locations.clear();
    this.currentId = 1;
  }

  async getLocationByOsmId(osmId: string): Promise<Location | undefined> {
    return Array.from(this.locations.values()).find(
      (location) => location.osmId === osmId
    );
  }
}

export const storage = new MemStorage();
