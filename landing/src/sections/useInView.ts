// 요소가 threshold 비율 이상 보이면 true. 한 번 true 가 되면 그대로 둔다(한 번만 움직이는 연출용). GSAP 와 상관없다.
import { type RefObject, useEffect, useState } from "react";

export function useInView(
    ref: RefObject<Element | null>,
    threshold: number,
): boolean {
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        const element = ref.current;
        if (element == null || seen) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) setSeen(true);
            },
            { threshold },
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, threshold, seen]);
    return seen;
}
