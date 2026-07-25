export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 border border-dashed border-line rounded-card">
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-ink/[0.05] flex items-center justify-center mb-4">
          <Icon size={18} strokeWidth={1.5} className="text-ink-soft" />
        </div>
      )}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && (
        <p className="text-sm text-ink-soft mt-1.5 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
