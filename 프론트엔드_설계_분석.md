# Quest of Seoul - 프론트엔드 설계 분석

## 1. 프로젝트 개요

Quest of Seoul은 React Native/Expo 기반의 AR 문화 관광 모바일 애플리케이션입니다. AI 기반 도슨트 상호작용, 위치 기반 퀘스트, 게이미피케이션 보상 시스템을 특징으로 합니다.

## 2. 디렉토리 구조

```
quest-of-seoul/frontend/
├── App.js                      # 메인 애플리케이션 진입점
├── app.json                    # Expo 설정 파일
├── babel.config.js             # Babel 설정
├── package.json                # 의존성 및 스크립트
├── assets/                     # 정적 자원
│   ├── ai_docent.png          # AI 캐릭터 이미지
│   └── adaptive-icon.png      # 앱 아이콘
├── android/                    # Android 빌드 파일
├── src/
│   ├── api/
│   │   └── fastapi.js         # 백엔드 API 클라이언트
│   ├── components/
│   │   ├── ARScene.js         # AR 카메라 뷰 컴포넌트
│   │   ├── DocentDialog.js    # AI 채팅 인터페이스
│   │   ├── QuestList.js       # 퀘스트 목록 컴포넌트
│   │   └── TabBar.js          # 하단 네비게이션
│   ├── screens/
│   │   ├── LoginScreen.js     # 인증 화면
│   │   ├── HomeScreen.js      # 메인 대시보드
│   │   ├── QuestScreen.js     # 퀘스트 선택
│   │   ├── ARScreen.js        # AR 체험
│   │   └── RewardScreen.js    # 보상 마켓플레이스
│   ├── utils/
│   │   ├── supabase.js        # Supabase 인증
│   │   └── audio.js           # 오디오 재생 유틸리티
│   └── assets/                # (사용되지 않음)
└── node_modules/              # 의존성
```

## 3. 기술 스택

### 핵심 프레임워크
- **React Native 0.81.5** - 모바일 앱 프레임워크
- **React 19.1.0** - UI 라이브러리
- **Expo 54.0.22** - 개발 플랫폼 및 빌드 도구

### 내비게이션
- **@react-navigation/native 6.1.18** - 내비게이션 프레임워크
- **@react-navigation/stack 6.4.1** - 스택 내비게이션 패턴
- **react-native-screens 4.16.0** - 네이티브 스크린 최적화

### 백엔드 통합
- **Axios 1.7.9** - HTTP 클라이언트
- **@supabase/supabase-js 2.47.10** - 인증 및 데이터베이스
- **WebSocket** - 실시간 스트리밍 (독립 실행형 빌드)

### 카메라 & AR
- **expo-camera 17.0.9** - AR 체험용 카메라 액세스
- **expo-av 16.0.7** - 오디오/비디오 재생

### 위치 서비스
- **expo-location 19.0.7** - GPS 및 위치 추적
- **react-native-maps 1.20.1** - 지도 표시 (통합되었으나 미사용)

### UI & 애니메이션
- **expo-linear-gradient 15.0.7** - 그라디언트 배경
- **react-native-reanimated 4.1.1** - 부드러운 애니메이션
- **react-native-gesture-handler 2.28.0** - 터치 제스처

### 스토리지
- **@react-native-async-storage/async-storage 2.2.0** - 로컬 데이터 지속성
- **expo-file-system 19.0.17** - 오디오 캐싱용 파일 작업

### 기타 유틸리티
- **expo-constants 18.0.10** - 앱 설정 액세스
- **@expo/vector-icons 15.0.3** - 아이콘 라이브러리

## 4. 아키텍처 패턴

