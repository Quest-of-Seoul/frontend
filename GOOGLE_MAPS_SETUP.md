# Google Maps API 설정 가이드

## 1. Google Cloud Console에서 API 키 받기

### 1단계: Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 기존 프로젝트 선택

### 2단계: Maps SDK 활성화
1. 좌측 메뉴에서 **"API 및 서비스" > "라이브러리"** 선택
2. 검색창에서 다음 API들을 검색하고 **"사용 설정"** 클릭:
   - **Maps SDK for Android** (Android용)
   - **Maps SDK for iOS** (iOS용)

### 3단계: API 키 생성
1. 좌측 메뉴에서 **"API 및 서비스" > "사용자 인증 정보"** 선택
2. **"+ 사용자 인증 정보 만들기"** 클릭
3. **"API 키"** 선택
4. API 키가 생성됩니다 (예: `AIzaSyC4R6AN7SmujjPUIGKdgDg4vIBrMml4Sh8`)

### 4단계: API 키 보안 설정 (선택사항이지만 권장)
1. 생성된 API 키 옆의 **"편집"** 아이콘 클릭
2. **"애플리케이션 제한사항"** 설정:
   - **Android 앱**: 패키지 이름과 SHA-1 지문 추가
     - 패키지 이름: `com.questofseoul.app`
     - SHA-1: 개발 인증서의 SHA-1 (아래 명령어로 확인)
   - **iOS 앱**: 번들 ID 추가
     - 번들 ID: `com.questofseoul.app`
3. **"API 제한사항"** 설정:
   - "키 제한" 선택
   - "Maps SDK for Android" 및 "Maps SDK for iOS" 체크
4. **"저장"** 클릭

### Android SHA-1 지문 확인 방법
```bash
# 개발용 디버그 인증서
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# 출력에서 "SHA1:" 부분을 복사
```

---

## 2. React Native 프로젝트에 API 키 설정

### 방법 1: app.config.js에 설정 (권장)

`.env` 파일에 API 키 추가:
```bash
# .env
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

`app.config.js` 파일 수정:
```javascript
export default {
  expo: {
    // ... 기존 설정 ...
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    }
  }
}
```

### 방법 2: 직접 네이티브 파일에 설정

#### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY_HERE"/>
</application>
```

#### iOS (`ios/QuestOfSeoul/AppDelegate.m` 또는 `AppDelegate.swift`)
```swift
import GoogleMaps

// application(_:didFinishLaunchingWithOptions:) 메서드 안에
GMSServices.provideAPIKey("YOUR_API_KEY_HERE")
```

---

## 3. 앱 재시작

```bash
# 캐시 클리어 후 재시작
npx expo start --clear

# Android
npm run android

# iOS
npm run ios
```

---

## 주의사항

1. **API 키 보안**:
   - `.env` 파일은 `.gitignore`에 포함되어야 함 (이미 포함됨)
   - 공개 저장소에 API 키를 절대 커밋하지 마세요
   - 프로덕션에서는 API 키 제한사항을 반드시 설정하세요

2. **무료 할당량**:
   - Google Maps는 월 $200 무료 크레딧 제공
   - Maps SDK for Android/iOS는 무제한 사용 가능 (2024년 기준)
   - 단, 결제 정보는 등록해야 함

3. **Expo Go 제한사항**:
   - Expo Go 앱에서는 Google Maps가 제대로 작동하지 않을 수 있음
   - 개발 빌드나 프로덕션 빌드에서 테스트 권장

4. **대안**:
   - 개발 중에는 기본 MapView (PROVIDER_DEFAULT) 사용 가능
   - Apple Maps (iOS) 또는 기본 지도 사용 가능
