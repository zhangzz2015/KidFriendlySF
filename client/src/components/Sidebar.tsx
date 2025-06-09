import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Map, BarChart3, Info } from 'lucide-react';
import { LOCATION_TYPES } from '../types/location';
import type { Location } from '../types/location';

interface SidebarProps {
  locations: Location[];
  activeFilters: Set<string>;
  onFilterChange: (type: string, checked: boolean) => void;
  onRefresh: () => void;
  onCenterMap: () => void;
  isLoading: boolean;
}

export default function Sidebar({ 
  locations, 
  activeFilters, 
  onFilterChange, 
  onRefresh, 
  onCenterMap,
  isLoading 
}: SidebarProps) {
  // Calculate counts by type
  const locationCounts = Object.keys(LOCATION_TYPES).reduce((acc, type) => {
    acc[type] = locations.filter(location => location.type === type).length;
    return acc;
  }, {} as Record<string, number>);

  const totalVisible = locations.filter(location => 
    activeFilters.has(location.type)
  ).length;

  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Map className="mr-2 h-5 w-5 text-blue-600" />
          Location Types
        </h2>
        
        {/* Location Type Filters */}
        <div className="space-y-3">
          {Object.entries(LOCATION_TYPES).map(([type, config]) => (
            <div 
              key={type}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: config.color }}
                />
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {config.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {locationCounts[type] || 0} found
                  </div>
                </div>
              </div>
              <Checkbox
                checked={activeFilters.has(type)}
                onCheckedChange={(checked) => onFilterChange(type, checked as boolean)}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
          Map Controls
        </h3>
        
        <div className="space-y-3">
          <Button 
            onClick={onRefresh}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          
          <Button 
            onClick={onCenterMap}
            variant="outline"
            className="w-full"
          >
            <Map className="mr-2 h-4 w-4" />
            Center on SF
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
          Statistics
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {locations.length}
              </div>
              <div className="text-xs text-gray-600">Total Places</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {totalVisible}
              </div>
              <div className="text-xs text-gray-600">Visible</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-6 flex-1">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-900 flex items-center">
              <Info className="mr-2 h-4 w-4" />
              About This Map
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-blue-800 mb-3">
              Discover kid-friendly places across San Francisco. Click on markers to learn more about each location.
              Use the toggles above to filter by location type.
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Data source:</strong> OpenStreetMap</p>
              <p><strong>Last updated:</strong> {new Date().toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
