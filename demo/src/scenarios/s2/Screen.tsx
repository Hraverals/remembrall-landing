// S2 화면 상태(view)와 그리기. 장면은 scenarios/screens 의 landing 장면을 그대로 쓴다.
import { ArchiveScene } from "../screens/ArchiveScene";
import { ReceivedScene } from "../screens/ReceivedScene";
import { DEMO_NOW } from "../screens/data";
import { ShortsScene } from "../screens/ShortsScene";

export type View =
    | { kind: "shorts"; sheet: number }
    | {
          kind: "received";
          status: "saving" | "saved";
          enter: number;
          text: number;
      }
    | { kind: "archive"; analyzing: boolean };

export function Screen({ view }: { view: View }) {
    switch (view.kind) {
        case "shorts":
            return <ShortsScene sheet={view.sheet} />;
        case "received":
            return (
                <ReceivedScene
                    status={view.status}
                    enter={view.enter}
                    text={view.text}
                />
            );
        case "archive":
            return <ArchiveScene now={DEMO_NOW} analyzing={view.analyzing} />;
    }
}
