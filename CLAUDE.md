# CLAUDE.md

이 파일은 이 저장소의 코드 작업 시 Claude Code (claude.ai/code)에게 지침을 제공합니다.

## 프로젝트 개요

Next.js 15, React Three Fiber, Python FastAPI 백엔드, Anthropic Claude API로 구축된 AI 기반 3D 메시 에디터입니다. 사용자는 세 가지 모드로 3D 모델과 상호작용할 수 있습니다: 
1. UI 컨트롤을 통한 수동 머티리얼 선택
2. AI 기반 채팅 인터페이스를 통한 자연어 명령 (머티리얼 색상 변경)
3. **AI 3D 모델 생성**: 자연어 프롬프트로 새로운 3D 모델 생성 (예: "파란색 원뿔", "빨간색 자동차")

## 개발 명령어

- **개발 서버 시작**: `npm run dev` (빠른 HMR을 위해 Turbopack 사용)
- **프로덕션 빌드**: `npm run build --turbopack` (TypeScript 체크 포함)
- **프로덕션 서버 시작**: `npm start`
- **린팅 실행**: `npm run lint` (Next.js 설정으로 ESLint 사용)
- **빌드 캐시 정리**: `rm -rf .next` (빌드 매니페스트 오류 발생 시 유용)
- **의존성 설치**: `npm install`

## 아키텍처

### 핵심 애플리케이션 플로우

1. **설정 로딩**: 앱이 `/public/config.json`을 로드하여 사용 가능한 3D 모델, 카메라 설정, 씬 파라미터를 정의
2. **3D 씬 설정**: React Three Fiber Canvas가 조명, 환경, 카메라 컨트롤과 함께 3D 씬을 렌더링
3. **머티리얼 탐색**: GLB/GLTF 모델이 로드되면 `ModelViewer` 컴포넌트가 씬 그래프를 순회하여 모든 머티리얼 추출
4. **상태 관리**: 머티리얼은 앱 레벨의 React 상태에 저장되고 UI 컴포넌트와 채팅 인터페이스 모두에 전달
5. **두 가지 상호작용 모드**: 사용자는 `MaterialList` UI로 수동으로 색상을 조정하거나 `ChatInterface`로 자연어 사용 가능

### 주요 컴포넌트 아키텍처

- **`src/app/page.tsx`**: 3D 씬과 UI 간 상태 관리를 조율하는 메인 애플리케이션 컴포넌트
- **`src/components/Scene.tsx`**: 조명, 환경, 바닥면, 카메라 컨트롤과 함께 Three.js 씬 설정
- **`src/components/ModelViewer.tsx`**: useGLTF 훅을 사용하여 GLB 모델 로딩 및 머티리얼 추출 처리
- **`src/components/MaterialList.tsx`**: 발견된 각 머티리얼에 대한 수동 색상 선택기 인터페이스 렌더링
- **`src/components/ChatInterface.tsx`**: API 사용 불가 시 폴백 키워드 매칭을 갖춘 AI 기반 채팅 인터페이스
- **`src/components/ModeSwitch.tsx`**: 수동 모드와 채팅 모드 간 전환
- **`src/components/DownloadController.tsx`**: 3D 씬 스크린샷 캡처 및 다운로드 처리
- **`src/app/api/claude/route.ts`**: Anthropic Claude API로 요청을 프록시하는 Next.js API 라우트

### 머티리얼 관리 시스템

머티리얼은 로드된 3D 모델의 씬 그래프를 순회하여 동적으로 발견됩니다. 시스템은:

1. GLB 파일 내 모든 메시 객체 식별
2. 머티리얼 추출 (단일 머티리얼과 머티리얼 배열 모두 처리)
3. 머티리얼 이름을 Three.js 머티리얼 인스턴스에 매핑하는 `Record<string, THREE.Material>` 생성
4. React 상태 동기화를 유지하면서 Three.js 객체의 머티리얼 색상을 직접 업데이트

### AI 채팅 통합

채팅 인터페이스는 `/api/claude` 엔드포인트를 통해 Anthropic의 Claude API를 사용합니다:

- **기본 모드**: 머티리얼 이름 매칭과 색상 해석을 통한 완전한 AI 처리
- **폴백 모드**: API 키가 없거나 API 실패 시 로컬 키워드 매칭
- **머티리얼 매칭**: AI가 "신발끈을 파란색으로 변경"과 같은 사용자 입력을 분석하여 3D 모델의 실제 머티리얼 이름에 매핑
- **색상 처리**: 자연어 색상을 hex 코드로 변환

### 환경 설정

- **API 키**: AI 채팅 기능을 위해 `.env.local`에 `ANTHROPIC_API_KEY` 설정
- **3D 모델**: GLB 파일을 `/public/models/` 디렉토리에 배치
- **모델 설정**: 새 모델 추가나 씬 설정 조정을 위해 `/public/config.json` 업데이트

### TypeScript 고려사항

Three.js 머티리얼 작업 시 `any` 대신 적절한 타입 가드를 사용하세요:
```typescript
// 올바른 방법
const mat = material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial | THREE.MeshBasicMaterial
if ('color' in mat) {
  mat.color = new THREE.Color(color)
}

// 잘못된 방법
const mat = material as any
mat.color = new THREE.Color(color)
```

### 빌드 및 배포 참고사항

- 프로젝트는 빠른 개발 빌드를 위해 Next.js 15와 Turbopack을 사용
- 프로덕션 빌드 성공을 위해 모든 TypeScript와 ESLint 오류를 해결해야 함
- 3D 모델은 합리적인 로딩 시간을 보장하기 위해 최적화된 GLB 파일이어야 함
- 앱은 컴포넌트 사용에 따라 정적 생성과 서버 사이드 렌더링 모두 지원
- Canvas는 스크린샷 기능을 위해 `preserveDrawingBuffer: true` 사용

### 테스팅

현재 테스트 프레임워크가 구성되어 있지 않습니다. 컴포넌트 테스팅을 위한 Jest와 React Testing Library, E2E 테스팅을 위한 Playwright 추가를 고려하세요.