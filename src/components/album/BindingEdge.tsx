export function BindingEdge() {
  const holes = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col items-center justify-evenly py-4 pointer-events-none z-[1]">
      {/* Binding shadow */}
      <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-r from-black/8 to-transparent" />
      <div className="absolute inset-y-0 left-[2px] w-[3px] bg-gradient-to-r from-black/5 to-transparent" />

      {/* Ring holes */}
      {holes.map((i) => (
        <div key={i} className="relative">
          <div
            className="w-[10px] h-[10px] rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.12), rgba(0,0,0,0.04))",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
