# monte-kim.dev

Tae Hwan "Monte" Kim의 개인 블로그 + 포트폴리오. 2026년 10월 영국 이주(YMS 비자) 전 포트폴리오 겸용.
무료 호스팅(Vercel Hobby) + 무료 DB(Supabase free tier)가 하드 제약.

## 디자인 기준 (가장 중요)

`design/` 폴더가 디자인 핸드오프 원본이다:

- `design/Blog Portfolio.dc.html` — **하이파이 디자인 캔버스.** 모든 화면이 이 파일 안에 인라인 스타일 HTML로 들어 있다. 마크업을 복사하지 말고 비주얼 스펙으로만 취급할 것. 픽셀 단위로 재현하는 것이 목표 (색·타이포·간격·카피 모두 final).
- `design/README.md` — 화면 목록(id: 2a~2h 데스크톱, 3a~3c 모바일, 3d 다크), 헤더 스펙, 디자인 토큰, 인터랙션 요구사항
- `design/spec.md` — 스택, 라우트 표, DB 스키마 SQL, 에디터 요구사항, 무료 티어 가드레일

화면 구현 전에 반드시 해당 화면 id의 섹션을 디자인 파일에서 찾아 인라인 스타일 값을 그대로 읽을 것 (`grep -n 'id="2f"' design/Blog\ Portfolio.dc.html`로 라인 위치 확인).

## 스택 & 주요 결정사항

- Next.js 15.5 App Router (Turbopack) + TypeScript + **Tailwind v4** (`@theme inline` 방식, tailwind.config 없음)
- **디자인 토큰**: `src/app/globals.css`에 CSS 변수로 정의 → Tailwind 색상으로 매핑됨.
  클래스명: `bg`/`surface`/`ink`/`body`/`muted`/`placeholder`/`border`/`hairline`/`subtle`/`btn2-border`.
  라이트/다크는 `.dark` 클래스로 전환 (`@custom-variant dark`). **다크에서 버튼 반전은 `bg-ink text-bg`로 자동 처리됨** (ink/bg가 서로 뒤집히므로).
- 테마: next-themes (class strategy, system 기본). 하이드레이션 이슈 방지를 위해 테마 아이콘은 mounted state 대신 `dark:hidden` / `hidden dark:block` CSS로 전환.
- i18n: **next-intl v4, 라우팅 프리픽스 없음.** `NEXT_LOCALE` 쿠키(en 기본/ko) → `src/i18n/request.ts`에서 읽음. 전환은 서버 액션 `src/app/actions/locale.ts`. 문자열은 `messages/en.json`, `messages/ko.json` (한국어 카피는 AI 번역이므로 Monte 검수 필요).
- 폰트: Instrument Sans(UI) + JetBrains Mono(날짜/태그/스탯/코드/kbd), next/font로 로드. mono는 `font-mono` 클래스.
- 아이콘: `src/components/icons.tsx` — 16그리드, 1.5px 스트로크, 라운드 캡 인라인 SVG. 새 아이콘은 디자인 파일 화면 2h(파운데이션)에서 추출해 여기에 추가.
- 라우트 구조: 공개 페이지는 `src/app/(site)/` 그룹 (Header+Footer 포함). 추후 `/admin`은 그룹 밖에 별도 레이아웃으로.
- 데이터: `src/lib/posts.ts` — **Supabase env가 없거나 쿼리 실패 시 디자인 목업의 샘플 포스트로 폴백.** 이 패턴을 유지할 것 (env 없이도 앱이 항상 실행되게). 공개 페이지는 `revalidate = 60`.
- Supabase 클라이언트: `src/lib/supabase.ts` (anon, 공개 읽기 전용). 쓰기(조회수/댓글/폼)는 service role로 서버 액션에서 처리 예정 — RLS에 공개 insert 정책을 일부러 안 만들었음.

## 현재 상태 (2026-07-28)

완료:
- 디자인 토큰/폰트/테마/i18n 인프라 전체
- Header(데스크톱 60px, 모바일 54px 햄버거) + Footer — Footer의 GitHub/LinkedIn 링크는 placeholder TODO, Email은 monte6198@gmail.com
- `/` 홈 (화면 2a, 모바일 3a, 다크 3d) — 픽셀 매칭 검증됨
- `/writing` (화면 2e) — 검색(⌘K 포커스), 태그 칩 필터(개수는 데이터에서 계산), 페이지네이션(5개/페이지), `writing-list.tsx` 클라이언트 컴포넌트
- DB 마이그레이션: `supabase/migrations/20260728000000_init.sql` (posts/tags/post_tags/post_views/view_events/comments/messages + RLS) + `20260728010000_record_view.sql` (조회수 원자적 기록 함수, service role 전용)
- `/writing/[slug]` — 화면 2f/3b. 콘텐츠는 Tiptap 호환 JSON → `src/components/post/post-content.tsx` 렌더러(에디터 프리뷰에서 재사용 예정). TOC(`src/lib/toc.ts` + `post/toc.tsx` 데스크톱 레일/모바일 하단 바), 조회수(`actions/views.ts` — 솔티드 SHA-256 IP 해시, `IP_HASH_SALT` env, `record_post_view` RPC), 댓글(`actions/comments.ts` — 허니팟 `website` 필드 + 인스턴스별 레이트 리밋 5개/10분, `post/comments-section.tsx`). 쓰기는 `src/lib/supabase-admin.ts`(service role, 서버 전용) 경유. env 없으면 조회수/댓글 쓰기는 no-op, 읽기는 폴백 샘플.

