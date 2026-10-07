/** Marks a dashboard view whose numbers are illustrative until analytics exist. */
export function SampleDataBadge() {
  return (
    <span
      title="This view shows example data until analytics are connected."
      className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700"
    >
      Sample data
    </span>
  );
}
