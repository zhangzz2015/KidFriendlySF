import { pgTable, text, serial, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // playground, park, museum, science_center, planetarium
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address"),
  website: text("website"),
  phone: text("phone"),
  openingHours: text("opening_hours"),
  tags: jsonb("tags"), // Store raw OSM tags
  osmId: text("osm_id").unique(), // OpenStreetMap ID
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Location type enum for frontend use
export const LOCATION_TYPES = {
  playground: {
    query: 'leisure=playground',
    icon: 'fas fa-child',
    color: '#E91E63',
    name: 'Playgrounds'
  },
  park: {
    query: 'leisure=park',
    icon: 'fas fa-tree',
    color: '#4CAF50',
    name: 'Parks'
  },
  museum: {
    query: 'tourism=museum',
    icon: 'fas fa-university',
    color: '#9C27B0',
    name: 'Museums'
  },
  science_center: {
    query: 'amenity=science_center',
    icon: 'fas fa-flask',
    color: '#F44336',
    name: 'Science Centers'
  },
  planetarium: {
    query: 'amenity=planetarium',
    icon: 'fas fa-globe',
    color: '#3F51B5',
    name: 'Planetariums'
  }
} as const;

export type LocationType = keyof typeof LOCATION_TYPES;
