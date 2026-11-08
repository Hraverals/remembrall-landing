// 안드로이드 폰 모형. 특정 기기를 따라 그리지 않는다.
// 안쪽 캔버스는 앱 Figma 프레임과 같은 360×800 논리 px 이고, 화면 폭에 맞춰 transform: scale 한다.
// 캔버스는 보여주기용이라 inert · aria-hidden 이고, 설명은 figure 의 라벨이 맡는다.
// 몸체(data-demo-camera)는 카메라가 살짝 확대 · 기울인다. 그 아래 진행 막대, 그 아래 [재생] 자막 [다시 보기] 한 줄.
// 자막은 겹쳐 두고 불투명도로 크로스페이드한다(줄 높이 고정). 라벨이 이미 설명하므로 aria-hidden 이다.
import { type ReactNode, useRef } from "react";

import type { DemoSnapshot } from "../demo/story";
import { SCREEN_HEIGHT, SCREEN_WIDTH, usePhoneScale } from "./usePhoneScale";

type Props = {
    label: string;
    captions: DemoSnapshot["captions"];
    controls: ReactNode;
    children: ReactNode;
};

export function PhoneFrame({ label, captions, controls, children }: Props) {
    const screen = useRef<HTMLDivElement>(null);
    const scale = usePhoneScale(screen);
    return (
        <figure className="phone" aria-label={label}>
            <div className="phone__body" data-demo-camera>
                <div ref={screen} className="phone__screen">
                    <div
                        className="phone__canvas"
                        data-demo-canvas
                        style={{
                            width: SCREEN_WIDTH,
                            height: SCREEN_HEIGHT,
                            transform: `scale(${scale})`,
                        }}
                        aria-hidden="true"
                        inert
                    >
                        {children}
                    </div>
                </div>
            </div>
            <div className="phone__progress" aria-hidden="true">
                <span data-demo-progress />
            </div>
            <div className="phone__meta">
                {controls}
                <div className="phone__captions" aria-hidden="true">
                    {captions.map((caption) => (
                        <p
                            key={caption.text}
                            className="phone__caption"
                            style={{ opacity: caption.opacity }}
                        >
                            {caption.text}
                        </p>
                    ))}
                </div>
            </div>
        </figure>
    );
}
