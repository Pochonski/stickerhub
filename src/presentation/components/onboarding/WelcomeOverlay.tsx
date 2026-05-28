"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useGame } from "@/presentation/contexts/GameContext";
import { PackageOpen, Coins, ArrowRightLeft, Trash2, Trophy, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface TourStep {
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const STEPS: TourStep[] = [
  {
    title: "Bienvenido a StickerHub",
    icon: <Trophy size={40} strokeWidth={1.5} />,
    description: "Coleccioná stickers de las 48 selecciones del Mundial 2026. Abrí sobres, completá equipos, descartá repetidas por monedas e intercambiá con otros coleccionistas.",
    color: "var(--color-accent)",
  },
  {
    title: "Abrí sobres",
    icon: <PackageOpen size={40} strokeWidth={1.5} />,
    description: "Cada sobre tiene 6 stickers sorpresa. Algunos serán nuevos para tu colección, otros repetidos que podés descartar o intercambiar. ¡Te regalamos 5 sobres para empezar!",
    color: "var(--color-primary)",
  },
  {
    title: "Ganá monedas",
    icon: <Coins size={40} strokeWidth={1.5} />,
    description: "Descartá stickers repetidas por monedas. Las cartas estrella valen 1,300 y los jugadores mejor rankeados dan más. Usá esas monedas para comprar más sobres en la tienda.",
    color: "var(--color-accent)",
  },
  {
    title: "Completá equipos",
    icon: <Trophy size={40} strokeWidth={1.5} />,
    description: "Cada equipo tiene entre 3 y 20 jugadores. Al completar todas las cartas de una selección ganás 2,000 monedas extra. ¡Hay 48 equipos para completar!",
    color: "var(--color-success)",
  },
  {
    title: "Intercambiá con otros",
    icon: <ArrowRightLeft size={40} strokeWidth={1.5} />,
    description: "Publicá tus repetidas en el mercado y solicitá las cartas que te faltan a cambio. Construí tu reputación completando intercambios con otros coleccionistas.",
    color: "var(--color-field)",
  },
  {
    title: "¡Empezá ahora!",
    icon: <Sparkles size={40} strokeWidth={1.5} />,
    description: "Tenés todo listo para empezar tu colección. Abrí tu primer sobre y descubrí qué stickers te tocaron. ¡Buena suerte, coleccionista!",
    color: "var(--color-primary)",
  },
];

export function WelcomeOverlay() {
  const { user } = useUser();
  const { state, grantPacks } = useGame();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    const key = `stickerhub-welcome-${user.id}`;
    const seen = localStorage.getItem(key);
    if (!seen) {
      setShow(true);
      setStep(0);
    }
  }, [user]);

  const dismiss = () => {
    if (user) {
      localStorage.setItem(`stickerhub-welcome-${user.id}`, "true");
    }
    setShow(false);
  };

  const nextStep = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await grantPacks(5);
      dismiss();
      router.push("/pack-opener");
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!show) return null;

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Coleccionista";
  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] p-8 max-sm:p-6 max-w-[420px] w-[90%] text-center shadow-2xl animate-slide-up">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-[var(--color-accent)]" : i < step ? "w-1.5 bg-[var(--color-accent)]/40" : "w-1.5 bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div
          className="w-20 h-20 max-sm:w-16 max-sm:h-16 mx-auto mb-4 rounded-full grid place-items-center"
          style={{ backgroundColor: `${s.color}15`, color: s.color }}
        >
          {s.icon}
        </div>

        {/* Content */}
        <h2 className="font-[var(--font-display)] text-[22px] max-sm:text-[18px] font-extrabold tracking-tight mb-2">
          {step === 0 ? (
            <>¡Bienvenido, {displayName}!</>
          ) : (
            s.title
          )}
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-8 leading-relaxed max-sm:text-xs">
          {step === 0 ? (
            <>Tenés <strong className="text-[var(--color-accent)]">{state.packs} sobres gratis</strong> para empezar. {s.description}</>
          ) : (
            s.description
          )}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium cursor-pointer border-[1.5px] border-[var(--color-border)] text-[var(--color-muted)] bg-transparent transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-0 disabled:cursor-default"
          >
            <ChevronLeft size={16} /> Atrás
          </button>

          <button
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-semibold cursor-pointer border-none transition-colors"
            style={{ backgroundColor: s.color }}
          >
            {step === STEPS.length - 1 ? (
              <><PackageOpen size={18} strokeWidth={2} /> Abrir mi primer sobre</>
            ) : (
              <>Siguiente <ChevronRight size={16} /></>
            )}
          </button>
        </div>

        <button
          onClick={dismiss}
          className="mt-4 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] cursor-pointer bg-transparent border-none"
        >
          Saltar recorrido
        </button>
      </div>
    </div>
  );
}
