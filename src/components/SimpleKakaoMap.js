/**
 * Simple Kakao Map Test Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

const SimpleKakaoMap = React.forwardRef(({ latitude, longitude, quests = [], onMarkerPress, style }, ref) => {
  const KAKAO_API_KEY = Constants.expoConfig?.extra?.KAKAO_MAP_API_KEY;
  const webViewRef = React.useRef(null);

  console.log('🗺️ SimpleKakaoMap - API Key:', KAKAO_API_KEY);
  console.log('🗺️ SimpleKakaoMap - Location:', latitude, longitude);
  console.log('🗺️ SimpleKakaoMap - Quests:', quests.length);

  // 위치가 변경되면 지도 업데이트
  React.useEffect(() => {
    if (webViewRef.current && latitude && longitude) {
      const script = `
        if (window.map && window.marker) {
          var newPosition = new kakao.maps.LatLng(${latitude}, ${longitude});
          window.map.setCenter(newPosition);
          window.marker.setPosition(newPosition);
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [latitude, longitude]);

  // 퀘스트 마커 업데이트
  React.useEffect(() => {
    if (webViewRef.current && quests.length > 0) {
      console.log('📍 Updating quest markers:', quests.length);
      // 지도 로드 대기 (2초 후 실행)
      setTimeout(() => {
        if (webViewRef.current) {
          const questsJson = JSON.stringify(quests);
          const script = `
            console.log('🔧 Injecting quest markers...');
            if (window.addQuestMarkers) {
              window.addQuestMarkers(${questsJson});
            } else {
              console.log('⚠️ addQuestMarkers function not ready');
            }
            true;
          `;
          webViewRef.current.injectJavaScript(script);
        }
      }, 2000); // 2초 대기
    }
  }, [quests]);

  // 경로 그리기 함수를 외부에서 호출할 수 있도록 expose
  React.useImperativeHandle(ref, () => ({
    drawRoute: (coordinates) => {
      if (webViewRef.current && coordinates && coordinates.length > 0) {
        console.log('🛣️ Drawing route with', coordinates.length, 'points');
        const coordsJson = JSON.stringify(coordinates);
        const script = `
          if (window.drawRoute) {
            window.drawRoute(${coordsJson});
          } else {
            console.log('⚠️ drawRoute function not ready');
          }
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      }
    },
    clearRoute: () => {
      if (webViewRef.current) {
        console.log('🧹 Clearing route');
        const script = `
          if (window.clearRoute) {
            window.clearRoute();
          }
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      }
    },
  }));

  if (!KAKAO_API_KEY) {
    return (
      <View style={[styles.container, style, { backgroundColor: 'orange', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white', fontSize: 16 }}>API 키 없음</Text>
      </View>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; }
          html, body { width: 100%; height: 100%; }
          #map { width: 100%; height: 100%; }
          #status {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 10px;
            z-index: 1000;
            font-size: 12px;
            max-width: 80%;
            word-wrap: break-word;
          }
        </style>
      </head>
      <body>
        <div id="status">SDK 로딩 시작...</div>
        <div id="map"></div>
        <script>
          // 동적으로 카카오맵 SDK 로드
          function loadKakaoSDK() {
            return new Promise((resolve, reject) => {
              document.getElementById('status').innerText = '카카오 SDK 스크립트 로딩 중...';

              const script = document.createElement('script');
              script.type = 'text/javascript';
              script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false';

              script.onload = () => {
                document.getElementById('status').innerText = 'SDK 로드 완료, kakao.maps 초기화 중...';

                // autoload=false 옵션을 사용했으므로 수동으로 로드
                if (window.kakao && window.kakao.maps) {
                  window.kakao.maps.load(() => {
                    document.getElementById('status').innerText = 'kakao.maps.load 완료!';
                    resolve();
                  });
                } else {
                  reject(new Error('kakao.maps 객체를 찾을 수 없음'));
                }
              };

              script.onerror = () => {
                reject(new Error('SDK 스크립트 로드 실패'));
              };

              document.head.appendChild(script);
            });
          }

          // SDK 로드 후 지도 초기화
          loadKakaoSDK()
            .then(() => {
              document.getElementById('status').innerText = '지도 생성 중...';

              if (typeof kakao === 'undefined') {
                throw new Error('kakao 객체 없음');
              }

              if (typeof kakao.maps === 'undefined') {
                throw new Error('kakao.maps 없음');
              }

              var container = document.getElementById('map');
              var options = {
                center: new kakao.maps.LatLng(${latitude}, ${longitude}),
                level: 5
              };

              var map = new kakao.maps.Map(container, options);

              // 마커 추가
              var markerPosition = new kakao.maps.LatLng(${latitude}, ${longitude});
              var marker = new kakao.maps.Marker({
                position: markerPosition
              });
              marker.setMap(map);

              // 전역 변수로 저장 (실시간 업데이트를 위해)
              window.map = map;
              window.marker = marker;
              window.questMarkers = [];

              document.getElementById('status').innerText = '✅ 지도 로드 성공!';

              // 3초 후 상태 메시지 숨기기
              setTimeout(function() {
                document.getElementById('status').style.display = 'none';
              }, 3000);

              // 초기 퀘스트 마커 추가 함수 등록
              window.addQuestMarkers = function(questsData) {
                console.log('🎯 Adding quest markers:', questsData.length);

                // 기존 마커 제거
                if (window.questMarkers) {
                  window.questMarkers.forEach(function(m) { m.setMap(null); });
                }
                window.questMarkers = [];

                questsData.forEach(function(quest) {
                  // DB 필드명 lat, lon 지원
                  var lat = quest.latitude || quest.lat;
                  var lon = quest.longitude || quest.lon;

                  if (lat && lon) {
                    var questPos = new kakao.maps.LatLng(lat, lon);

                    // 빨간색 마커
                    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
                    var imageSize = new kakao.maps.Size(40, 42);
                    var imageOption = {offset: new kakao.maps.Point(20, 42)};
                    var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

                    var questMarker = new kakao.maps.Marker({
                      position: questPos,
                      image: markerImage,
                      title: quest.title || quest.name
                    });
                    questMarker.setMap(window.map);

                    kakao.maps.event.addListener(questMarker, 'click', function() {
                      if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'questMarkerPress',
                          quest: quest
                        }));
                      }
                    });

                    window.questMarkers.push(questMarker);
                  }
                });

                console.log('✅ Added ' + questsData.length + ' quest markers');
              };

              // 경로 그리기 함수
              window.routePolyline = null;

              window.drawRoute = function(coordinates) {
                console.log('🛣️ Drawing route with', coordinates.length, 'points');

                // 기존 경로 제거
                if (window.routePolyline) {
                  window.routePolyline.setMap(null);
                  window.routePolyline = null;
                }

                // coordinates: [{lat, lng}, {lat, lng}, ...]
                var path = coordinates.map(function(coord) {
                  return new kakao.maps.LatLng(coord.lat, coord.lng);
                });

                // Polyline 생성 (주황색 경로선)
                window.routePolyline = new kakao.maps.Polyline({
                  path: path,
                  strokeWeight: 5,
                  strokeColor: '#FF6B00', // 주황색
                  strokeOpacity: 0.8,
                  strokeStyle: 'solid'
                });

                window.routePolyline.setMap(window.map);
                console.log('✅ Route drawn successfully');
              };

              window.clearRoute = function() {
                console.log('🧹 Clearing route');
                if (window.routePolyline) {
                  window.routePolyline.setMap(null);
                  window.routePolyline = null;
                  console.log('✅ Route cleared');
                }
              };

              // React Native로 성공 메시지 전송
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'success',
                  message: 'Map loaded'
                }));
              }
            })
            .catch((error) => {
              document.getElementById('status').innerText = '❌ 에러: ' + error.message;
              console.error('Map error:', error);

              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  message: error.message
                }));
              }
            });
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      ref={webViewRef}
      style={[styles.container, style]}
      source={{ html: htmlContent }}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          console.log('📩 WebView message:', data);

          // 퀘스트 마커 클릭 처리
          if (data.type === 'questMarkerPress' && onMarkerPress) {
            onMarkerPress(data.quest);
          }
        } catch (error) {
          console.error('Error parsing WebView message:', error);
        }
      }}
      onError={(e) => console.error('❌ WebView error:', e.nativeEvent)}
      onLoadStart={() => console.log('🔄 WebView loading...')}
      onLoadEnd={() => console.log('✅ WebView loaded')}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      originWhitelist={['*']}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SimpleKakaoMap;
