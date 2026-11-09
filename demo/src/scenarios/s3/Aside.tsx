// S3 무대 옆 설명: 저장 파이프라인 4단계. 앱 레포 backend 의 실제 순서(SavePipelineService)와 맞춘 문구다.
//   ① YoutubeMetadataClient: 제목 · 설명 · 태그 · 채널 소유자 댓글
//   ② VideoContentAnalyzer: AI 가 영상 자체를 보고(1 의 텍스트는 참고) 상호명 · 지점명 · 지역을 나눠 뽑는다
//   ③ PlaceResolver + KakaoPlaceLookup: 지도 검색 · 공공 상가정보로 실제 업소를 대조하고 카카오 장소로 검증한다
//   ④ 확신이 없고 후보가 3곳 이하(MAX_CONFIRMATION_CANDIDATES)일 때만 되묻는다
// 서비스 이름은 넣지 않는다(기술 이름은 아키텍처 슬라이드가 맡는다). 모양은 screens/StepsAside(S6 과 같이 쓴다).
// view.lit: 단계마다 켜진 정도 0~1.
import type { AsideProps } from "../../kit/engine/types";
import { StepsAside } from "../screens/StepsAside";

export type AsideView = { lit: readonly number[] };

const STEPS = [
    {
        title: "영상 정보 가져오기",
        detail: "제목 · 설명 · 태그 · 채널 주인이 단 댓글",
    },
    {
        title: "AI가 영상을 보고 장소 후보 찾기",
        detail: "가게 이름 · 지점 · 지역을 나눠서",
    },
    {
        title: "실제 있는 곳인지 확인",
        detail: "지도 검색과 공공 상가정보, 카카오 장소로 맞춰 봐요",
    },
    {
        title: "확실하지 않으면 물어보기",
        detail: "후보를 3곳 이하로 좁혀서 물어봐요",
    },
] as const;

export function Aside({ view }: AsideProps<AsideView>) {
    return <StepsAside steps={STEPS} lit={view.lit} />;
}
