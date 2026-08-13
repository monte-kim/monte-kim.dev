/**
 * Project detail pages (/projects/[slug]) — screens 2k/3f.
 * Copy is the VERIFIED content package from the project dossier
 * (muroom-backend-bach/docs/dossier/11-project-detail.md) — the design
 * canvas copy for these screens is layout-only and must not be used.
 * Derived copy (role cards, footer CTA) is marked with comments.
 */

export type L = { en: string; ko: string };

export type DiagramNode = {
  label: string;
  sub?: string;
  emphasis?: boolean;
};

export type ProjectDetail = {
  slug: string;
  name: string;
  badge: string;
  statusPill: L;
  oneLiner: L;
  caseStudyHref: string;
  githubHref: string;
  stats: { value: string; label: L }[];
  product: L[]; // paragraphs
  screenshots: { src: string; alt: L; mobile?: boolean }[];
  architecture: {
    overview: L;
    chain: DiagramNode[]; // vertical request path, last two nodes branch
    branch: [DiagramNode, DiagramNode];
    supporting: DiagramNode[];
    caption: string;
  };
  stack: { group: string; items: string[] }[];
  rolesSub: L;
  roles: { title: L; badge?: string; body: L; mine?: boolean }[];
  timeline: { period: string; title: L; desc: L; mobile?: boolean }[];
  decisions: { title: L; body: L; href?: string }[];
  footerCta: { title: L; sub: L; seriesHref: string };
};

