import { STAGE_MAP } from "../lib/stages";

export default function StageBadge({ stageId, size = "sm" }) {
  const stage = STAGE_MAP[stageId];
  if (!stage) return null;

  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 gap-1.5"
      : "text-xs px-2.5 py-1 gap-2";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono uppercase tracking-wide bg-ink/[0.05] text-ink-soft ${sizeClasses}`}
    >
      <span
        className="rounded-full shrink-0"
        style={{
          backgroundColor: stage.dot,
          width: size === "sm" ? 6 : 7,
          height: size === "sm" ? 6 : 7,
        }}
      />
      {stage.label}
    </span>
  );
}
