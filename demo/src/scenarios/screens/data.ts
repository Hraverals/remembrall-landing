// 데모 목 데이터. 앱 레포 frontend/src/shared/api/mock 을 따른다.
// - 장소 이름 · 주소 · 좌표 · 사진 · 메모 · 태그: placeDetails.ts (사진이 있는 목은 이것뿐이다)
// - 지금 위치: mapView.ts 의 current(대전 중구 대흥동)
// 기준 날짜는 고정이다. T0 에 성심당 Shorts 를 공유하고, 장면 4~7 은 3주 뒤(T0 + 21일)다.
// 저장 시점은 placeDetails 의 time 을 T0 기준으로 둔다(성심당만 이번에 새로 저장한다).
// 08 은 알림으로 연 경로라 다른 저장 장소 미니 핀은 그리지 않는다.
import type { PhotoId } from "../../kit/assets/photos";
import type { DemoSave } from "./album";
import type { LatLng } from "../../kit/ui/geo";

export const DEMO_NOW = new Date(2026, 10, 8, 14, 14);
export const DEMO_LATER = new Date(2026, 10, 29, 14, 14);
// S4 셋째 시점(T0 + 5개월). 해가 바뀌어 섹션이 "지난해 가을 · 여름"이 된다. 그동안 새 저장은 없다고 둔다.
export const DEMO_MONTHS_LATER = new Date(2027, 3, 8, 14, 14);

