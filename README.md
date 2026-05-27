# SellerRoom

초기 1인 셀러를 위한 상품, 옵션/SKU, 재고, 주문, 배송 상태 관리 MVP입니다.

여러 판매 채널을 직접 연결하는 서비스가 아니라, 스마트스토어, 쿠팡, 인스타그램, 카카오톡 주문처럼 흩어진 운영 정보를 한곳에서 정리하는 백오피스 도구를 목표로 합니다.

## 현재 기준

- 프론트엔드: Next.js App Router, React, TypeScript
- 백엔드/DB: Supabase, PostgreSQL, RLS, DB trigger
- 무료 플랜: 상품 10개, SKU/옵션 조합 100개, 월 새 주문 100건
- 유료 풀버전: 월 9,900원, 사용량 한도 해제
- 스토어 기능과 배송 상태 관리는 무료/유료 동일 제공
- 계정 공유와 팀원 초대는 MVP 이후 기획

## 개발 현황

- 랜딩 페이지와 가격표는 무료/유료 2개 플랜 기준으로 반영했습니다.
- Supabase 초기 스키마, RLS, 사용량 집계 RPC, 무료 플랜 한도 차단 trigger 기반을 추가했습니다.
- `/api/usage/summary`에서 현재 스토어의 상품/SKU/월 새 주문 사용량을 조회할 수 있습니다.
- 대시보드/설정 사용량 UI, 상품 등록 API, 주문 등록/재고 트랜잭션은 다음 구현 단계입니다.

## 작업 순서

1. 기획 변경은 Notion 기획안과 회의록에 먼저 남깁니다.
2. Task를 생성하거나 상태를 갱신합니다.
3. 프론트와 백엔드 변경은 가능한 한 분리해서 구현합니다.
4. `typecheck`, `test`, `lint`, `build`를 통과시킵니다.
5. 커밋 메시지는 한국어로 작성하고 원격 저장소에 push합니다.

커밋 예시:

```txt
feat : 사용량 한도 서버 검증 기반 추가
fix : 랜딩 무료 플랜 정책 반영
chore : 개발 문서 정리
```

## 백엔드 작업자 커밋 기준

올려도 되는 코드:

- Supabase migration SQL
- RLS policy, DB function, trigger
- 서버 API route
- 서버 service/helper 코드
- DB 타입 정의
- 테스트 코드
- seed 샘플처럼 실제 비밀값이 없는 로컬 개발용 데이터

올리면 안 되는 코드:

- `.env`, `.env.local`, `.env.example` 등 환경 변수 파일
- Supabase service role key, DB password, access token, API key
- 실제 사용자/고객/주문/전화번호/주소 데이터
- 로컬 캐시, 빌드 산출물, 테스트 리포트
- 개인 Codex 설정, 로컬 하네스 설정

주의할 점:

- 사용량 제한은 프론트 안내가 아니라 서버 검증을 최종 기준으로 둡니다.
- `plan_id`처럼 과금/권한과 연결되는 값은 클라이언트가 직접 바꿀 수 없게 막습니다.
- 주문 상태 변경은 기존 주문 처리 흐름이므로 무료 한도 초과 상태에서도 계속 허용합니다.
- 월 주문 한도는 KST 기준 월 단위로 계산합니다.

## 주요 명령

루트에서 실행:

```bash
npm install
```

프론트 workspace에서 실행:

```bash
npm run dev
npm run typecheck
npm run test
npm run lint
npm run build
```

## 폴더 구조

```txt
front/
  src/app                 Next.js App Router 페이지와 API route
  src/features            기능별 폼, schema, UI 유틸
  src/server              서버 전용 service/helper
  src/shared              공용 타입, 컴포넌트, 상수

backend/
  supabase/migrations     Supabase DB migration
  supabase/seed.sql       로컬 개발용 seed
  types                   DB 타입 및 백엔드 정책 타입

docs/
  plans                   작업 계획
  decisions               결정 기록
```

## 현재 남은 큰 작업

- 대시보드/설정 사용량 UI 연결
- 상품 등록, 옵션/SKU 조합 저장 흐름
- 주문 등록, 주문 상태 변경, 재고 차감/복구 트랜잭션
- Supabase migration 실제 적용 검증
