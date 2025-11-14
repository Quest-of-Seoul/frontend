import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { KAKAO_MAP_API_KEY } from '@env';

const SimpleKakaoMap = React.forwardRef(({ latitude, longitude, quests = [], onMarkerPress, style }, ref) => {
  const KAKAO_API_KEY = KAKAO_MAP_API_KEY;
  const webViewRef = React.useRef(null);

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

  React.useEffect(() => {
    if (webViewRef.current && quests.length > 0) {
      setTimeout(() => {
        if (webViewRef.current) {
          const questsJson = JSON.stringify(quests);
          const script = `
            if (window.addQuestMarkers) {
              window.addQuestMarkers(${questsJson});
            }
            true;
          `;
          webViewRef.current.injectJavaScript(script);
        }
      }, 2000); // 2초 대기
    }
  }, [quests]);

  React.useImperativeHandle(ref, () => ({
    drawRoute: (coordinates) => {
      if (webViewRef.current && coordinates && coordinates.length > 0) {
        const coordsJson = JSON.stringify(coordinates);
        const script = `
          if (window.drawRoute) {
            window.drawRoute(${coordsJson});
          }
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      }
    },
    clearRoute: () => {
      if (webViewRef.current) {
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
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function loadKakaoSDK() {
            return new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.type = 'text/javascript';
              script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false';

              script.onload = () => {
                if (window.kakao && window.kakao.maps) {
                  window.kakao.maps.load(() => {
                    resolve();
                  });
                } else {
                  reject(new Error('kakao.maps not found'));
                }
              };

              script.onerror = () => {
                reject(new Error('SDK script load failed'));
              };

              document.head.appendChild(script);
            });
          }

          loadKakaoSDK()
            .then(() => {

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

              var markerPosition = new kakao.maps.LatLng(${latitude}, ${longitude});
              var marker = new kakao.maps.Marker({
                position: markerPosition
              });
              marker.setMap(map);

              window.map = map;
              window.marker = marker;
              window.questMarkers = [];

              window.addQuestMarkers = function(questsData) {
                if (window.questMarkers) {
                  window.questMarkers.forEach(function(m) { m.setMap(null); });
                }
                window.questMarkers = [];

                questsData.forEach(function(quest) {
                  var lat = quest.latitude || quest.lat;
                  var lon = quest.longitude || quest.lon;

                  if (lat && lon) {
                    var questPos = new kakao.maps.LatLng(lat, lon);

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
              };

              window.routePolyline = null;

              window.drawRoute = function(coordinates) {
                if (window.routePolyline) {
                  window.routePolyline.setMap(null);
                  window.routePolyline = null;
                }

                var path = coordinates.map(function(coord) {
                  return new kakao.maps.LatLng(coord.lat, coord.lng);
                });

                window.routePolyline = new kakao.maps.Polyline({
                  path: path,
                  strokeWeight: 5,
                  strokeColor: '#FF6B00', // 주황색
                  strokeOpacity: 0.8,
                  strokeStyle: 'solid'
                });

                window.routePolyline.setMap(window.map);
              };

              window.clearRoute = function() {
                if (window.routePolyline) {
                  window.routePolyline.setMap(null);
                  window.routePolyline = null;
                }
              };

              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'success',
                  message: 'Map loaded'
                }));
              }
            })
            .catch((error) => {
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

          if (data.type === 'questMarkerPress' && onMarkerPress) {
            onMarkerPress(data.quest);
          }
        } catch (error) {
          console.error('Error parsing WebView message:', error);
        }
      }}
      onError={(e) => console.error('WebView error:', e.nativeEvent)}
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
