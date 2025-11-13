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

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

export async function getWalkingRoute(originLat, originLon, destLat, destLon) {
  const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;

  const url = 'https://apis-navi.kakaomobility.com/v1/directions';

  const params = new URLSearchParams({
    origin: `${originLon},${originLat}`,
    destination: `${destLon},${destLat}`,
    priority: 'RECOMMEND',
  });

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
      console.error('Kakao Mobility API Error:', errorText);
      throw new Error(`경로 조회 실패: ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('경로를 찾을 수 없습니다.');
    }

    const route = data.routes[0];
    const sections = route.sections || [];

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

    const coordinates = [];
    for (let i = 0; i < allVertexes.length; i += 2) {
      coordinates.push({
        lng: allVertexes[i],
        lat: allVertexes[i + 1],
      });
    }

    return {
      coordinates,
      distance: route.summary?.distance || 0, // meters
      duration: route.summary?.duration || 0, // seconds
    };
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
}
