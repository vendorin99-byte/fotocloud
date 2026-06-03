export function Watermark({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="text-6xl font-bold text-white/20 rotate-45 select-none whitespace-nowrap">
        FOTOCLOUD
      </div>
    </div>
  );
}
