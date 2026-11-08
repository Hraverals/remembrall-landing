// 프레임 id → 폰 화면(360×800). 장면 컴포넌트에 넘기는 값만 여기서 정한다.
import { DEMO_LATER, DEMO_NOW } from "./data";
import type { DemoFrameId } from "./frames";
import { ArchiveScene } from "./scenes/ArchiveScene";
import { DetailScene } from "./scenes/DetailScene";
import { MapScene } from "./scenes/MapScene";
import { NotificationShade } from "./scenes/NotificationShade";
import { ReceivedScene } from "./scenes/ReceivedScene";
import { ShortsScene } from "./scenes/ShortsScene";

export function DemoScreen({ frame }: { frame: DemoFrameId }) {
    switch (frame) {
        case "shorts":
            return <ShortsScene shareSheet={false} />;
        case "share-sheet":
            return <ShortsScene shareSheet />;
        case "saving":
            return <ReceivedScene status="saving" />;
        case "saved":
            return <ReceivedScene status="saved" />;
        case "archive-analyzing":
            return <ArchiveScene now={DEMO_NOW} analyzing />;
        case "archive-resolved":
            return <ArchiveScene now={DEMO_NOW} analyzing={false} />;
        case "archive-later":
            return <ArchiveScene now={DEMO_LATER} analyzing={false} />;
        case "map":
            return <MapScene now={DEMO_LATER} walk={0} notified={false} />;
        case "notified":
            return <MapScene now={DEMO_LATER} walk={1} notified />;
        case "shade":
            return (
                <>
                    <MapScene now={DEMO_LATER} walk={1} notified />
                    <NotificationShade now={DEMO_LATER} />
                </>
            );
        case "detail":
            return <DetailScene fade="recent" />;
    }
}
