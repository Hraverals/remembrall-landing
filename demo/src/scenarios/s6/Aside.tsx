// S6 무대 옆 설명: 추천에서 방문까지 퍼널 4단계(컨셉). 모양은 screens/StepsAside(S3 과 같이 쓴다).
// 머리말은 보는 사람을 알린다: 비트 0~2 "사용자 화면" → 비트 3 "사장님 화면"(15 로 넘어갈 때 크로스페이드).
// 값은 비트 3 에서 15 막대와 같은 시각에 나타난다. 숫자는 15 화면과 같은 데이터(partner)에서 읽는다.
import type { AsideProps } from "../../kit/engine/types";
import { partner } from "../screens/data";
import { type Step, StepsAside } from "../screens/StepsAside";

export type AsideView = {
    lit: readonly number[];
    values: readonly number[];
    // "사장님 화면"으로 바뀐 정도 0~1.
    owner: number;
};

const count = (label: string) =>
    String(partner.funnel.find((row) => row.label === label)?.count ?? 0);

const STEPS: readonly Step[] = [
    {
        title: "추천",
        detail: "저장한 곳 근처의 새 영상",
        value: partner.viewers.toLocaleString("ko-KR"),
    },
    { title: "저장", detail: "마음에 들면 기억 탭에", value: count("저장") },
    {
        title: "근처 도착",
        detail: "지나갈 때 알림",
        value: count("근처 도착 알림"),
    },
    {
        title: "혜택 사용",
        detail: "계산할 때 화면을 보여 주기",
        value: count("도착 혜택 사용"),
    },
];

export function Aside({ view }: AsideProps<AsideView>) {
    return (
        <StepsAside
            steps={STEPS}
            lit={view.lit}
            values={view.values}
            header={[
                { text: "사용자 화면", opacity: 1 - view.owner },
                { text: "사장님 화면", opacity: view.owner },
            ]}
        />
    );
}