const MUROOM: ProjectDetail = {
  slug: "muroom",
  name: "Muroom",
  badge: "Founder",
  statusPill: {
    en: "● Wound down · Aug 2026",
    ko: "● 2026년 8월 서비스 종료",
  },
  oneLiner: {
    en: "Map-based studio search for Seoul musicians — founded, built, and wound down in ten months.",
    ko: "서울 뮤지션을 위한 지도 기반 합주실 검색 — 창업부터 종료까지 10개월.",
  },
  caseStudyHref: "/writing/muroom-aws-on-pocket-money",
  githubHref: "https://github.com/muroom-studio", // TODO: switch to muroom-backend-bach once public
  stats: [
    { value: "130", label: { en: "studios catalogued", ko: "등록 스튜디오" } },
    { value: "1,273", label: { en: "rooms listed", ko: "등록 룸" } },
    { value: "110", label: { en: "owners cold-called", ko: "콜드콜로 확보한 사장님" } },
    { value: "3 weeks", label: { en: "first commit → beta", ko: "첫 커밋에서 베타까지" } },
    { value: "~$150", label: { en: "/mo · prod + dev on AWS", ko: "/월 · 2환경 운영비" } },
  ],
  product: [
    {
      en: "Muroom is a map-first search service for music practice studios in Seoul. Musicians pan a map; every studio inside the viewport appears as a price-tagged marker and as a card in a synced list, filterable across thirteen dimensions — price, room size, floor type, parking, lodging, fire insurance, forbidden instruments, and per-category amenities. Each listing shows rooms with per-room pricing, building facts, and straight-line distances to up to three nearby subway stations.",
      ko: "Muroom은 서울의 합주실·연습실을 지도로 찾는 검색 서비스입니다. 지도를 움직이면 뷰포트 안의 스튜디오가 가격 마커와 동기화된 리스트 카드로 나타나고, 가격·룸 크기·층 유형·주차·숙박·화재보험·금지 악기·카테고리별 옵션까지 13개 차원으로 필터링됩니다. 각 스튜디오는 룸별 가격, 건물 정보, 인근 지하철역 최대 3곳까지의 직선거리를 보여줍니다.",
    },
    {
      en: "The supply side was operations, not self-serve: we cold-called studio owners, collected their floor plans and room specs, and registered 130 studios (1,273 rooms) through an internal admin flow. Owner accounts exist for every studio, but owner-facing self-registration was still being built when the project wound down — an eight-step wizard with JSONB-backed draft saves was the last feature in flight.",
      ko: "공급은 셀프서브가 아니라 운영으로 만들었습니다. 사장님들에게 콜드콜을 돌리고 도면과 룸 스펙을 받아 내부 관리자 플로우로 130개 스튜디오(룸 1,273개)를 직접 등록했습니다. 사장님 셀프 등록은 프로젝트 종료 시점에 개발 중이던 마지막 기능으로, JSONB 임시저장을 붙인 8단계 위저드였습니다.",
    },
    {
      en: "Under the hood it's a deliberately boring stack doing a few interesting things: one Spring Boot monolith, PostgreSQL with PostGIS for viewport queries, addresses geocoded through Korea's public road-address API (with an EPSG:5179→WGS84 transform), sessions over JWT, and the whole AWS footprint defined in Terraform at ~$150/month for two environments.",
      ko: "내부는 의도적으로 지루한 스택이 몇 가지 흥미로운 일을 하는 구조입니다. Spring Boot 모놀리스 하나, 뷰포트 쿼리를 위한 PostgreSQL+PostGIS, 공공 도로명주소 API 지오코딩(EPSG:5179→WGS84 변환), JWT 대신 세션, 그리고 Terraform으로 정의된 월 ~$150의 2환경 AWS.",
    },
  ],
  screenshots: [
    {
      src: "/projects/muroom/01-map-search.jpg",
      alt: {
        en: "Viewport search: price markers synced with the result list, nearest-station distance per card",
        ko: "뷰포트 검색 — 가격 마커와 동기화된 리스트, 카드마다 인근 역 거리",
      },
      mobile: true,
    },
    {
      src: "/projects/muroom/02-studio-detail.jpg",
      alt: {
        en: "Studio detail: photos, three nearby stations with straight-line distances, contact CTAs",
        ko: "스튜디오 상세 — 사진, 인근 역 3곳 직선거리, 문의 CTA",
      },
    },
  ],
  architecture: {
    overview: {
      en: "A single Spring Boot service on ECS (EC2, Graviton) behind one ALB that host-routes prod and dev; data lives on self-managed EC2 instances — PostgreSQL 17 + PostGIS and Valkey — with images uploaded browser-direct to S3 via presigned URLs. Credentials rotate through a Secrets Manager Lambda that the app survives without redeploys, and all egress rides a single t4g.nano NAT instance. Everything below the DNS line is Terraform.",
      ko: "단일 Spring Boot 서비스가 ECS(EC2, Graviton) 위에서 돌고, ALB 하나가 호스트 헤더로 prod/dev를 라우팅합니다. 데이터 계층은 자체 운영 EC2 — PostgreSQL 17+PostGIS, Valkey — 이고 이미지는 presigned URL로 브라우저에서 S3에 직접 업로드됩니다. 자격증명은 Secrets Manager 로테이션 Lambda로 갱신되며 앱은 재배포 없이 이를 견디고, 모든 아웃바운드는 t4g.nano NAT 인스턴스 하나를 지납니다. DNS 아래 전부가 Terraform입니다.",
    },
    chain: [
      { label: "Browser · Next.js" },
      { label: "ALB", sub: "host routing · api / dev-api" },
      { label: "ECS · Spring Boot API", sub: "t4g Graviton · prod + dev", emphasis: true },
    ],
    branch: [
      { label: "PostgreSQL 17", sub: "+ PostGIS · viewport queries" },
      { label: "Valkey", sub: "sessions · rate limits" },
    ],
    supporting: [
      { label: "S3 · presigned upload" },
      { label: "Lambda · secrets rotation 7d/1d" },
      { label: "NAT instance · nftables" },
      { label: "S3 · WAL backups 10s" },
      { label: "Juso API · geocoding" },
      { label: "Terraform · everything" },
    ],
    caption: "Solid node = request path · dashed node = supporting service",
  },
  stack: [
    {
      group: "APP",
      items: ["Java 21", "Spring Boot 3.5", "Spring Security (session)", "JPA · hibernate-spatial", "QueryDSL 5", "OpenFeign"],
    },
    {
      group: "DATA",
      items: ["PostgreSQL 17", "PostGIS", "Flyway", "Valkey", "TSID", "JSONB", "proj4j"],
    },
    {
      group: "INFRA",
      items: ["Terraform", "EC2 Graviton", "ECS", "ALB", "S3 presigned", "Secrets Manager", "CloudWatch", "NAT instance"],
    },
    {
      group: "OPS",
      items: ["SSM (no SSH)", "readiness gating", "WAL→S3 10s", "calendar-versioned deploys", "AI code review"],
    },
  ],
  // derived from dossier §6 prose — split into cards
  rolesSub: {
    en: "Five people. I owned the company and two slices of the product — not all of it.",
    ko: "5인 팀. 저는 회사와 제품의 두 영역을 맡았습니다 — 전부가 아니라.",
  },
  roles: [
    {
      title: { en: "Monte (me)", ko: "Monte (본인)" },
      badge: "Founder",
      mine: true,
      body: {
        en: "Company and fundraising as registered CEO. Geospatial search and the studio domain with its file-storage engine, every schema migration, all AWS infrastructure and Terraform, every deploy.",
        ko: "사업자등록 대표로서 회사와 자금. 지리공간 검색과 스튜디오 도메인·파일 스토리지 엔진, 모든 스키마 마이그레이션, AWS 인프라와 Terraform 전체, 모든 배포.",
      },
    },
    {
      title: { en: "Backend engineer", ko: "백엔드 엔지니어" },
      body: {
        en: "Authentication — OAuth, sessions, SMS verification — and the member-facing domains: my-page, terms, reports, inquiries.",
        ko: "인증(OAuth·세션·SMS 인증)과 회원향 도메인 — 마이페이지·약관·신고·문의.",
      },
    },
    {
      title: { en: "Frontend engineer", ko: "프론트엔드 엔지니어" },
      body: {
        en: "The entire web client in Next.js — map view, filters, listing pages.",
        ko: "Next.js 웹 클라이언트 전체 — 지도 뷰, 필터, 목록 페이지.",
      },
    },
    {
      title: { en: "Designers ×2", ko: "디자이너 ×2" },
      body: {
        en: "Product design and brand identity across the service.",
        ko: "서비스 전반의 프로덕트 디자인과 브랜드 아이덴티티.",
      },
    },
  ],
  timeline: [
    {
      period: "Oct 2025",
      title: { en: "First commit", ko: "첫 커밋" },
      desc: {
        en: "Idea validated by phone first — 110 cold calls before and during the build.",
        ko: "코드보다 전화가 먼저 — 110명 콜드콜로 수요를 확인하며 개발 시작.",
      },
      mobile: true,
    },
    {
      period: "Nov 2025",
      title: { en: "Beta live on AWS — three weeks in", ko: "3주 만에 베타 배포" },
      desc: {
        en: "Dockerised, prod profile, running on AWS from commit twenty-something.",
        ko: "Dockerfile과 prod 프로파일을 갖추고 AWS에 올라간 베타.",
      },
      mobile: true,
    },
    {
      period: "Dec 2025",
      title: { en: "Soft launch — first real users", ko: "소프트 런칭" },
      desc: {
        en: "549 searches and 14 sign-ups in December; supply kept growing by cold call.",
        ko: "12월 검색 549건·가입 14명. 공급은 콜드콜로 계속 확보.",
      },
      mobile: true,
    },
    {
      period: "Feb 2026",
      title: { en: "Terraform migration, RDS → self-managed EC2", ko: "Terraform 이관, RDS → 자체 운영 EC2" },
      desc: {
        en: "The whole footprint became code; the data tier moved off managed services to fit a pocket-money budget.",
        ko: "인프라 전체가 코드가 되고, 데이터 계층은 사비 예산에 맞춰 관리형을 떠났습니다.",
      },
    },
    {
      period: "Feb 2026",
      title: { en: "Last production deploy", ko: "마지막 프로덕션 배포" },
      desc: {
        en: "Development continued on branches; operations stayed quiet.",
        ko: "개발은 브랜치에서 계속, 운영 배포는 여기까지.",
      },
    },
    {
      period: "May 2026",
      title: { en: "Operations paused", ko: "운영 중단" },
      desc: {
        en: "The team turned to job searches; the service kept running on credits.",
        ko: "팀은 이직 준비로, 서비스는 크레딧으로 유지.",
      },
    },
    {
      period: "Aug 2026",
      title: { en: "Wound down", ko: "서비스 종료" },
      desc: {
        en: "Credits exhausted. Data archived, infrastructure torn down, postmortems published.",
        ko: "크레딧 소진. 데이터는 아카이브, 인프라는 해체, 회고는 글로.",
      },
      mobile: true,
    },
  ],
  decisions: [
    {
      title: {
        en: "RDS → self-managed Postgres on EC2",
        ko: "RDS → EC2 자체 운영 Postgres",
      },
      body: {
        en: "Server bills were coming out of our own pockets, so I traded managed guarantees for ~$150/mo across two environments — then rebuilt the guarantees by hand: 3-layer backups, WAL shipping every 10s, and RDS-grade credential rotation on a database AWS doesn't manage.",
        ko: "서버비가 사비였기에 관리형 보증을 포기하고 2환경 월 ~$150로 — 그리고 그 보증을 손으로 재구축했습니다: 3중 백업, 10초 WAL 쉬핑, 자체 DB 위의 RDS급 로테이션.",
      },
      // section deep links: EN anchors (KO mode falls back to page top gracefully)
      href: "/writing/muroom-aws-on-pocket-money#giving-up-managed-services-without-giving-up-their-guarantees",
    },
    {
      title: {
        en: "Walking time → straight-line distance",
        ko: "도보 시간 → 직선거리",
      },
      body: {
        en: "The paid directions API billed per studio per page; the free public alternative was rate-limited to unusability. We deleted the feature and compute Haversine in Java: strictly worse information, strictly zero marginal cost.",
        ko: "유료 길찾기는 페이지당 과금, 무료 공공 API는 쿼터로 불가 — 기능을 지우고 Java Haversine으로. 정보는 후퇴, 한계비용은 0.",
      },
      href: "/writing/muroom-aws-on-pocket-money#when-cost-pressure-reaches-the-product",
    },
    {
      title: { en: "JWT → sessions", ko: "JWT → 세션" },
      body: {
        en: "Once refresh-token revocation forced state into Redis, JWT was sessions with extra steps. I proposed the switch; JWT survives only as short-lived handshake tokens.",
        ko: "리프레시 무효화가 Redis 상태를 요구하는 순간 JWT는 '단계 많은 세션' — 전환을 제안했고, JWT는 단기 핸드셰이크 토큰으로만 남았습니다.",
      },
      href: "/writing/muroom-deleting-jwt",
    },
    {
      title: {
        en: "Sequences → TSID, IDs as strings",
        ko: "시퀀스 → TSID, 그리고 문자열 ID",
      },
      body: {
        en: "App-generated 64-bit time-sortable PKs killed a per-INSERT round-trip; two days later JavaScript's 2⁵³ limit silently truncated them, and every API ID became a string the same afternoon.",
        ko: "앱 생성 64비트 시간 정렬 PK로 INSERT 왕복 제거 — 이틀 뒤 JS의 2⁵³ 한계가 ID를 조용히 자르며, 그날 오후 모든 API ID가 문자열이 됐습니다.",
      },
      href: "/writing/muroom-ids-javascript#migration-one-sequences-tsid",
    },
    {
      title: {
        en: "Dropping foreign keys (studio domain)",
        ko: "외래키 제거 (studio 도메인)",
      },
      body: {
        en: "On working-engineer advice: relax the database, enforce in code. Fourteen FKs went; creation-time existence checks and service-owned cascade deletes took their place, with partial unique indexes handling soft-delete uniqueness.",
        ko: "실무자 조언에 따라 'DB는 완화, 코드는 강제' — FK 14개를 걷어내고 생성 시점 존재 검증·서비스 소유 연쇄 삭제·partial unique index로 대체.",
      },
      href: "/writing/muroom-ids-javascript#the-quieter-migration-deleting-our-foreign-keys",
    },
  ],
  // derived copy — 3 published posts
  footerCta: {
    title: {
      en: "Three posts on what Muroom taught me",
      ko: "Muroom이 가르쳐준 것, 세 편의 글",
    },
    sub: {
      en: "Infra economics on pocket money, deleting an auth architecture, and ID contracts with JavaScript.",
      ko: "사비로 배운 인프라 경제학, 인증 아키텍처를 지운 이야기, 그리고 JavaScript와의 ID 계약.",
    },
    seriesHref: "/writing/muroom-aws-on-pocket-money",
  },
};

