/**
 * Navigation and Route Utilities
 * - Distance calculation using Haversine formula
 * - Kakao Mobility API integration for route calculation
 */

import Constants from 'expo-constants';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // kilometers
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get walking route from Kakao Mobility API
 * @param {number} originLat - Starting latitude
 * @param {number} originLon - Starting longitude
 * @param {number} destLat - Destination latitude
 * @param {number} destLon - Destination longitude
 * @returns {Promise<Object>} Route data with coordinates
 */
export async function getWalkingRoute(originLat, originLon, destLat, destLon) {
  const KAKAO_REST_API_KEY = Constants.expoConfig?.extra?.KAKAO_REST_API_KEY;

  if (!KAKAO_REST_API_KEY || KAKAO_REST_API_KEY === 'YOUR_REST_API_KEY_HERE') {
    throw new Error('Kakao REST API Key가 설정되지 않았습니다. .env 파일을 확인하세요.');
  }

  const url = 'https://apis-navi.kakaomobility.com/v1/directions';

  // Kakao Mobility API expects: origin=lng,lat&destination=lng,lat
  const params = new URLSearchParams({
    origin: `${originLon},${originLat}`,
    destination: `${destLon},${destLat}`,
    priority: 'RECOMMEND', // RECOMMEND, TIME, DISTANCE
  });

  console.log('🚶 Requesting walking route from Kakao Mobility API');
  console.log('📍 Origin:', originLat, originLon);
  console.log('📍 Destination:', destLat, destLon);

  try {
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Kakao Mobility API Error:', errorText);
      throw new Error(`경로 조회 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Route data received:', data);

    if (!data.routes || data.routes.length === 0) {
      throw new Error('경로를 찾을 수 없습니다.');
    }

    // Extract route coordinates from the first route
    const route = data.routes[0];
    const sections = route.sections || [];

    // Combine all vertexes from all sections
    let allVertexes = [];
    sections.forEach(section => {
      if (section.roads) {
        section.roads.forEach(road => {
          if (road.vertexes) {
            allVertexes = allVertexes.concat(road.vertexes);
          }
        });
      }
    });

    // Convert vertexes from [lng1, lat1, lng2, lat2, ...] to [{lat, lng}, ...]
    const coordinates = [];
    for (let i = 0; i < allVertexes.length; i += 2) {
      coordinates.push({
        lng: allVertexes[i],
        lat: allVertexes[i + 1],
      });
    }

    console.log(`✅ Parsed ${coordinates.length} route coordinates`);

    return {
      coordinates,
      distance: route.summary?.distance || 0, // meters
      duration: route.summary?.duration || 0, // seconds
    };
  } catch (error) {
    console.error('❌ Error fetching route:', error);
    throw error;
  }
}
