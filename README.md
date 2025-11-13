# Quest of Seoul

AR 문화 관광 모바일 애플리케이션

## 프로젝트 개요

AI 도슨트와 함께하는 서울 탐험 앱
- AI 기반 도슨트 상호작용
- 위치 기반 퀘스트
- 게이미피케이션 보상 시스템

## 기술 스택

- React Native 0.74.5
- React Navigation 6.x
- Supabase (인증)
- Axios (HTTP 클라이언트)

### 주요 라이브러리
- `react-native-sound` - 오디오 재생
- `react-native-vision-camera` - AR 카메라
- `@react-native-community/geolocation` - 위치 추적
- `react-native-config` - 환경 변수
- `react-native-linear-gradient` - UI
- `react-native-webview` - Kakao Map

## 설치

```bash
# 의존성 설치
npm install

# iOS (macOS만)
cd ios && pod install && cd ..
```

## 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일에 다음 값을 입력:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
API_URL=your_api_url
KAKAO_MAP_API_KEY=your_kakao_key
KAKAO_REST_API_KEY=your_kakao_rest_key
```

## 실행

```bash
# Metro 번들러
npm start

# Android
npm run android

# iOS
npm run ios
```

## 프로젝트 구조

```
src/
├── api/          # API 클라이언트
├── components/   # 재사용 컴포넌트
├── screens/      # 화면
├── utils/        # 유틸리티 함수
├── stores/       # Zustand 스토어
└── constants/    # 상수
```

## 주요 화면

- **LoginScreen** - 로그인/회원가입
- **HomeScreen** - 메인 대시보드
- **QuestScreen** - 퀘스트 선택
- **ARScreen** - AR 체험
- **RewardScreen** - 보상 스토어
