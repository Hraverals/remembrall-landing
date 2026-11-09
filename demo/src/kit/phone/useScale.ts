// 요소의 실제 폭 / 논리 폭. 안쪽은 논리 px 로 그리고 이 배율로 transform 한다(폰 화면 360 · 무대 1920).
// 재기 전에는 0 이라 안쪽이 그려지지 않는다(배율 1 로 한 번 번쩍이지 않게). landing hero/usePhoneScale.ts 와 같다.
// 무대 안의 폰은 무대 transform 전의 레이아웃 폭으로 재므로 무대 배율과 곱해지지 않는다.
import { type RefObject, useEffect, useState } from "react";

export function useScale(
    ref: RefObject<HTMLElement | null>,
    logicalWidth: number,
): number {
    const [scale, setScale] = useState(0);
    useEffect(() => {
        const element = ref.current;
        if (element == null) return;
        const observer = new ResizeObserver(([entry]) => {
            if (entry != null && entry.contentRect.width > 0) {
                setScale(entry.contentRect.width / logicalWidth);
            }
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, logicalWidth]);
    return scale;
}
