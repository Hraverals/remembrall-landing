// 폰 화면 영역의 실제 폭 / 논리 폭 360. 화면 안은 360×800 으로 그리고 이 배율로 transform 한다.
// 재기 전에는 0 이라 캔버스가 그려지지 않는다(배율 1 로 한 번 번쩍이지 않게).
import { type RefObject, useEffect, useState } from "react";

export const SCREEN_WIDTH = 360;
export const SCREEN_HEIGHT = 800;

export function usePhoneScale(ref: RefObject<HTMLElement | null>): number {
    const [scale, setScale] = useState(0);
    useEffect(() => {
        const element = ref.current;
        if (element == null) return;
        const observer = new ResizeObserver(([entry]) => {
            if (entry != null && entry.contentRect.width > 0) {
                setScale(entry.contentRect.width / SCREEN_WIDTH);
            }
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);
    return scale;
}
