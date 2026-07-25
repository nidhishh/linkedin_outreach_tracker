export default function StatCard({ label, value, tone = "ink", icon: Icon }) {
  const toneClasses = {
    ink: "text-ink",
    rust: "text-rust",
    brass: "text-brass-dark",
    teal: "text-teal-dark",
    sage: "text-sage",
  };

  return (
    <div className="bg-surface border border-line rounded-card px-5 py-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wide text-ink-soft">
          {label}
        </span>
        {Icon && <Icon size={14} strokeWidth={1.75} className="text-ink-faint" />}
      </div>
      <p className={`font-display text-3xl mt-1.5 ${toneClasses[tone]}`}>
        {value}
      </p>
    </div>
  );
}