function daysBefore(days: number): Date {
    return new Date(DEMO_NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

function monthsBefore(months: number): Date {
    const date = new Date(DEMO_NOW);
    date.setMonth(date.getMonth() - months);
    return date;
}

// 기억 탭 저장물(최신 저장순). 모두 9개.
export const saves: readonly DemoSave[] = [
    {
        id: "sungsimdang",
        place: "성심당 본점",
        photo: 1080,
        savedAt: DEMO_NOW,
    },
    {
        id: "sojedong",
        place: "소제동 카페거리",
        photo: 312,
        savedAt: daysBefore(4),
    },
    {
        id: "afternoon-four",
        place: "오후 네시",
        photo: 1060,
        savedAt: daysBefore(14),
    },
    {
        id: "daeheung-cathedral",
        place: "대흥동 성당",
        photo: 488,
        savedAt: daysBefore(42),
    },
    {
        id: "skyroad",
        place: "으능정이 스카이로드",
        photo: 674,
        savedAt: monthsBefore(4),
    },
    {
        id: "old-chungnam-office",
        place: "옛 충남도청",
        photo: 1031,
        savedAt: monthsBefore(4),
    },
    {
        id: "hanbat-kalguksu",
        place: "한밭 손칼국수",
        photo: 292,
        savedAt: monthsBefore(5),
    },
    {
        id: "jungang-market",
        place: "대전 중앙시장",
        photo: 1036,
        savedAt: monthsBefore(5),
    },
    {
        id: "gyejoksan",
        place: "계족산 황톳길",
        photo: 1015,
        savedAt: monthsBefore(5),
    },
];

// 장소 좌표(placeDetails · 저장물 목과 같다).
export const coordinates: Readonly<Record<string, LatLng>> = {
    sungsimdang: { lat: 36.3277, lng: 127.4274 },
    sojedong: { lat: 36.334, lng: 127.4385 },
    "afternoon-four": { lat: 36.3244, lng: 127.4246 },
    "daeheung-cathedral": { lat: 36.3256, lng: 127.4222 },
    skyroad: { lat: 36.3292, lng: 127.4282 },
    "old-chungnam-office": { lat: 36.3275, lng: 127.4204 },
    "hanbat-kalguksu": { lat: 36.3229, lng: 127.4263 },
    "jungang-market": { lat: 36.3289, lng: 127.4331 },
    gyejoksan: { lat: 36.3958, lng: 127.4466 },
};

// 지도 탭의 지금 위치. 걷기는 여기서 성심당 쪽으로 WALK_END 만큼 간다(그 근처에서 알림이 온다).
export const walkStart: LatLng = { lat: 36.3262, lng: 127.4248 };
export const WALK_END = 0.7;

// Shorts 화면 · 공유 시트(placeDetails 성심당의 sourceMeta · sourceTitle).
export const shorts = {
    photo: 1080 satisfies PhotoId,
    channel: "@daejeon.bread",
    title: "대전 가면 꼭 들르는 빵집 3곳",
    likes: "1.2천",
    comments: "48",
} as const;

// 안드로이드 화면(공유 시트 · 알림 머리글)에 보이는 앱 이름. app.json 의 name 이다.
export const ANDROID_APP_NAME = "Remembrall";

export const sungsimdang = {
    time: "3주 전",
    place: "성심당 본점",
    address: "대전 중구 은행동",
    walk: "도보 4분",
    photo: 1080 satisfies PhotoId,
    note: "튀김소보로는 오전에 가면 줄이 짧다. 부추빵도 같이 사라고 함. 2층 카페는 주말 오후에 자리가 거의 없고, 포장만 할 거면 1층 계산대 오른쪽 줄이 따로 있다고 한다. 명란바게트는 오후 3시 전에 자주 품절된다고 함.",
    tags: ["줄서는", "오전", "빵집"],
    sourceMeta: "@daejeon.bread · YouTube Shorts",
} as const;

// S3 원본 영상(지어낸 Shorts). 영상에 지점명이 나오지 않아 성심당 지점 중 어디인지 되묻는다.
export const s3Video = {
    photo: 1080 satisfies PhotoId,
    title: "대전 빵지순례 1순위",
    handle: "@daejeon.bread",
} as const;

// S3 되묻기 선택지(서버 ConfirmCandidateResponse.options 모양). 앱 Figma 02 목과 같은 두 지점(실제 지점)이다.
// 주소는 LocationIQ 형식 원문이고 화면에는 shortAddress 로 다듬은 형태가 나온다(우편번호는 보이지 않는다).
export const s3Options = [
    {
        candidateId: "sungsimdang-main",
        name: "성심당 본점",
        branchName: null,
        address:
            "성심당 본점, 대종로480번길, 은행동, 중구, 대전, 34917, 대한민국",
    },
    {
        candidateId: "sungsimdang-dcc",
        name: "성심당 DCC점",
        branchName: null,
        address:
            "성심당 DCC점, 엑스포로, 도룡동, 유성구, 대전, 34126, 대한민국",
    },
] as const;

// 08 지도 위 좌표(360×800 논리 px). 08 은 지금 위치와 장소를 함께 맞춘 확대라 지도 탭과 배율이 다르다.
export const detailMap = {
    place: { x: 232, y: 214 },
    current: { x: 108, y: 262 },
} as const;

// ── S6 추천에서 방문까지(BM 컨셉) ───────────────────────────────────────────────
// 앱에 없는 컨셉 화면이다(처음 브리프의 S6 화면 명세). 장소 · 채널 이름은 모두 지어낸 이름이고 숫자는 설명용 예시다.
// 흐름: T0 에 추천(14)에서 광고 카드 "오후 네시"를 저장 → 2주 뒤(T0 + 14일) 그 근처에서 알림 → 08d.
// 기존 데모 저장물의 오후 네시(2주 전 저장)는 S6 에서는 빼고, 추천에서 T0 에 새로 저장한 것으로 둔다.
export const DEMO_TWO_WEEKS_LATER = new Date(2026, 10, 22, 14, 14);

// 07e 기억 탭(오후 네시 뺀 8개).
export const s6ArchiveSaves: readonly DemoSave[] = saves.filter(
    (save) => save.id !== "afternoon-four",
);

// 2주 뒤 지도 · 알림: 추천에서 T0 에 저장한 오후 네시가 맨 앞(최신)이다.
export const s6AdSave: DemoSave = {
    id: "afternoon-four",
    place: "오후 네시",
    photo: 1060,
    savedAt: DEMO_NOW,
};
export const s6MapSaves: readonly DemoSave[] = [s6AdSave, ...s6ArchiveSaves];

export type RecommendCard = {
    id: string;
    name: string;
    photo: PhotoId;
    walk: string;
    // 광고 카드만 있다: 썸네일 왼쪽 위 "광고" 배지 · 이름 아래 한 줄.
    ad?: { line: string };
};

export type RecommendSection = {
    area: string;
    reason: string;
    cards: readonly RecommendCard[];
};

// 07e 진입 줄.
export const recommendEntry = {
    title: "저장한 곳 근처의 새 영상 6개",
    areas: "은행동 · 소제동",
    photos: [490, 1060, 444] satisfies PhotoId[],
} as const;

// 14 추천. 광고 카드 id 는 AD_CARD_ID.
export const AD_CARD_ID = "afternoon-four";
export const recommendSections: readonly RecommendSection[] = [
    {
        area: "은행동",
        reason: "성심당 본점 외 2곳을 저장해서",
        cards: [
            {
                id: "corner-kalguksu",
                name: "모퉁이 칼국수",
                photo: 490,
                walk: "성심당에서 도보 5분",
            },
            {
                id: AD_CARD_ID,
                name: "오후 네시",
                photo: 1060,
                walk: "성심당에서 도보 7분",
                ad: { line: "도착하면 음료 한 잔" },
            },
            {
                id: "alley-books",
                name: "골목 끝 서점",
                photo: 444,
                walk: "성심당에서 도보 9분",
            },
        ],
    },
    {
        area: "소제동",
        reason: "소제동 카페거리 외 1곳을 저장해서",
        cards: [
            {
                id: "rail-garden",
                name: "철길 옆 정원",
                photo: 478,
                walk: "소제동 카페거리에서 도보 3분",
            },
            {
                id: "gwansa-dessert",
                name: "관사촌 디저트",
                photo: 431,
                walk: "소제동 카페거리에서 도보 4분",
            },
            {
                id: "soje-gukbap",
                name: "소제 국밥",
                photo: 326,
                walk: "소제동 카페거리에서 도보 6분",
            },
        ],
    },
];

// 08d 오후 네시 상세(도착해서 연 08).
export const afternoonFour = {
    time: "2주 전",
    place: "오후 네시",
    address: "대전 중구 은행동",
    walk: "도보 2분",
    photo: 1060 satisfies PhotoId,
    note: "아인슈페너가 유명하다. 해 질 무렵 창가 자리가 예쁘다고 함.",
    tags: ["카페", "디저트", "창가"],
    sourceMeta: "@daejeon.cafe · YouTube Shorts",
    badge: "광고",
    benefit: {
        label: "도착 혜택",
        title: "아메리카노 한 잔을 드려요",
        note: "오늘 자정까지 · 계산할 때 이 화면을 보여 주세요",
    },
} as const;

// 08d 지도: 지금 위치가 장소에 더 가깝다(도보 2분). 도착 혜택 카드로 시트가 높아져(지도가 약 190 까지 보인다)
// 핀 · 이름표 · 지금 위치를 성심당 08 보다 위로 올려 시트에 가리지 않게 한다.
export const afternoonFourMap = {
    place: { x: 236, y: 146 },
    current: { x: 176, y: 118 },
} as const;

// 15 광고주 성과. 저장 대비 비율은 화면에서 반올림한다(41 → 32%, 23 → 18%, 9 → 7%).
export const partner = {
    caption: "REMEMBRALL 파트너",
    name: "오후 네시",
    period: "최근 30일 · 추천에서 본 사람 1,240명",
    viewers: 1240,
    funnelTitle: "저장에서 방문까지",
    funnel: [
        { label: "저장", count: 128 },
        { label: "근처 도착 알림", count: 41 },
        { label: "상세 열람", count: 23 },
        { label: "도착 혜택 사용", count: 9 },
    ],
    videosTitle: "이 영상으로 저장됐어요",
    videos: [
        {
            handle: "@daejeon.cafe",
            stats: "저장 86 · 근처 도착 29",
            photo: 1060 satisfies PhotoId,
        },
        {
            handle: "@weekend.daejeon",
            stats: "저장 42 · 근처 도착 12",
            photo: 431 satisfies PhotoId,
        },
    ],
    note: "숫자는 설명을 위한 예시예요.",
} as const;

// 저장(퍼널 첫 줄) 대비 비율. 15 화면과 S6 옆 설명이 같이 쓴다.
export const SAVES_BASE = partner.funnel[0]?.count ?? 1;

export function percentOfSaves(count: number): number {
    return Math.round((count / SAVES_BASE) * 100);
}
