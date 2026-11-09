// 무대 옆 설명: 번호 붙은 단계 목록(S3 저장 파이프라인 · S6 퍼널). 1920×1080 무대의 옆 칸(800×860) 안, 논리 px.
// lit: 단계마다 켜진 정도 0~1(아직이면 0.3 으로 흐리게). 강조색은 쓰지 않고 불투명도로만 켠다.
// 값(value)이 있는 단계는 줄 오른쪽에 숫자를 두고 values 로 불투명도를 준다(S6 비트 3, 15 화면 숫자와 같은 데이터).
// header: 칸 맨 위 머리말(겹쳐 두고 불투명도로 크로스페이드). 목록 배치에는 영향을 주지 않는다.
import type { CSSProperties } from "react";

export type Step = { title: string; detail: string; value?: string };

type Props = {
    steps: readonly Step[];
    lit: readonly number[];
    values?: readonly number[];
    header?: readonly { text: string; opacity: number }[];
};

const DIM = 0.3;

export function StepsAside({ steps, lit, values, header }: Props) {
    return (
        <>
            {header != null && (
                <div style={styles.header}>
                    {header.map((item) => (
                        <span
                            key={item.text}
                            style={{
                                ...styles.headerText,
                                opacity: item.opacity,
                            }}
                        >
                            {item.text}
                        </span>
                    ))}
                </div>
            )}
            <ol style={styles.list}>
                {steps.map((step, index) => (
                    <li
                        key={step.title}
                        style={{
                            ...styles.row,
                            opacity: DIM + (1 - DIM) * (lit[index] ?? 0),
                        }}
                    >
                        <span style={styles.number}>{index + 1}</span>
                        <span style={styles.text}>
                            <span style={styles.title}>{step.title}</span>
                            <span style={styles.detail}>{step.detail}</span>
                        </span>
                        {step.value != null && (
                            <span
                                style={{
                                    ...styles.value,
                                    opacity: values?.[index] ?? 0,
                                }}
                            >
                                {step.value}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </>
    );
}

const styles = {
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        display: "grid",
    },
    headerText: {
        gridArea: "1 / 1",
        padding: "6px 16px",
        borderRadius: "var(--radius-sm)",
        background: "var(--bg-subtle)",
        color: "var(--text-on-subtle)",
        font: "500 24px / 32px var(--font-body)",
        whiteSpace: "nowrap",
    },
    list: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 56,
        height: "100%",
        margin: 0,
        padding: 0,
        listStyle: "none",
    },
    row: {
        display: "flex",
        alignItems: "baseline",
        gap: 28,
    },
    number: {
        flex: "none",
        width: 40,
        font: "400 44px / 46px var(--font-heading)",
        color: "var(--text-primary)",
    },
    text: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    title: {
        font: "500 34px / 46px var(--font-body)",
        letterSpacing: "-0.4px",
        color: "var(--text-primary)",
    },
    detail: {
        font: "400 24px / 34px var(--font-body)",
        color: "var(--text-secondary)",
    },
    value: {
        marginLeft: "auto",
        font: "400 44px / 46px var(--font-heading)",
        color: "var(--text-primary)",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
    },
} satisfies Record<string, CSSProperties>;
