/**
 * Kakao Map Component using WebView
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

const KakaoMapView = ({
  latitude = 37.5665,
  longitude = 126.9780,
  markers = [],
  onMarkerPress = null,
  style
}) => {
  const KAKAO_API_KEY = Constants.expoConfig?.extra?.KAKAO_MAP_API_KEY;

  // 디버깅: API 키 확인
  console.log('🗺️ Kakao Map API Key:', KAKAO_API_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('📍 Map Center:', `${latitude}, ${longitude}`);

  // HTML 템플릿 생성
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}"></script>
        <style>
          * { margin: 0; padding: 0; }
          html, body { width: 100%; height: 100%; }
          #map { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // 지도 생성
          var container = document.getElementById('map');
          var options = {
            center: new kakao.maps.LatLng(${latitude}, ${longitude}),
            level: 5
          };
          var map = new kakao.maps.Map(container, options);

          // 현재 위치 마커
          var markerPosition = new kakao.maps.LatLng(${latitude}, ${longitude});
          var marker = new kakao.maps.Marker({
            position: markerPosition,
            map: map
          });

          // 추가 마커들
          ${markers.map((m, idx) => `
            var marker${idx} = new kakao.maps.Marker({
              position: new kakao.maps.LatLng(${m.latitude}, ${m.longitude}),
              map: map
            });

            ${m.title ? `
            var infowindow${idx} = new kakao.maps.InfoWindow({
              content: '<div style="padding:5px;font-size:12px;">${m.title}</div>'
            });

            kakao.maps.event.addListener(marker${idx}, 'click', function() {
              infowindow${idx}.open(map, marker${idx});
              ${onMarkerPress ? `
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerPress',
                markerId: ${idx},
                title: '${m.title}',
                latitude: ${m.latitude},
                longitude: ${m.longitude}
              }));
              ` : ''}
            });
            ` : ''}
          `).join('')}

          // 지도 타입 컨트롤 추가
          var mapTypeControl = new kakao.maps.MapTypeControl();
          map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

          // 줌 컨트롤 추가
          var zoomControl = new kakao.maps.ZoomControl();
          map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

          // React Native로 메시지 전송 (지도 로드 완료)
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));
          }
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'markerPress' && onMarkerPress) {
        onMarkerPress(data);
      } else if (data.type === 'mapLoaded') {
        console.log('✅ Kakao Map loaded successfully');
      }
    } catch (error) {
      console.error('Error handling message from WebView:', error);
    }
  };

  if (!KAKAO_API_KEY) {
    console.error('❌ KAKAO_MAP_API_KEY is not set in .env file!');
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>❌ Kakao Map API Key Missing</Text>
        <Text style={styles.errorSubtext}>Please add KAKAO_MAP_API_KEY to .env file</Text>
      </View>
    );
  }

  return (
    <WebView
      style={[styles.container, style]}
      source={{ html: htmlContent }}
      onMessage={handleMessage}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('❌ WebView error:', nativeEvent);
      }}
      onHttpError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('❌ HTTP error:', nativeEvent.statusCode, nativeEvent.url);
      }}
      onLoadStart={() => console.log('🔄 WebView loading started...')}
      onLoadEnd={() => console.log('✅ WebView loading finished')}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      mixedContentMode="always"
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      originWhitelist={['*']}
      renderLoading={() => (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f97316" />
          <Text style={styles.loadingText}>지도 로딩 중...</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f7ff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#991b1b',
    textAlign: 'center',
  },
});

export default KakaoMapView;
