# Codex CLI 지원 추가 설계

## 목표
- Codex CLI 사용자도 리더보드에서 사용량 추적 가능
- 온보딩에서 Claude Code / Codex / 둘 다 선택 가능
- 기존 Claude Code 흐름 100% 유지

## 변경 범위

### 1. DB: users 테이블
- `cli_type TEXT DEFAULT 'claude'` 추가 (값: 'claude' | 'codex' | 'both')
- 온보딩 시 선택한 CLI 타입 저장

### 2. API: Codex Setup Script (`/api/setup-codex/route.ts`)
- 기존 `/api/setup`과 분리된 Codex 전용 setup 스크립트
- feature flag 활성화: `codex -c features.codex_hooks=true`
- `~/.codex/hooks.json` 생성 (Stop, SessionStart 훅)
- report-usage-codex.js 다운로드
- `/api/usage/onboard` 호출 (cli_type=codex 전달)

### 3. API: Codex Hook Script (`/api/hook-script-codex/route.ts`)
- stdin에서 `transcript_path` 직접 수신
- Codex JSONL의 `token_count` 이벤트 파싱
- OpenAI 모델 가격표 (o3, o4-mini 등)
- 세션 캐시, 큐, 5초 타임아웃 등 기존 패턴 유지
- self-update 로직 포함

### 4. API: onboard 수정
- `cli_type` 파라미터 수신 → users 테이블 업데이트

### 5. UI: SetupGuide 수정
- 상단에 Claude Code | Codex | 둘 다 선택 탭
- 선택에 따라 1개 또는 2개 가이드 노출
- Codex 가이드: 사전 준비(Codex 설치 + feature flag) + curl 명령어

### 6. UI: SetupTooltip 수정
- 동일한 CLI 선택 → 해당 curl 명령어 표시

### 7. UI: 리더보드/프로필 CLI 뱃지
- 이름 옆 작은 아이콘으로 Claude/Codex/Both 표시

## 접근법: B (스크립트 분리)
- Claude용: 기존 `/api/setup` + `/api/hook-script` 그대로 유지
- Codex용: `/api/setup-codex` + `/api/hook-script-codex` 신규
