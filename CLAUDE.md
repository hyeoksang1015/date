# 짜주께 (아껴주께 패밀리)

데이트 성향 → 코스 구성(슬롯) → 최적 순서·시간표·공유. 설계서: `../jjajuggae-mvp-spec.md` (v0.2), 디자인: `stitch_jjajugge_date_course_planner/`.

## 실행
- `npm test` — 솔버/성향 규칙/검증 테스트 (설계서 15장)
- `npm run build` 후 `npm run dev:api` — Pages Functions + 로컬 KV (http://127.0.0.1:8788)
- 프론트만 고칠 땐 `npm run dev:api`를 켜둔 채 `npm run dev` (Vite가 /api를 8788로 프록시)
- `.dev.vars`에 `KAKAO_REST_KEY` 필요 (`.dev.vars.example` 참고). 없으면 장소 검색/후보만 502.

## 구조
- `src/lib/solver.ts` 순서 최적화, `profile.ts` 성향 규칙, `slots.ts` 카테고리·카카오 조회 설정, `course.ts` 입력 검증 + 코스 생성 — 전부 순수 함수
- `functions/api/` places/search, places/nearby, courses (POST), courses/[id] (GET)
- 화면: `src/pages/` Profile(/), Plan(/plan), Course(/c/:id), Privacy(/privacy). 라우터는 `App.tsx`의 pathname 분기

## 배포 (Cloudflare Pages)
- wrangler.toml 없음 → 바인딩은 대시보드에서: KV `COURSES`, 환경변수 `KAKAO_REST_KEY`
- 빌드 명령 `npm run build`, 출력 `dist`

## 컨벤션
TS strict, 세미콜론, 작은따옴표, 2칸. 문구는 `~주께` 말투를 과하지 않게.
