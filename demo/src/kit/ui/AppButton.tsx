// 앱 버튼. 앱 C/Button 의 Primary · Text. 높이 48, radius md, Label/Button.
// disabled: Primary 는 brand/primary-disabled 바탕 · text/on-subtle 글자, Text 는 text/disabled 글자.
import type { CSSProperties } from "react";

type Props = {
    kind: "primary" | "text";
    label: string;
    disabled?: boolean;
};

export function AppButton({ kind, label, disabled = false }: Props) {
    const look: CSSProperties =
        kind === "primary"
            ? {
                  background: disabled
                      ? "var(--brand-primary-disabled)"
                      : "var(--brand-primary)",
                  color: disabled
                      ? "var(--text-on-subtle)"
                      : "var(--text-on-primary)",
              }
            : {
                  color: disabled
                      ? "var(--text-disabled)"
                      : "var(--text-on-subtle)",
              };
    return <div style={{ ...base, ...look }}>{label}</div>;
}

const base: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    paddingInline: 20,
    borderRadius: "var(--radius-md)",
    font: "var(--type-label-button)",
};
