import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocations, refreshLocations } from '../lib/overpassApi';
import MapView from '../components/MapView';
import Sidebar from '../components/Sidebar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function MapPage() {
  const [activeFilters, setActiveFilters] = useState(new Set([
    'playground', 'park', 'museum', 'science_center', 'planetarium'
  ]));
  const [centerMapFunction, setCenterMapFunction] = useState<(() => void) | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get locations
  const { 
    data: locations = [], 
    isLoading: isLoadingLocations,
    error: locationsError,
    refetch: refetchLocations
  } = useQuery({
    queryKey: ['/api/locations'],
    queryFn: getLocations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to refresh data from OpenStreetMap
  const refreshMutation = useMutation({
    mutationFn: refreshLocations,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      toast({
        title: "Data Refreshed",
        description: `Successfully loaded ${data.count} locations from OpenStreetMap`,
      });
      setIsInitialLoad(false);
    },
    onError: (error) => {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh location data. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Auto-refresh data on initial load if no locations exist
  useEffect(() => {
    if (!isLoadingLocations && locations.length === 0 && isInitialLoad) {
      refreshMutation.mutate();
    }
  }, [isLoadingLocations, locations.length, isInitialLoad, refreshMutation]);

  // Handle filter changes
  const handleFilterChange = useCallback((type: string, checked: boolean) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (checked) {
        newFilters.add(type);
      } else {
        newFilters.delete(type);
      }
      return newFilters;
    });
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refreshMutation.mutate();
  }, [refreshMutation]);

  // Handle center map
  const handleCenterMap = useCallback(() => {
    if (centerMapFunction) {
      centerMapFunction();
    }
  }, [centerMapFunction]);

  const isLoading = isLoadingLocations || refreshMutation.isPending;

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <i className="fas fa-map-marked-alt text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">SF Kids Map</h1>
                <p className="text-sm text-gray-600">Kid-friendly places in San Francisco</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <i className="fas fa-map-marker-alt text-blue-600" />
              <span>{locations.length} places found</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar
          locations={locations}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
          onCenterMap={handleCenterMap}
          isLoading={isLoading}
        />

        {/* Map */}
        <div className="flex-1 relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading kid-friendly places...</p>
                <p className="text-sm text-gray-500 mt-1">Fetching data from OpenStreetMap</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {locationsError && !isLoading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Failed to load location data</span>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refetchLocations()}
                      className="text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Map Component */}
          <MapView
            locations={locations}
            activeFilters={activeFilters}
            onCenterMapRef={setCenterMapFunction}
          />
        </div>
      </div>
    </div>
  );
}