### 내비게이션 아키텍처
- **스택 기반 내비게이션** (React Navigation)
- 인증 상태에 따른 조건부 초기 경로
- 화면 흐름: Login → Home → Quest/AR/Reward
- 브랜드 컬러(#6366f1 인디고)를 사용한 글로벌 헤더 스타일링

### 상태 관리
- **로컬 컴포넌트 상태** (React Hooks: useState, useEffect)
- **전역 상태 관리 라이브러리 없음** (Redux/MobX/Zustand 미사용)
- 컴포넌트 레벨에서 상태 관리 및 props를 통한 전달
- Supabase + AsyncStorage를 통한 세션 지속성

### 컴포넌트 아키텍처
- **함수형 컴포넌트** (React Hooks 사용)
- **Presentational/Container 패턴**:
  - Screens: 데이터 페칭 및 비즈니스 로직 처리
  - Components: UI 렌더링 처리
- **재사용 가능한 컴포넌트**: TabBar, DocentDialog, QuestList, ARScene

### 인증 흐름
```
App.js (세션 체크)
  → LoginScreen (로그인/회원가입)
    → Supabase Auth
      → Home (성공 시)
```

### 데이터 흐름
```
사용자 액션 → Screen 컴포넌트 → API 클라이언트 (fastapi.js/supabase.js)
  → 백엔드 API → 응답 → 상태 업데이트 → UI 재렌더링
```

## 5. 주요 기능 및 화면

### LoginScreen
**위치**: `src/screens/LoginScreen.js`

**기능**:
- 이메일/비밀번호 인증
- 닉네임을 이용한 회원가입
- 게스트 모드 옵션
- Supabase 인증 통합
- 폼 검증 (비밀번호 최소 6자)

### HomeScreen
**위치**: `src/screens/HomeScreen.js`

**기능**:
- 검색 기능이 있는 메인 대시보드
- 카테고리 필터링 (유산, 음식, 쇼핑, K-culture 등)
- 실시간 업데이트되는 포인트 표시
- AI 캐릭터 마스코트가 있는 필터 모달
- 장소 미리보기 모달 (하단 시트)
- 다른 화면으로의 탭 기반 내비게이션
- `useFocusEffect`를 사용한 포커스 기반 포인트 새로고침

### QuestScreen
**위치**: `src/screens/QuestScreen.js`

**기능**:
- 위치 권한 요청
- 퀘스트 목록 표시 (지도 뷰는 주석 처리됨)
- 기본 위치: 서울 시청 (37.5665, 126.9780)
- 퀘스트 선택 시 AR 화면으로 이동
- GPS를 위한 expo-location 통합

### ARScreen
**위치**: `src/screens/ARScreen.js`

**기능**:
- 카메라 기반 AR 체험
- AI 도슨트 상호작용 다이얼로그
- 음성 합성(TTS) 재생 (음소거 가능)
- 포인트 보상이 있는 퀘스트 완료
- 독립 실행형 빌드용 WebSocket 스트리밍
- Expo Go 빌드용 REST API
- 사용자 참여를 요구하는 대화 추적

### RewardScreen
**위치**: `src/screens/RewardScreen.js`

**기능**:
- 두 개의 탭 인터페이스: "사용 가능" 및 "획득함"
- 포인트 잔액 표시
- 배지/쿠폰이 있는 보상 카드
- 포인트 기반 교환 시스템
- 구매 가능 여부에 대한 시각적 피드백
- 마운트 시 실시간 데이터 새로고침

## 6. 데이터 흐름 및 API 통합

### API 클라이언트 아키텍처
**위치**: `src/api/fastapi.js`

#### 기본 설정
- 환경 자동 감지 (개발/프로덕션)
- 플랫폼별 localhost 처리:
  - Android 에뮬레이터: `10.0.2.2`
  - iOS: Expo 호스트에서 자동 감지
  - 프로덕션: `https://qos-qtj6.onrender.com`
- `app.json`의 `extra.API_URL`을 통한 설정 가능
- 30초 타임아웃

#### API 엔드포인트

**Docent APIs:**
- `POST /docent/chat` - TTS가 포함된 AI 도슨트 메시지 가져오기
- `POST /docent/quiz` - 랜드마크에 대한 퀴즈 가져오기
- `POST /docent/tts` - 텍스트 음성 변환
- `GET /docent/history/{userId}` - 채팅 기록
- `WS /docent/ws/chat` - WebSocket 스트리밍 채팅
- `WS /docent/ws/tts` - WebSocket 스트리밍 TTS

**Quest APIs:**
- `GET /quest/list` - 모든 퀘스트
- `POST /quest/nearby` - 위치별 인근 퀘스트
- `POST /quest/progress` - 퀘스트 상태 업데이트
- `GET /quest/user/{userId}` - 사용자의 퀘스트
- `GET /quest/{questId}` - 퀘스트 세부정보

**Reward APIs:**
- `GET /reward/points/{userId}` - 사용자 포인트
- `POST /reward/points/add` - 포인트 추가
- `GET /reward/list` - 사용 가능한 보상
- `POST /reward/claim` - 보상 획득
- `GET /reward/claimed/{userId}` - 획득한 보상
- `POST /reward/use/{rewardId}` - 보상 사용

### 인증
**위치**: `src/utils/supabase.js`

- Supabase URL: `https://updggeneerdvwyqtzjoz.supabase.co`
- 함수: `signUp`, `signIn`, `signOut`, `getSession`, `getCurrentUser`
- 세션 지속성을 위한 AsyncStorage
- 자동 토큰 갱신 활성화

### 듀얼 모드 TTS 전략
- **Expo Go**: Supabase Storage URL을 사용하는 REST API (다운로드 후 재생)
- **독립 실행형**: 실시간 재생을 위한 WebSocket 스트리밍
- `Constants.appOwnership`을 통한 자동 감지

## 7. 스타일링 접근 방식

### CSS-in-JS (StyleSheet API)
- React Native의 `StyleSheet.create()`를 사용하여 모든 스타일 정의
- 외부 스타일링 라이브러리 없음 (styled-components, Tailwind 미사용)

### 디자인 시스템

#### 컬러 팔레트
- **Primary**: `#6366f1` (인디고) - 브랜드 컬러
- **Secondary**: `#f97316` (오렌지) - 강조, 활성 상태
- **Background**: `#f9fafb`, `#f3f7ff` (라이트 그레이/블루)
- **Text**: `#1f2937`, `#1e293b` (다크 슬레이트)
- **Muted**: `#6b7280`, `#64748b` (그레이)
- **Success**: `#059669`, `#10b981` (그린)
- **Error**: `#ef4444` (레드)

#### 타이포그래피
- **Title**: 24-32px, bold
- **Subtitle**: 16px
- **Body**: 14-16px
- **Small**: 11-12px
- **Font weight**: 400 (normal), 600-700 (bold)

#### 레이아웃 패턴
- **Flex 기반 레이아웃** (flexDirection, justifyContent, alignItems)
- **SafeAreaView** - iOS 노치/상태 표시줄 처리
- **ScrollView** - 스크롤 가능한 콘텐츠
- **일관된 간격**: 8px, 12px, 16px, 20px 단위

#### 컴포넌트 스타일링
- **Cards**: 흰색 배경, 둥근 모서리(12px), 미묘한 그림자
- **Buttons**: 둥근 모양(8-20px), 세로 패딩 10-16px
- **Inputs**: 테두리 반경 12px, 그레이 테두리(#e5e7eb)
- **Modals**: 어두운 오버레이(rgba), 하단 시트 패턴

#### 반응형 디자인
- 백분율 기반 너비(flex: 1, 80%, 90%)
- flexWrap을 사용한 동적 레이아웃
- 플랫폼별 조정(Platform.OS)

## 8. 설정 파일

### app.json - Expo 설정
- 앱 메타데이터 (이름, slug, 버전)
- 플랫폼 설정 (iOS/Android)
- 권한: 카메라, 위치, 오디오 녹음
- 번들 식별자: `com.questofseoul.app`
- 카메라 및 위치용 Expo 플러그인
- 환경 변수: `API_URL` → `https://qos-qtj6.onrender.com`
- 스플래시 화면: 인디고 배경(#6366f1)

### package.json - 프로젝트 의존성
- 스크립트: `start`, `android`, `ios`, `web`
- 메인 진입점: `node_modules/expo/AppEntry.js`
- 비공개 패키지 (게시되지 않음)

### babel.config.js - Babel 설정
- Preset: `babel-preset-expo` (Expo 권장 설정)
- Plugin: `react-native-reanimated/plugin` (애니메이션에 필요)

### 오디오 유틸리티
**위치**: `src/utils/audio.js`

여러 폴백 전략을 갖춘 정교한 오디오 재생 시스템:

**기능**:
- **환경 감지**: Expo Go vs 독립 실행형 빌드
- **다중 재생 방법**:
  1. 사전 다운로드를 통한 URL 재생 (버퍼링 제로)
  2. FileSystem 기반 재생 (임시 파일)
  3. Base64 Data URI 폴백
  4. 독립 실행형 앱용 WebSocket 스트리밍
- **오디오 큐 관리** - 청크 단위 스트리밍
- **자동 정리** - 임시 파일
- **오디오 모드 설정** - iOS 무음 모드용

**재생 전략**:
```
URL → 전체 파일 다운로드 → 재생 (끊김 없음)
Base64 → 임시 파일 쓰기 → 재생 → 삭제
WebSocket → 청크 수집 → 결합 → 재생
```

## 9. 아키텍처 하이라이트

### 강점
1. **듀얼 모드 운영**: Expo Go(개발) 및 독립 실행형(프로덕션)
2. **견고한 오디오 처리**: 다양한 시나리오에 대한 여러 폴백
3. **명확한 분리**: API 계층, UI 컴포넌트, 유틸리티 함수
4. **현대적인 React 패턴**: Hooks, 함수형 컴포넌트
5. **플랫폼 인식**: Android/iOS 특정 설정
6. **실시간 기능**: 향상된 UX를 위한 WebSocket 스트리밍

### 주목할 만한 설계 결정
1. **전역 상태 관리 없음**: 단순한 앱, 컴포넌트 레벨 상태로 충분
2. **인증용 Supabase**: 관리형 인증 서비스
3. **Expo 에코시스템**: 네이티브 기능을 통한 빠른 개발
4. **REST + WebSocket 하이브리드**: 다양한 배포 시나리오의 유연성
5. **파일 기반 오디오 캐싱**: 스트리밍 끊김 방지

### 향후 개선 영역
1. 지도 컴포넌트(QuestMap.js) 현재 미활용
2. 사용자/인증 상태를 위한 Context API 도입 고려
3. 크래시 복구를 위한 Error Boundary 구현
4. 로컬 캐싱을 통한 오프라인 모드 지원
5. 사용자 행동 추적을 위한 분석 통합

## 10. 핵심 특징 요약

Quest of Seoul 프론트엔드는 AR 향상 문화 관광을 위한 잘 구조화된 React Native/Expo 애플리케이션입니다:

- **AI 기반 도슨트 상호작용**: 실시간 채팅 및 TTS
- **위치 기반 퀘스트**: GPS 및 지리적 위치 기능
- **게이미피케이션 보상 시스템**: 포인트 및 보상 교환
- **환경 인식 API 통신**: 개발/프로덕션 모드 자동 전환
- **정교한 오디오 재생**: 끊김 없는 경험을 위한 다중 폴백 전략

코드베이스는 사려 깊은 아키텍처와 사용자 경험에 대한 강한 초점을 보여주며, 모바일 앱 개발 모범 사례를 따릅니다.