/**
 * Moty — verified content package from moty-dossier/11-project-detail.md
 * (public-safe derivative). Empty caseStudyHref/githubHref/seriesHref and
 * empty screenshots hide their UI until the blog series is published /
 * assets are approved.
 */
const MOTY: ProjectDetail = {
  slug: "moty",
  name: "Moty Fitness Platform",
  badge: "Moty",
  statusPill: { en: "● In production", ko: "● 프로덕션 운영 중" },
  oneLiner: {
    en: "The data platform behind a digital weight machine — one multi-tenant API and two Next.js frontends, solo-built and running in production.",
    ko: "디지털 웨이트 머신의 데이터 플랫폼 — 멀티테넌트 API 하나와 Next.js 프론트 2종, 단독 구축으로 프로덕션 운영 중.",
  },
  caseStudyHref: "", // TODO: "/writing/moty-pii-encryption-rollout" once published
  githubHref: "", // company-private repos — button hidden
  stats: [
    { value: "~590×", label: { en: "faster analytics — measured", ko: "분석 쿼리 가속 — 실측" } },
    { value: "206", label: { en: "API endpoints · 22 domains", ko: "API 엔드포인트 · 22개 도메인" } },
    { value: "−58%", label: { en: "AWS cost — self-measured", ko: "AWS 비용 — 자가 실측" } },
    { value: "4", label: { en: "client surfaces, one account system", ko: "클라이언트 표면, 단일 계정 시스템" } },
    { value: "95%", label: { en: "of backend code by line (git blame)", ko: "백엔드 코드 라인 저작 (git blame)" } },
  ],
  product: [
    {
      en: "Moty is a fitness platform built around a digital weight machine that streams bilateral sensor data — force, velocity, position on both sides, ten times a second. That stream feeds four client surfaces through one API: the machine's tablet app writes workout sets, a consumer app reads personal progress, a data web gives gym operators tenant-scoped analytics up to clinical-style rehabilitation reports, and an internal console runs content and operations.",
      ko: "Moty는 좌우 양측의 힘·속도·위치를 초당 10회 스트리밍하는 디지털 웨이트 머신을 중심에 둔 피트니스 플랫폼입니다. 그 스트림이 API 하나를 통해 4개 클라이언트로 흐릅니다 — 머신 태블릿 앱이 운동 세트를 기록하고, 개인 앱이 본인 데이터를 읽고, 데이터 웹이 센터 운영자에게 임상 스타일 재활 리포트까지의 테넌트 분석을 제공하며, 사내 콘솔이 콘텐츠와 운영을 담당합니다.",
    },
    {
      en: "I own the platform end to end: the 206-endpoint Spring Boot API (95% of current code by line — git blame, last-author basis; a short-term collaborator's early areas were later redesigned), the operator-facing data web shipped in two months, and the internal console shipped in one month alongside its own backend APIs. Both Next.js frontends ship without chart, form, state or session libraries — the operator web runs on five runtime dependencies — with hand-built SVG charts up to a 1,700-line clinical report, Lighthouse accessibility 100, and 180KB of JS shipped.",
      ko: "플랫폼을 끝에서 끝까지 담당합니다: 206개 엔드포인트의 Spring Boot API(현행 코드 라인 기준 95% — git blame, last-author 기준. 초기 단기 협업자의 영역은 이후 재설계), 2개월에 출시한 운영자용 데이터 웹, 그리고 전용 백엔드 API와 같은 스프린트에 1개월로 출시한 사내 콘솔. Next.js 프론트 2종 모두 차트·폼·상태·세션 라이브러리 없이 돌아가고, 운영자용 데이터 웹은 런타임 의존성 5개로 1,700줄 임상 리포트까지 수제 SVG로 감당합니다 — Lighthouse 접근성 100, JS 전송 180KB.",
    },
    {
      en: "Under the hood: 10Hz sensor streams are pre-aggregated at write time so analytics never scan the raw hypertable — a ~380× row fanout collapsed, ~590× faster queries (measured, EXPLAIN ANALYZE on production data). Auth is a custom OAuth2-shaped token service — six grant types, 27 scopes — because standard servers don't speak PIN-and-profile kiosk auth. Personal data is encrypted at field level (AES-256-GCM with a blind index for equality search), rolled out to production in nine zero-downtime steps. And the AWS bill dropped 58% by self-hosting the data tier — with the guarantees rebuilt by hand.",
      ko: "내부는 이렇습니다: 10Hz 센서 스트림을 쓰기 시점에 사전집계해 분석 쿼리가 원시 하이퍼테이블을 스캔하지 않습니다 — 행 팬아웃 ~380× 제거, 쿼리 ~590× 가속(프로덕션 데이터 EXPLAIN ANALYZE 실측). 인증은 자체 OAuth2형 토큰 서비스 — grant 6종, scope 27종 — 표준 서버는 PIN·프로필 키오스크 인증을 말하지 못하기 때문입니다. 개인정보는 필드 레벨 암호화(AES-256-GCM + 동등 검색용 블라인드 인덱스)를 9단계 무중단으로 프로덕션에 롤아웃했고, 데이터 계층 자가 호스팅으로 AWS 비용을 58% 줄이며 관리형의 보증은 손으로 재구축했습니다.",
    },
  ],
  screenshots: [], // pending company approval for data-web captures; console screenshots are off-limits
  architecture: {
    overview: {
      en: "One Spring Boot monolith on ECS (EC2, Graviton) serves four client surfaces; both web frontends are strict BFFs — the browser never talks to the API, tokens live in httpOnly cookies. The data tier is self-hosted on EC2: PostgreSQL 17 with TimescaleDB hypertables for the sensor streams, and Valkey for token state and rate limits. Deploys ride GitHub Actions OIDC (no long-lived keys) with circuit-breaker rollback; backups ship cross-region.",
      ko: "ECS(EC2, Graviton) 위의 Spring Boot 모놀리스 하나가 4개 클라이언트를 서빙합니다. 웹 프론트 2종은 엄격한 BFF — 브라우저는 API와 직접 통신하지 않고 토큰은 httpOnly 쿠키에만 삽니다. 데이터 계층은 EC2 자가 호스팅: 센서 스트림용 TimescaleDB 하이퍼테이블을 얹은 PostgreSQL 17과, 토큰 상태·rate limit용 Valkey. 배포는 GitHub Actions OIDC(장수명 키 0)에 circuit breaker 롤백, 백업은 교차 리전으로 나갑니다.",
    },
    chain: [
      { label: "4 client surfaces", sub: "tablet · personal app · data web · ops console" },
      { label: "Next.js BFFs ×2", sub: "web surfaces only · httpOnly cookies" },
      { label: "ALB", sub: "host routing · WAF" },
      { label: "ECS · Spring Boot API", sub: "Graviton · 206 endpoints · 22 domains", emphasis: true },
    ],
    branch: [
      { label: "PostgreSQL 17", sub: "+ TimescaleDB · self-hosted EC2" },
      { label: "Valkey", sub: "token state · rate limits · self-hosted" },
    ],
    supporting: [
      { label: "S3 · presigned upload policies" },
      { label: "Secrets Manager · KMS field keys" },
      { label: "FCM ×2 · push" },
      { label: "SMS · dual-provider routing" },
      { label: "OIDC deploys · circuit breaker" },
      { label: "WAL→S3 · cross-region backups" },
    ],
    caption: "Solid node = request path · dashed node = supporting service",
  },
  stack: [
    {
      group: "API",
      items: ["Java 21", "Spring Boot 3.5", "JPA · QueryDSL", "custom OAuth2 token service", "27 scopes · 6 grants", "TSID"],
    },
    {
      group: "DATA",
      items: ["PostgreSQL 17", "TimescaleDB hypertables", "write-time pre-aggregation", "JSONB rep envelopes", "AES-256-GCM + blind index", "Valkey", "Flyway expand→contract"],
    },
    {
      group: "WEB (×2)",
      items: ["Next.js", "React", "Tailwind v4", "5 runtime deps (data web)", "hand-built SVG charts", "strict BFF · httpOnly", "7 locales", "A11y 100 · 180KB JS", "page weight −74%"],
    },
    {
      group: "INFRA · OPS",
      items: ["ECS on EC2 Graviton", "Terraform", "GitHub Actions OIDC", "immutable prod tags", "circuit-breaker rollback", "budget + cost-anomaly → Slack", "Semgrep · gitleaks"],
    },
  ],
  rolesSub: {
    en: "Effectively a solo build — with two collaborations worth naming precisely.",
    ko: "사실상 단독 구축 — 다만 정확히 밝혀둘 협업 두 건이 있습니다.",
  },
  roles: [
    {
      title: { en: "Monte (me)", ko: "Monte (본인)" },
      badge: "Full-stack",
      mine: true,
      body: {
        en: "The API monolith — domain design, auth framework, analytics pipeline, PII encryption, every schema migration — plus both Next.js frontends, the internal console, AWS infrastructure and every production deploy. 95% of current backend code by line; both frontends 95–100%.",
        ko: "API 모놀리스 전체 — 도메인 설계, 인증 프레임워크, 분석 파이프라인, PII 암호화, 모든 스키마 마이그레이션 — 그리고 Next.js 프론트 2종, 사내 콘솔, AWS 인프라와 모든 프로덕션 배포. 현행 백엔드 코드 라인 기준 95%, 프론트 2종은 95~100%.",
      },
    },
    {
      title: { en: "Backend collaborator", ko: "백엔드 협업자" },
      body: {
        en: "A short-term collaborator (Dec 2025 – Feb 2026) implemented early auth and user domains to my designs; I later redesigned those areas from principles. Some scaffolding and utilities remain.",
        ko: "단기 협업자(2025.12–2026.02)가 초기 인증·사용자 도메인을 제 설계대로 구현했고, 이후 제가 해당 영역을 원칙 기반으로 재설계했습니다. 일부 스캐폴딩과 유틸리티가 남아 있습니다.",
      },
    },
    {
      title: { en: "Design", ko: "디자인" },
      body: {
        en: "The product designer shaped the platform's design language and contributed one day of chart and screen polish commits to the data web.",
        ko: "프로덕트 디자이너가 플랫폼의 디자인 언어를 만들었고, 데이터 웹의 차트·화면 시각 보강에 하루 커밋 기여를 했습니다.",
      },
    },
  ],
  timeline: [
    {
      period: "Aug 2025",
      title: { en: "First commit", ko: "첫 커밋" },
      desc: {
        en: "Solo foundation: domain layout, error contracts, file uploads with event-driven rollback.",
        ko: "단독 파운데이션 — 도메인 구조, 에러 계약, 이벤트 기반 롤백을 갖춘 파일 업로드.",
      },
      mobile: true,
    },
    {
      period: "Dec 2025",
      title: { en: "Infra as code — and a dual-database detour", ko: "IaC 착수 — 그리고 듀얼 DB 우회로" },
      desc: {
        en: "Terraform and Flyway land; raw sensor data briefly gets its own database, and the package structure follows.",
        ko: "Terraform·Flyway 도입. 원시 센서 데이터가 잠시 전용 DB를 갖게 되고, 패키지 구조도 그에 맞춰집니다.",
      },
    },
    {
      period: "Jan 2026",
      title: { en: "Cost month: −58%, back to one database", ko: "비용의 달 — −58%, 단일 DB 회귀" },
      desc: {
        en: "Self-hosted Postgres and Valkey on Graviton, NAT instances over gateways; the dual-DB design folds back into one Postgres with TimescaleDB.",
        ko: "Graviton 위 Postgres·Valkey 자가 호스팅, 게이트웨이 대신 NAT 인스턴스. 듀얼 DB 설계는 TimescaleDB를 얹은 단일 Postgres로 회귀.",
      },
      mobile: true,
    },
    {
      period: "Mar 2026",
      title: { en: "Auth rewritten from principles", ko: "원칙 기반 인증 재작성" },
      desc: {
        en: "The custom OAuth2-shaped token service lands — built alongside the old module, then swapped in one release.",
        ko: "자체 OAuth2형 토큰 서비스 랜딩 — 구모듈과 병존 개발 후 한 릴리스에 스왑.",
      },
      mobile: true,
    },
    {
      period: "Apr 2026",
      title: { en: "Ops console: one month, APIs included", ko: "운영 콘솔 — API 포함 1개월" },
      desc: {
        en: "Internal console shipped in a month alongside its own backend APIs: content pipelines across 7 locales, versioned legal documents.",
        ko: "사내 콘솔을 전용 백엔드 API와 같은 스프린트에 1개월로 출시 — 7로케일 콘텐츠 파이프라인, 버전 관리되는 법적 문서.",
      },
    },
    {
      period: "Jun–Jul 2026",
      title: { en: "Data web in two months; kiosk threat model", ko: "데이터 웹 2개월 — 키오스크 위협모델" },
      desc: {
        en: "The operator-facing analytics web ships in two months. Shared-tablet auth gets a real threat model: one-shot listings, token binding, step-up re-auth.",
        ko: "운영자용 분석 웹을 2개월에 출시. 공용 태블릿 인증에 실전 위협모델 적용 — 원샷 조회, 토큰 바인딩, step-up 재인증.",
      },
      mobile: true,
    },
    {
      period: "Jul–Aug 2026",
      title: { en: "PII encryption, live", ko: "PII 암호화, 무중단 롤아웃" },
      desc: {
        en: "Field-level encryption reaches production in nine zero-downtime steps, each a traceable commit. Clinical-style recovery reports follow.",
        ko: "필드 레벨 암호화가 9단계 무중단으로 프로덕션 도달 — 단계마다 추적 가능한 커밋. 임상 스타일 회복 리포트가 뒤따릅니다.",
      },
      mobile: true,
    },
  ],
  decisions: [
    {
      title: { en: "A dual-database detour, undone in a month", ko: "듀얼 DB 우회로, 한 달 만의 회귀" },
      body: {
        en: "TimescaleDB doesn't run on RDS, so raw sensor data was headed for a separate managed time-series cloud — whose nearest region was Tokyo. I built that split; then cost optimization killed RDS a month later, and the split lost its reason: one self-hosted Postgres carries the OLTP tables and the hypertables both. Keeping the reversal cheap was the real win.",
        ko: "TimescaleDB는 RDS에서 돌지 않아, 원시 센서 데이터는 별도의 관리형 시계열 클라우드로 갈 예정이었습니다 — 가장 가까운 리전이 도쿄였죠. 실제로 그 분리를 구축했고, 한 달 뒤 비용 최적화가 RDS를 없애자 분리의 이유도 사라졌습니다. 자가 운영 Postgres 하나가 OLTP 테이블과 하이퍼테이블을 함께 감당합니다. 되돌리는 비용을 싸게 유지한 것이 진짜 성과였습니다.",
      },
    },
    {
      title: { en: "Pre-aggregate at write time, not query time", ko: "쿼리 시점이 아니라 쓰기 시점에 집계" },
      body: {
        en: "Rep boundaries and per-mode metrics are domain logic — not expressible in a time-bucket. So every set write collapses its raw stream into ~24 scalar columns plus a per-rep JSONB envelope with index pointers; analytics never touch the hypertable. ~590× faster, measured — at the cost of an append-only aggregate contract: past data can't be recomputed.",
        ko: "rep 경계와 모드별 메트릭은 도메인 로직이라 time-bucket으로 표현되지 않습니다. 그래서 세트 쓰기마다 원시 스트림을 ~24개 스칼라 컬럼과 인덱스 포인터를 담은 rep별 JSONB 봉투로 환원하고, 분석은 하이퍼테이블을 건드리지 않습니다. 실측 ~590× 가속 — 대가는 과거 데이터 재계산이 불가한 append-only 집계 계약입니다.",
      },
    },
    {
      title: { en: "A custom OAuth2-shaped token service", ko: "자체 OAuth2형 토큰 서비스" },
      body: {
        en: "Standard authorization servers don't speak PIN-and-profile kiosk auth, and they're deprecating the password grants this product needs. Six grant types dispatched through a handler map, a DB-managed client registry, 27 scopes — adding a grant is adding a bean. Stateless JWT with its three state problems solved: jti blacklist, per-user invalidation watermark, rotating refresh.",
        ko: "표준 인가 서버는 PIN·프로필 키오스크 인증을 지원하지 않고, 이 제품에 필수인 password 계열 grant를 폐기하는 방향입니다. 핸들러 맵으로 디스패치되는 grant 6종, DB 관리 클라이언트 레지스트리, scope 27종 — grant 추가는 bean 추가입니다. Stateless JWT의 상태 문제 3종은 jti 블랙리스트, 사용자별 무효화 워터마크, 회전 refresh로 풀었습니다.",
      },
    },
    {
      title: { en: "The tenant id lives in the URL — never in the JWT", ko: "테넌트 ID는 URL에 — JWT에는 절대" },
      body: {
        en: 'Claims go stale; role changes and dismissals must bite instantly, so membership is resolved per request. On the frontend the tenant id never reaches the browser URL either — an httpOnly cookie injects it at the BFF. Three different answers to "where does the tenant id live", each on purpose.',
        ko: '클레임은 낡습니다. 역할 변경과 해촉은 즉시 반영돼야 하므로 소속은 매 요청 해석합니다. 프론트에서도 테넌트 ID는 브라우저 URL에 닿지 않습니다 — httpOnly 쿠키가 BFF에서 주입합니다. "테넌트 ID는 어디에 사는가"에 대한 서로 다른 세 가지 답, 전부 의도된 것입니다.',
      },
    },
    {
      title: { en: "PII encryption in nine zero-downtime steps", ko: "9단계 무중단 PII 암호화" },
      body: {
        en: "AES-256-GCM breaks equality search and UNIQUE — an HMAC blind index restores both. Shipped expand→contract on a rolling deploy: feature gates, dual writes, batch backfill, read-path switch — nine steps, each a traceable commit, each reversible without a redeploy.",
        ko: "AES-256-GCM은 동등 검색과 UNIQUE를 깨뜨립니다 — HMAC 블라인드 인덱스가 둘 다 복원합니다. 롤링 배포 위에서 expand→contract로 출시: 피처 게이트, 이중 쓰기, 배치 백필, 읽기 경로 전환 — 9단계, 단계마다 추적 가능한 커밋, 단계마다 재배포 없이 롤백 가능.",
      },
    },
  ],
  footerCta: {
    title: { en: "Writing on what Moty taught me", ko: "Moty가 가르쳐준 것들" },
    sub: {
      en: "Zero-downtime PII encryption, solo contract discipline, a 9.7MB font hunt, −58% AWS with guardrails — and more as the series grows.",
      ko: "무중단 PII 암호화, 1인 풀스택의 계약 규율, 9.7MB 폰트 추적기, 가드레일을 갖춘 AWS −58% — 그리고 계속 이어지는 연재.",
    },
    seriesHref: "", // TODO: "/writing/moty-pii-encryption-rollout" once published — section hidden until then
  },
};

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  muroom: MUROOM,
  moty: MOTY,
};

export function pick(l: L, locale: string): string {
  return locale === "ko" ? l.ko : l.en;
}
