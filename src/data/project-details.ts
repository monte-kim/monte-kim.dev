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

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  muroom: MUROOM,
};

export function pick(l: L, locale: string): string {
  return locale === "ko" ? l.ko : l.en;
}
