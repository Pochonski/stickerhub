"use client";

interface Tab {
  id: string;
  label: string;
}

export function Tabs({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 bg-[var(--color-border)] p-1 rounded-full w-fit mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer border-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
            active === tab.id
              ? "bg-[var(--color-surface)] text-[var(--color-fg)] shadow-sm"
              : "bg-transparent text-[var(--color-muted)] hover:text-[var(--color-fg)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
