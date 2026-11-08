// 재생 제어. 데모에서 누를 수 있는 곳은 이 두 버튼뿐이다(폰 화면은 inert).
// PhoneFrame 의 자막 줄 양옆에 놓인다(CSS grid 영역 play · replay). 아이콘만 보이고 aria-label · title 로 이름을 준다.
// 준비 전 · 동작 줄이기 · 불러오기 실패에서는 둘 다 비활성이다.
import { Pause, Play, RotateCcw } from "lucide-react";

import type { useDemoPlayback } from "./useDemoPlayback";

type Props = {
    playback: ReturnType<typeof useDemoPlayback>;
};

const ICON = { size: 18, strokeWidth: 1.75 } as const;

export function DemoControls({ playback }: Props) {
    const { ready, playing, reduced, failed } = playback;
    const disabled = !ready || reduced || failed;
    const reason = reduced
        ? "동작 줄이기 설정이라 재생하지 않아요"
        : failed
          ? "데모를 불러오지 못했어요"
          : undefined;
    const playLabel = playing ? "데모 일시정지" : "데모 재생";
    return (
        <>
            <button
                type="button"
                className="demo-control demo-control--play"
                onClick={playback.toggle}
                disabled={disabled}
                aria-label={playLabel}
                title={reason ?? playLabel}
            >
                {playing ? <Pause {...ICON} /> : <Play {...ICON} />}
            </button>
            <button
                type="button"
                className="demo-control demo-control--replay"
                onClick={playback.replay}
                disabled={disabled}
                aria-label="데모 다시 보기"
                title={reason ?? "데모 다시 보기"}
            >
                <RotateCcw {...ICON} />
            </button>
        </>
    );
}
