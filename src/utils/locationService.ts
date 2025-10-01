import { supabase } from './supabaseClient';

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface StoredLocationData {
  id: string;
  lat_full: number;
  long_full: number;
  lat_short: number;
  long_short: number;
  updated_at: string;
}

/**
 * Request location permission and get current position
 */
export const requestLocationAccess = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache for 1 minute
      }
    );
  });
};

/**
 * Round coordinates to 2 decimal places
 */
export const roundCoordinates = (lat: number, lng: number) => {
  return {
    lat_short: Math.round(lat * 100) / 100,
    long_short: Math.round(lng * 100) / 100,
  };
};

/**
 * Store user location in the database
 */
export const storeUserLocation = async (
  userId: string,
  locationData: LocationData
): Promise<StoredLocationData> => {
  const { latitude, longitude } = locationData;
  const { lat_short, long_short } = roundCoordinates(latitude, longitude);

  const { data, error } = await supabase
    .from('locations')
    .upsert({
      id: userId,
      lat_full: latitude,
      long_full: longitude,
      lat_short,
      long_short,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to store location: ${error.message}`);
  }

  return data;
};

export const getNearbyUsers = async (
  currentUserId: string,
  userLatShort: number,
  userLongShort: number,
  range: number = 0.02
): Promise<any[]> => {
  try {
    const minLat = userLatShort - range;
    const maxLat = userLatShort + range;
    const minLong = userLongShort - range;
    const maxLong = userLongShort + range;

    console.log('getNearbyUsers called with:', {
      currentUserId,
      userLatShort,
      userLongShort,
      range,
      bounds: { minLat, maxLat, minLong, maxLong }
    });

    // Step 1: Filter nearby by location and collect user IDs
    const { data: locationRows, error: locError } = await supabase
      .from('locations')
      .select('id, lat_short, long_short, lat_full, long_full, updated_at')
      .or(
        `and(lat_short.gte.${minLat},lat_short.lte.${maxLat},long_short.gte.${minLong},long_short.lte.${maxLong}),` +
        `and(lat_full.gte.${minLat},lat_full.lte.${maxLat},long_full.gte.${minLong},long_full.lte.${maxLong})`
      )
      .neq('id', currentUserId); // Exclude current user

    console.log('Nearby locations result:', { locationRows, locError });
    if (locError) {
      console.error('Error fetching nearby locations:', locError);
      throw locError;
    }

    if (!locationRows || locationRows.length === 0) {
      console.log('No nearby locations found');
      return [];
    }

    const ids = locationRows.map((row: any) => row.id);
    console.log('User IDs from nearby locations:', ids);

    // Step 2: Fetch profiles for those IDs (no social_links or bio filters)
    const { data: profileRows, error: profError } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        user_name,
        email,
        social_links (
          profile_pic_url,
          bio,
          instagram,
          x_twitter,
          linkedin
        )
      `)
      .in('id', ids);

    console.log('Profiles result:', { profileRows, profError });
    if (profError) {
      console.error('Error fetching profiles:', profError);
      throw profError;
    }

    // Build a map for quick lookup (include all profiles regardless of bio/social_links)
    const profileById = new Map<string, any>((profileRows || []).map((p: any) => [p.id, p]));

    // Compose final result to match Radar page expectations (location + nested profiles)
    const results = (locationRows || []).map((row: any) => {
      const profile = profileById.get(row.id) || {
        id: row.id,
        display_name: 'Unknown',
        user_name: null,
        email: null,
        social_links: null,
      };
      return {
        id: row.id,
        lat_short: row.lat_short,
        long_short: row.long_short,
        updated_at: row.updated_at,
        profiles: profile,
      };
    });

    console.log('Final nearby users result:', results);
    return results;
  } catch (error) {
    console.error('Failed to get nearby users:', error);
    throw error;
  }
};

/**
 * Handle location access and storage when visibility is turned on
 */
export const handleLocationVisibilityToggle = async (
  userId: string,
  isVisible: boolean
): Promise<StoredLocationData | null> => {
  if (!isVisible) {
    return null; // Don't request location if visibility is turned off
  }

  try {
    const locationData = await requestLocationAccess();
    const storedLocation = await storeUserLocation(userId, locationData);
    return storedLocation;
  } catch (error) {
    console.error('Location access error:', error);
    throw error;
  }
};