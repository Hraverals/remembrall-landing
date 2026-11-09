// 앱 버튼. 앱 C/Button 의 Primary · Secondary · Text. 높이 48, radius md, Label/Button.
// Secondary: bg/surface 바탕 · border/default 테두리 1 · text/primary 글자(앱 shared/ui/Button).
// disabled: Primary 는 brand/primary-disabled 바탕 · text/on-subtle 글자, Secondary · Text 는 text/disabled 글자.
import type { CSSProperties } from "react";

type Props = {
    kind: "primary" | "secondary" | "text";
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
            : kind === "secondary"
              ? {
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    color: disabled
                        ? "var(--text-disabled)"
                        : "var(--text-primary)",
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
