// S3 화면 상태(view)와 그리기. 03 분석 중 → 02 되묻기(첫 행 선택, saving 이면 "저장하고 있어요") → 08(저장 결과에서 바로 연 08).
// 08 은 방금 저장한 성심당 본점이라 저장 시점이 "방금"이고 원래 색이다. 저장 결과에서 연 08 이라 미니 핀은 없다(앱 ContentDetailScreen).
import { DetailScene } from "../screens/DetailScene";
import { s3Options, s3Video, sungsimdang } from "../screens/data";
import { optionViews } from "../screens/saveResult";
import { SaveResultScene } from "../screens/SaveResultScene";

export type View =
    | { kind: "analyzing" }
    | { kind: "confirm"; saving: boolean }
    | { kind: "detail" };

const OPTIONS = optionViews(s3Options);
const DETAIL = { ...sungsimdang, time: "방금" };

export function Screen({ view }: { view: View }) {
    switch (view.kind) {
        case "analyzing":
            return <SaveResultScene state="analyzing" source={s3Video} />;
        case "confirm":
            return (
                <SaveResultScene
                    state="confirm"
                    source={s3Video}
                    options={OPTIONS}
                    selected={0}
                    saving={view.saving}
                />
            );
        case "detail":
            return <DetailScene fade="recent" detail={DETAIL} />;
    }
}
