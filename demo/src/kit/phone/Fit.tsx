// 크기 맞춤 바깥 상자. height 를 주면 그 높이(폭은 ratio 로)이고, 없으면 부모 상자의 가로 · 세로 안에 contain 한다(kit.css .rmd-fit).
// 이 상자가 .rmd-root(토큰 범위)이고 재생 훅의 root(보임 판정 · 마크업 찾기)다. data-rmd-ready 는 GSAP 이 준비됐다는 표시다(스크린샷 도구용).
import type { CSSProperties, ReactNode, Ref } from "react";

type Props = {
    ratio: number;
    height?: number;
    label: string;
    ready: boolean;
    rootRef: Ref<HTMLDivElement>;
    children: ReactNode;
};

export function Fit({ ratio, height, label, ready, rootRef, children }: Props) {
    const style = {
        "--rmd-ratio": String(ratio),
        ...(height == null ? {} : { width: height * ratio, height }),
    } as CSSProperties;
    return (
        <div
            ref={rootRef}
            className="rmd-root rmd-fit"
            role="img"
            aria-label={label}
            style={style}
            data-rmd-ready={ready ? "" : undefined}
        >
            <div className="rmd-fit__box">{children}</div>
        </div>
    );
}
