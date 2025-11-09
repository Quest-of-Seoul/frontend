# Assets 폴더

이 폴더에는 앱에서 사용하는 이미지 및 아이콘 파일들이 위치합니다.

## 필요한 파일들

### 1. AI 도슨트 캐릭터 이미지
- **파일명**: `ai_docent.png`
- **크기**: 512x512px 이상 권장
- **형식**: PNG (투명 배경 권장)
- **용도**: AR 화면에 표시되는 AI 도슨트 캐릭터

### 2. Expo 앱 아이콘들

#### icon.png
- **크기**: 1024x1024px
- **형식**: PNG
- **용도**: 앱 아이콘

#### adaptive-icon.png (Android)
- **크기**: 1024x1024px
- **형식**: PNG
- **용도**: Android adaptive icon

#### splash.png
- **크기**: 1284x2778px
- **형식**: PNG
- **배경색**: #6366f1 (보라색)
- **용도**: 스플래시 화면

#### favicon.png (Web)
- **크기**: 48x48px
- **형식**: PNG
- **용도**: 웹 버전 favicon

## 임시 이미지 생성 방법

앱을 실행하기 전에 다음 사이트에서 임시 이미지를 생성할 수 있습니다:

1. **AI 도슨트 캐릭터**:
   - https://placeholder.com/ 에서 512x512 이미지 다운로드
   - 또는 AI 이미지 생성 도구 사용 (DALL-E, Midjourney 등)

2. **Expo 아이콘들**:
   - https://www.appicon.co/ 에서 자동 생성
   - 또는 Figma/Canva에서 디자인

## 빠른 설정 (개발용)

개발 중에는 다음 명령어로 기본 아이콘을 생성할 수 있습니다:

```bash
# Expo 기본 아이콘 사용
npx expo install expo-asset
```

또는 임시로 단색 이미지를 사용해도 됩니다.
