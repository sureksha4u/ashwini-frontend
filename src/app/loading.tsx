export default function Loading() {
  const Sk = ({ w, h = 12, r = 4, full }: { w?: string | number; h?: number; r?: number; full?: boolean }) => (
    <div
      className="animate-pulse bg-surface-3 rounded"
      style={{ width: full ? "100%" : w, height: h, borderRadius: r }}
    />
  );

  return (
    <div className="flex-1 p-7 flex flex-col gap-4">
      <Sk w={220} h={28} />
      <Sk w={420} h={14} />
      <div className="flex gap-4 mt-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 bg-surface-1 border border-border-subtle rounded-xl p-4 flex flex-col gap-2">
            <Sk w="60%" h={9} />
            <Sk w="80%" h={28} />
            <Sk w="40%" h={10} />
          </div>
        ))}
      </div>
      <div className="bg-surface-1 border border-border-subtle rounded-xl overflow-hidden mt-2">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center">
          <Sk w={180} h={14} />
          <div className="flex gap-2"><Sk w={80} h={28} r={6} /><Sk w={100} h={28} r={6} /></div>
        </div>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-border-subtle last:border-b-0">
            <div className="w-8 h-8 rounded-full bg-surface-3 animate-pulse" />
            <div className="flex-1 flex flex-col gap-1.5"><Sk w={140} h={12} /><Sk w={200} h={10} /></div>
            <Sk w={80} h={20} r={10} />
            <Sk w={70} h={26} r={6} />
          </div>
        ))}
      </div>
    </div>
  );
}
