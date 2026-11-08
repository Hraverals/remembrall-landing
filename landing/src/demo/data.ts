// 데모 목 데이터. 앱 레포 frontend/src/shared/api/mock 을 따른다.
// - 장소 이름 · 주소 · 좌표 · 사진 · 메모 · 태그: placeDetails.ts (사진이 있는 목은 이것뿐이다)
// - 지금 위치: mapView.ts 의 current(대전 중구 대흥동)
// 기준 날짜는 고정이다. T0 에 성심당 Shorts 를 공유하고, 장면 4~7 은 3주 뒤(T0 + 21일)다.
// 저장 시점은 placeDetails 의 time 을 T0 기준으로 둔다(성심당만 이번에 새로 저장한다).
// 08 은 알림으로 연 경로라 다른 저장 장소 미니 핀은 그리지 않는다.
import type { PhotoId } from "../assets/photos";
import type { DemoSave } from "./album";
import type { LatLng } from "./geo";

export const DEMO_NOW = new Date(2026, 10, 8, 14, 14);
export const DEMO_LATER = new Date(2026, 10, 29, 14, 14);

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

// 08 지도 위 좌표(360×800 논리 px). 08 은 지금 위치와 장소를 함께 맞춘 확대라 지도 탭과 배율이 다르다.
export const detailMap = {
    place: { x: 232, y: 214 },
    current: { x: 108, y: 262 },
} as const;
