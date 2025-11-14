# Quest of Seoul

AI AR 도슨트와 함께하는 서울 탐험 앱입니다.

## 주요 기능

- 🗺️ 위치 기반 퀘스트 탐색
- 🤖 AI 도슨트와 실시간 대화
- 📸 AR 카메라로 랜드마크 체험
- 🎁 퀘스트 완료 시 보상 포인트 획득
- 🗺️ 카카오맵 기반 길찾기

## 기술 스택

- React Native 0.82.1
- React Navigation
- Supabase (인증 및 데이터베이스)
- Axios (API 통신)
- Vision Camera (AR 기능)
- WebView (카카오맵)

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# API Configuration
API_URL=http://localhost:8000

# Kakao API
KAKAO_REST_API_KEY=your-kakao-rest-api-key
KAKAO_MAP_API_KEY=your-kakao-map-api-key
```

## 설치 및 실행

### 필수 요구사항

> **Note**: [React Native 환경 설정](https://reactnative.dev/docs/set-up-your-environment) 가이드를 먼저 완료하세요.

### 1. 의존성 설치

```bash
npm install
```

### 2. iOS Pod 설치 (iOS만 해당)

```bash
cd ios
pod install
cd ..
```

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 입력하세요.

```bash
cp .env.example .env
```

### 4. Metro 서버 시작

```bash
npm start
```

### 5. 앱 실행

새 터미널을 열고 다음 명령어 중 하나를 실행하세요:

#### Android

```bash
npm run android
```

#### iOS

```bash
npm run ios
```

앱이 정상적으로 설정되었다면 Android 에뮬레이터, iOS 시뮬레이터 또는 연결된 기기에서 앱이 실행됩니다.

## 프로젝트 구조

```
QuestOfSeoul/
├── src/
│   ├── api/              # API 통신 (fastapi.js)
│   ├── components/       # 재사용 가능한 컴포넌트
│   ├── constants/        # 상수 및 테마 (colors, spacing)
│   ├── screens/          # 화면 컴포넌트
│   ├── utils/            # 유틸리티 함수
│   └── env.d.ts         # 환경 변수 타입 정의
├── assets/              # 이미지 및 정적 파일
├── ios/                 # iOS 네이티브 코드
├── android/             # Android 네이티브 코드
└── App.tsx             # 앱 진입점
```

## 주요 화면

- **HomeScreen**: 지도 기반 퀘스트 탐색
- **QuestScreen**: 퀘스트 목록 및 상세 정보
- **ARScreen**: AR 카메라로 랜드마크 체험
- **ARChatScreen**: AI 도슨트와 대화
- **QuizScreen**: 퀘스트 관련 퀴즈
- **RewardScreen**: 획득한 보상 확인
- **LoginScreen**: 로그인 및 회원가입

## 권한 설정

이 앱은 다음 권한이 필요합니다:

- **카메라**: AR 기능 및 랜드마크 촬영
- **위치**: 주변 퀘스트 탐색
- **마이크**: 음성 인식 (선택 사항)

## 개발 모드 리로드

- **Android**: <kbd>R</kbd> 키를 두 번 누르거나 Dev Menu(<kbd>Ctrl</kbd> + <kbd>M</kbd>)에서 "Reload" 선택
- **iOS**: iOS 시뮬레이터에서 <kbd>R</kbd> 키 누르기
