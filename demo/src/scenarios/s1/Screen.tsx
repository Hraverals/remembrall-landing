// S1 화면 상태(view)와 그리기. Remembrall 화면은 하나도 나오지 않는다(앱이 없을 때).
// pile: 일반 '저장한 영상' 목록에 새 영상이 쌓인다. pass: 일반 지도에서 사람 점이 저장했던 곳 앞을 지나친다.
import { PassByScene } from "../screens/PassByScene";
import { SavedVideosScene } from "../screens/SavedVideosScene";

export type View =
    | { kind: "pile"; added: number }
    | { kind: "pass"; walk: number; mark: number };

export function Screen({ view }: { view: View }) {
    switch (view.kind) {
        case "pile":
            return <SavedVideosScene added={view.added} />;
        case "pass":
            return <PassByScene walk={view.walk} mark={view.mark} />;
    }
}
