// 데모 정지 프레임. 장면 1~7 을 이루는 화면 상태와 폰 아래 자막이다.
// 3번 커밋에서 스토리 시계가 같은 상태를 시간에 맞춰 고른다. 배포 빌드의 정지 화면은 POSTER_FRAME 이다.
export type DemoFrameId =
    | "shorts"
    | "share-sheet"
    | "saving"
    | "saved"
    | "archive-analyzing"
    | "archive-resolved"
    | "archive-later"
    | "map"
    | "notified"
    | "shade"
    | "detail";

export type DemoFrame = {
    id: DemoFrameId;
    scene: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    label: string;
    caption: string;
};

const SHARE = "Shorts에서 마음에 든 곳을 공유해요";
const FOUND = "어디인지 찾으면 기억 탭에 남아요";
const LATER = "3주 뒤, 사진이 조금 바래 있어요";
const NEARBY = "그 근처에 가면 다시 꺼내드려요";
const RESTORED = "누르면 원래 색으로 돌아와요";

export const DEMO_FRAMES: readonly DemoFrame[] = [
    { id: "shorts", scene: 1, label: "Shorts", caption: SHARE },
    { id: "share-sheet", scene: 1, label: "공유 시트", caption: SHARE },
    { id: "saving", scene: 2, label: "저장 중", caption: SHARE },
    { id: "saved", scene: 2, label: "저장함", caption: SHARE },
    { id: "archive-analyzing", scene: 3, label: "분석 중", caption: FOUND },
    { id: "archive-resolved", scene: 3, label: "장소 확정", caption: FOUND },
    { id: "archive-later", scene: 4, label: "3주 뒤", caption: LATER },
    { id: "map", scene: 5, label: "지도", caption: NEARBY },
    { id: "notified", scene: 6, label: "알림 아이콘", caption: NEARBY },
    { id: "shade", scene: 6, label: "알림창", caption: NEARBY },
    { id: "detail", scene: 7, label: "상세", caption: RESTORED },
];

export const POSTER_FRAME: DemoFrameId = "detail";

export function frameById(id: DemoFrameId): DemoFrame {
    const frame = DEMO_FRAMES.find((item) => item.id === id);
    if (frame == null) throw new Error(`프레임 ${id} 가 없다`);
    return frame;
}
