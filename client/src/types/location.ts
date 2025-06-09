export interface Location {
  id: number;
  name: string;
  type: 'playground' | 'park' | 'museum' | 'science_center' | 'planetarium';
  latitude: number;
  longitude: number;
  address?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  tags?: any;
  osmId?: string;
}

export interface LocationTypeConfig {
  query: string;
  icon: string;
  color: string;
  name: string;
}

export const LOCATION_TYPES: Record<string, LocationTypeConfig> = {
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
};
