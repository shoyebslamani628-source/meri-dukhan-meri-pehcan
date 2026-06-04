const StatCard = ({ title, value, icon: Icon, tone = "cyan", note }) => {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700"
  };

  return (
    <div className="surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
          {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-md p-3 ${tones[tone] || tones.cyan}`}>
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;

