// 데모 목 데이터. 앱 레포 frontend/src/shared/api/mock/placeDetails.ts 의 성심당(08 · 08c)과 같다.
// 08 은 알림으로 연 경로(SavedPlaceDetail)라 다른 저장 장소 미니 핀은 그리지 않는다.
import type { PhotoId } from "../assets/photos";

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

// 08 지도 위 좌표(360×800 논리 px). 장소 핀은 좌표 위로 솟고, 이름표는 좌표 아래에 붙는다.
export const detailMap = {
    place: { x: 232, y: 214 },
    current: { x: 108, y: 262 },
} as const;
