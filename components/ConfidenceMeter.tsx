export function ConfidenceMeter({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="meterBlock">
      <div className="meterHeader"><span>{label}</span><strong>{value}</strong></div>
      <div className="meterTrack"><div className="meterFill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
      {note ? <p>{note}</p> : null}
    </div>
  );
}