- `/say-hi` — 화면 2d. `say-hi-form.tsx`(클라이언트) + `actions/messages.ts`(허니팟 + 레이트 리밋 3개/10분, messages insert, Resend 알림은 `RESEND_API_KEY` 있을 때만 fetch로 발송 — SDK 미사용). 레이트 리밋은 `src/lib/rate-limit.ts` 공유 유틸(인스턴스별, comments와 공용). 블로그 연락 이메일은 monte6198@gmail.com.

- `/admin` + Tiptap 에디터 — 화면 2g/3c. Tiptap v3 (StarterKit에 Link/Underline 포함, CodeBlockLowlight, Image, Placeholder). 인증: `src/middleware.ts`가 `/admin/*` 가드(@supabase/ssr 세션 쿠키, `src/lib/supabase-server.ts`), `/admin/login` 이메일+비밀번호(공개 가입 없음 — Supabase 대시보드에서 사용자 1명 생성). **env 없으면 프리뷰 모드**: 샘플 포스트 read-only, 저장/발행 비활성. 관리자 쓰기는 세션 클라이언트(RLS authenticated) — `actions/admin.ts` (createDraft/savePost/publishPost/unpublishPost/uploadImage). 자동저장 2초 디바운스 + read_minutes/excerpt 자동 계산, 발행 시 slug 생성(중복 시 -2 suffix). 에디터 UI: `admin/editor/[id]/editor-shell.tsx`(상단 바, Write/Preview — Preview는 공개 `PostContent` 재사용, 태그 칩 편집), `slash-command.tsx`(Suggestion 기반, tippy 없이 fixed 포지셔닝), BubbleMenu(`@tiptap/react/menus`, z-50 필수), DragHandle(`@tiptap/extension-drag-handle-react`), 모바일 하단 블록 툴바. 이미지: `src/lib/compress-image.ts` 클라이언트 압축(<300KB) → Storage `post-images` 버킷(`20260728020000_storage.sql`). 에디터 prose 스타일은 globals.css `.editor-prose`. "Add cover" 칩은 TODO(비활성).

- `/projects` — 화면 2b. 정적 카드 4개(`projects/page.tsx`에 하드코딩, 설명만 i18n). **케이스 스터디 링크는 폴백 샘플 slug를 가리킴** — 실제 글 발행 후 교체. Muroom/News classifier의 GitHub 링크는 임시로 프로필(github.com/monte-kim).
- `/about` — 화면 2c. **CV 다운로드 버튼은 Monte 결정으로 제외** (Say hi CTA만, filled 스타일로 승격). 타임라인/툴 칩 정적, 카피 i18n.
- 인프라 일부: `.github/workflows/supabase-ping.yml` (스케줄 월·목, secrets `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` 필요 — 미설정 시 스킵), ⌘K 전역 검색 모달(`src/components/search-modal.tsx` + `/api/search` 라우트, (site) 레이아웃에 마운트 — writing-list의 로컬 ⌘K 핸들러는 제거됨), Footer/say-hi에 실제 프로필 URL(github.com/monte-kim, linkedin.com/in/monte-kim).

미완료:
1. **Vercel 배포** — Monte 계정 필요: vercel.com에서 GitHub 레포 import → 환경 변수는 Supabase 연결 후 등록. (배포 자체는 대시보드 클릭 몇 번)
2. Monte 작업: Supabase 프로젝트 생성/연결, GitHub Actions secrets 등록, ko.json 검수, 프로젝트 카드의 실제 저장소 URL/케이스 스터디 링크 교체

Supabase: **아직 미연결** (Monte가 계정/프로젝트 생성 예정). 연결 절차: 프로젝트 생성(Seoul 리전) → SQL Editor에 마이그레이션 **3개 순서대로** 실행(init → record_view → storage) → Authentication에서 관리자 사용자 1명 생성(+ Sign-ups 비활성화) → Settings→API Keys에서 URL/Publishable key/Secret key 복사 (**새 키 체계 사용** — env 변수명도 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_SECRET_KEY`) → `.env.example` 참고해 `.env.local` 작성(`IP_HASH_SALT`는 `openssl rand -hex 32`). 연결 전까지는 폴백 샘플 데이터로 동작(admin은 read-only 프리뷰).

## 명령어 & 검증

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드 — 각 단계 완료 시 반드시 통과 확인
```

검증 워크플로: build 통과 → Playwright 스크린샷(1200px 라이트/다크 + 390px 모바일)을 디자인 캔버스 해당 화면과 나란히 비교. 다크 모드는 `page.emulateMedia({colorScheme:'dark'})`로 전환 가능(system 기본이므로).

## 스타일 컨벤션

- 픽셀 값은 Tailwind arbitrary value로 그대로 (`text-[15.5px]`, `tracking-[-1.6px]`, `rounded-[7px]` 등) — 디자인 값 왜곡 금지
- 모바일/데스크톱 분기는 `md:` 브레이크포인트, 카피가 다르면 `md:hidden`/`hidden md:inline` 쌍으로
- 반경: 카드 10–12px · 버튼 7–9px · 입력 8px · 필터 칩 100px(full) · 태그 칩 4px
- 텍스트 색 위계: ink(제목/강조) > body(본문) > muted(보조) > placeholder(메타/비활성)
