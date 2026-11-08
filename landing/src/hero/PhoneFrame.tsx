// 안드로이드 폰 모형. 특정 기기를 따라 그리지 않는다.
// 안쪽 캔버스는 앱 Figma 프레임과 같은 360×800 논리 px 이고, 화면 폭에 맞춰 transform: scale 한다.
// 캔버스는 보여주기용이라 inert · aria-hidden 이고, 설명은 figure 의 라벨이 맡는다.
import { type ReactNode, useRef } from "react";

import { SCREEN_HEIGHT, SCREEN_WIDTH, usePhoneScale } from "./usePhoneScale";

type Props = {
    label: string;
    children: ReactNode;
};

export function PhoneFrame({ label, children }: Props) {
    const screen = useRef<HTMLDivElement>(null);
    const scale = usePhoneScale(screen);
    return (
        <figure className="phone" aria-label={label}>
            <div className="phone__body">
                <div ref={screen} className="phone__screen">
                    <div
                        className="phone__canvas"
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
        </figure>
    );
}
