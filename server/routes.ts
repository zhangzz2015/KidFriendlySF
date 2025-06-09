import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationSchema, LOCATION_TYPES } from "@shared/schema";
import { z } from "zod";

// San Francisco bounding box
const SF_BOUNDS = {
  south: 37.7049,
  west: -122.5161,
  north: 37.8199,
  east: -122.3555
};

// Create Overpass API query for San Francisco
function createOverpassQuery(): string {
  const bbox = `${SF_BOUNDS.south},${SF_BOUNDS.west},${SF_BOUNDS.north},${SF_BOUNDS.east}`;
  
  const queries = Object.entries(LOCATION_TYPES).map(([type, config]) => {
    return `
      (
        node[${config.query}](${bbox});
        way[${config.query}](${bbox});
        relation[${config.query}](${bbox});
      );
    `;
  }).join('');

  return `
    [out:json][timeout:90][bbox:${bbox}];
    (
      ${queries}
    );
    out center;
  `;
}

// Process OSM element and determine location type
function processOsmElement(element: any): any {
  const tags = element.tags || {};
  let type = null;
  
  // Determine location type based on tags
  if (tags.leisure === 'playground') type = 'playground';
  else if (tags.leisure === 'park') type = 'park';
  else if (tags.tourism === 'museum') type = 'museum';
  else if (tags.amenity === 'science_center') type = 'science_center';
  else if (tags.amenity === 'planetarium') type = 'planetarium';
  
  if (!type) return null;

  // Get coordinates
  let lat, lon;
  if (element.type === 'node') {
    lat = element.lat;
    lon = element.lon;
  } else if (element.center) {
    lat = element.center.lat;
    lon = element.center.lon;
  } else {
    return null; // Skip if no coordinates
  }

  // Format address
  const addressParts = [];
  if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber']);
  if (tags['addr:street']) addressParts.push(tags['addr:street']);
  if (tags['addr:city']) addressParts.push(tags['addr:city']);
  const address = addressParts.length > 0 ? addressParts.join(' ') : null;

  return {
    name: tags.name || `${LOCATION_TYPES[type as keyof typeof LOCATION_TYPES].name.slice(0, -1)}`,
    type,
    latitude: lat,
    longitude: lon,
    address: address || 'San Francisco, CA',
    website: tags.website || tags.url || null,
    phone: tags.phone || null,
    openingHours: tags.opening_hours || null,
    tags,
    osmId: `${element.type}/${element.id}`
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Get locations by type
  app.get("/api/locations/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      if (!Object.keys(LOCATION_TYPES).includes(type)) {
        return res.status(400).json({ message: "Invalid location type" });
      }
      
      const locations = await storage.getLocationsByType(type);
      res.json(locations);
    } catch (error) {
      console.error('Error fetching locations by type:', error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Fetch fresh data from OpenStreetMap
  app.post("/api/locations/refresh", async (req, res) => {
    try {
      const query = createOverpassQuery();
      
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(query)
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }

      const data = await response.json();
      const elements = data.elements || [];

      // Clear existing locations
      await storage.clearLocations();

      // Process and store new locations
      const processedLocations = elements
        .map(processOsmElement)
        .filter(Boolean); // Remove null entries

      if (processedLocations.length > 0) {
        await storage.createLocations(processedLocations);
      }

      const locations = await storage.getLocations();
      res.json({ 
        message: `Successfully loaded ${locations.length} locations`,
        count: locations.length,
        locations 
      });

    } catch (error) {
      console.error('Error refreshing locations:', error);
      res.status(500).json({ 
        message: "Failed to refresh location data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
