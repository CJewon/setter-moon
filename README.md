# SellerRoom

SellerRoom은 초기 1인 셀러가 상품, 옵션별 재고, 주문, 배송 상태를 한곳에서 관리하는 관리자 사이트입니다.

스마트스토어, 쿠팡, 인스타그램, 카카오톡, 오프라인 판매처럼 이미 존재하는 판매 채널의 운영 정보를 정리하는 내부 관리 도구이며, 판매 채널 자체를 만드는 프로젝트가 아닙니다.

## 현재 범위

- Next.js App Router, React, TypeScript 기반 프론트엔드
- Next API Route 기반 JSON API
- Supabase Auth, PostgreSQL, RLS, RPC 기반 데이터 처리
- 상품, 옵션 조합, 재고, 주문, 배송 상태 관리
- 대시보드, 마이페이지, 설정 화면
- 무료 플랜 기준: 상품 10개, 옵션 조합 100개, 월 신규 주문 300건
- 유료 풀버전 후보: 월 9,900원, 사용량 한도 해제

## MVP 제외 범위

- 외부 판매 채널 API 자동 연동
- 결제 자동화
- 정산, 마진, 손익 계산
- 팀원 초대와 계정 공유
- 여러 스토어 전환
- 실제 택배사 송장 연동

## 개발 환경

루트는 npm workspace를 사용하며 실제 앱은 `front` workspace에 있습니다.

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

E2E는 실제 Chrome 브라우저 기준으로 실행합니다.

```bash
npm.cmd --workspace front run test:e2e -- --project=chrome
```

기본 E2E 주소는 `http://localhost:3001`입니다. 자세한 설정은 `front/playwright.config.ts`를 확인합니다.

## 환경 변수

로컬 실행은 `front/.env.local`을 기준으로 합니다.

필수 값:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

테스트 계정 기본값:

```txt
E2E_SELLER_EMAIL=test@gmail.com
E2E_SELLER_PASSWORD=Password1!
```

주의:

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용입니다.
- service role key, DB password, access token은 커밋하지 않습니다.
- `.env`, `.env.local`, `.env.*`, `.tmp/`, `.codex/`는 gitignore 대상입니다.

## Vercel 배포

초기 배포는 Vercel Hobby/free 배포를 기준으로 준비합니다. 단, Vercel 공식 기준에서 Hobby 플랜은 개인 프로젝트와 소규모 테스트에 맞춰져 있고 사용량 한도가 있으므로, 실제 유료 서비스로 운영하기 전에는 Pro 전환 필요 여부를 확인합니다.

Vercel 프로젝트 설정 권장값:

```txt
Framework Preset: Next.js
Root Directory: front
Install Command: npm install
Build Command: npm run build
Output Directory: 기본값 사용
Node.js Version: 20.9 이상
```

Vercel 환경 변수:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only-secret-key>
NEXT_PUBLIC_APP_NAME=SellerRoom
NEXT_PUBLIC_APP_URL=https://<vercel-production-domain>
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=product-images
```

주의:

- `SUPABASE_SERVICE_ROLE_KEY`는 Vercel 환경 변수에만 등록하고 브라우저 코드, README, Notion 공개 문서에 값 자체를 쓰지 않습니다.
- `E2E_SELLER_EMAIL`, `E2E_SELLER_PASSWORD`는 배포 환경 필수값이 아닙니다. 배포 후 자동 smoke test를 Vercel URL로 실행할 때만 별도 CI/로컬 환경에 둡니다.
- Supabase Auth의 Site URL은 Vercel production URL로 설정합니다.
- 이메일 인증, 비밀번호 재설정, OAuth를 실제로 사용할 때는 Supabase Redirect URLs에 production URL, preview URL, localhost URL을 추가합니다.
- 배포 전 Supabase Security Advisor warning을 blocker, warning, 후순위로 분류합니다.
- 배포 후 `/api/health`, 랜딩, 로그인, 대시보드, 상품/재고/주문 목록, JSON API 응답을 smoke test로 확인합니다.

### GitHub Actions 수동 배포

수동 배포는 `.github/workflows/vercel-deploy.yml`을 사용합니다.

GitHub repository secrets:

```txt
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
E2E_SELLER_EMAIL
E2E_SELLER_PASSWORD
```

실행 방법:

```txt
GitHub > Actions > Vercel Manual Deploy > Run workflow
```

입력값:

```txt
target: preview | production
run_smoke: 배포 후 deploy smoke E2E 실행 여부.
```

운영 기준:

- 현재는 `main` 브랜치만 배포합니다.
- `preview`는 기능 확인, `production`은 실제 배포에 사용합니다.
- 배포 전 GitHub Actions 안에서 `typecheck`, `lint`, `test`, Vercel build를 실행합니다.
- 배포는 `vercel build` 후 `vercel deploy --prebuilt` 방식으로 진행합니다.
- `front/vercel.json`에서 Vercel Git 자동 배포를 꺼두었으므로, push만으로는 배포되지 않습니다.
- 나중에 `develop`, `stage`, `main` 브랜치를 분리하면 workflow 입력값에 배포 브랜치를 다시 추가합니다.

## 주요 폴더

```txt
front/
  src/app        Next.js App Router pages and API routes
  src/features   feature-level UI, hooks, schemas
  src/server     server-only domain services
  src/shared     shared UI, lib, types, constants
  e2e            Playwright tests

backend/
  supabase/migrations  Supabase schema, RLS, RPC migrations
  types                generated or maintained DB types

docs/
  plans       active/completed implementation plans
  decisions   architectural decisions
```

## 핵심 도메인 규칙

- 주문 생성 시 상태는 `received`입니다.
- `received` 상태에서는 실제 재고를 차감하지 않습니다.
- `received` 주문 수량은 예약 수량으로 계산합니다.
- 가용 재고는 `현재 재고 - 주문접수 예약 수량`입니다.
- `received -> ready_to_ship` 전환 시 실제 재고를 차감합니다.
- `ready_to_ship -> cancelled` 전환 시 재고 복구 여부를 사용자 선택에 따라 처리합니다.
- 재고 변경은 `stock_movements`에 남깁니다.
- 주문 상태 변경은 `order_status_logs`에 남깁니다.
- 주문 수정 이력은 `order_change_logs`에 남깁니다.

## API 응답 규칙

화면에서 직접 호출하는 API는 JSON 응답 규칙을 따릅니다.

```ts
{
  code: 200 | 400 | 401 | 403 | 404 | 409 | 429 | 500;
  message: string;
  data?: unknown;
  fieldErrors?: Record<string, string[]>;
}
```

프론트는 서버가 내려주는 `message`를 toast 또는 화면 상태 메시지로 표시합니다.

## 작업 규칙

작업 전 Notion 회의록과 Task를 확인합니다. 큰 작업은 `docs/plans/active`에 계획을 만들고, 완료 후 `docs/plans/completed`로 이동합니다.

검증 후 커밋과 push를 진행합니다.

커밋 메시지는 한글로 작성합니다.

```txt
feat : 주문 상태 변경 RPC 경로 추가
fix : 랜딩 예시 옵션명 사용자 문구 개선
chore : 개발 문서 정리
```

프론트와 백엔드 변경이 섞이면 가능한 한 커밋을 나눕니다.
