import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { useTour, TOUR_STEPS } from '../../context/TourContext';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const OnboardingTour: React.FC = () => {
  const {
    isTourActive,
    currentStepIndex,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    endTour,
  } = useTour();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; placement: string }>({
    top: 0,
    left: 0,
    placement: 'center',
  });
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Measure target element position
  const measureTarget = useCallback(() => {
    if (!currentStep) return;

    // Window dimensions update
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    setWindowDimensions({ width: winW, height: winH });

    const el = document.querySelector(currentStep.targetSelector);
    if (!el) {
      // Element not found (e.g. Center modal placement)
      setTargetRect(null);
      setPopoverPos({
        top: Math.max(30, (winH - 420) / 2),
        left: Math.max(16, (winW - 540) / 2),
        placement: 'center',
      });
      return;
    }

    // Scroll target into view if needed
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } catch {
      // ignore
    }

    const rect = el.getBoundingClientRect();
    const padding = 6;
    const computedRect: TargetRect = {
      top: Math.max(0, rect.top - padding),
      left: Math.max(0, rect.left - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      bottom: rect.bottom + padding,
      right: rect.right + padding,
    };
    setTargetRect(computedRect);

    // Calculate popover positioning
    const popoverWidth = Math.min(520, winW - 32);
    const popoverHeight = 360; // Estimated height for boundary math

    let placement = currentStep.placement || 'bottom';
    let top = 0;
    let left = 0;

    // Responsive fallback for small mobile screens: center placement
    if (winW < 768) {
      placement = 'bottom';
      left = (winW - popoverWidth) / 2;
      top = Math.min(winH - popoverHeight - 16, Math.max(16, computedRect.bottom + 12));
      if (top + popoverHeight > winH - 16) {
        top = Math.max(16, computedRect.top - popoverHeight - 12);
      }
    } else {
      // Desktop positioning calculations
      if (placement === 'right') {
        left = computedRect.right + 16;
        top = computedRect.top;
        if (left + popoverWidth > winW - 20) {
          // Flip to left or bottom if overflowing
          if (computedRect.left - popoverWidth - 16 > 16) {
            placement = 'left';
            left = computedRect.left - popoverWidth - 16;
          } else {
            placement = 'bottom';
            left = Math.max(16, Math.min(winW - popoverWidth - 16, computedRect.left));
            top = computedRect.bottom + 16;
          }
        }
      } else if (placement === 'left') {
        left = computedRect.left - popoverWidth - 16;
        top = computedRect.top;
        if (left < 16) {
          placement = 'right';
          left = computedRect.right + 16;
        }
      } else if (placement === 'top') {
        top = computedRect.top - popoverHeight - 16;
        left = Math.max(16, Math.min(winW - popoverWidth - 16, computedRect.left + (computedRect.width - popoverWidth) / 2));
        if (top < 16) {
          placement = 'bottom';
          top = computedRect.bottom + 16;
        }
      } else {
        // bottom placement default
        top = computedRect.bottom + 16;
        left = Math.max(16, Math.min(winW - popoverWidth - 16, computedRect.left));
        if (top + popoverHeight > winH - 16) {
          top = Math.max(16, computedRect.top - popoverHeight - 16);
          placement = 'top';
        }
      }

      // Clamp vertical bounds
      top = Math.max(16, Math.min(winH - popoverHeight - 20, top));
    }

    setPopoverPos({ top, left, placement });
  }, [currentStep]);

  // Measure when step changes or window resizes/scrolls
  useEffect(() => {
    if (!isTourActive) return;

    // Retry measuring target a few times to allow DOM rendering transition
    const timers = [
      setTimeout(measureTarget, 50),
      setTimeout(measureTarget, 200),
      setTimeout(measureTarget, 500),
    ];

    const handleResizeOrScroll = () => {
      requestAnimationFrame(measureTarget);
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      timers.forEach((t) => clearTimeout(t));
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isTourActive, currentStepIndex, currentStep, measureTarget]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        endTour(true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, nextStep, prevStep, endTour]);

  if (!isTourActive || !currentStep) {
    return null;
  }

  const isFinalStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden animate-in fade-in duration-200">
      {/* SVG Mask Overlay for Spotlight cutout */}
      <svg
        className="w-full h-full absolute inset-0 pointer-events-none transition-all duration-300"
        width={windowDimensions.width}
        height={windowDimensions.height}
      >
        <defs>
          <mask id="ckg-tour-spotlight-mask">
            {/* White base fills everything (transparent cutout mask) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout over target rect makes that hole completely visible */}
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="8"
                ry="8"
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>

        {/* Dark backdrop with the mask applied */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="#001815"
          opacity="0.82"
          mask="url(#ckg-tour-spotlight-mask)"
        />
      </svg>

      {/* Target Focus Ring & Pulse Indicator */}
      {targetRect && (
        <div
          style={{
            position: 'absolute',
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
          className="pointer-events-none rounded-lg border-2 border-emerald-400 shadow-[0_0_24px_rgba(46,125,91,0.6)] transition-all duration-300 ease-out"
        >
          <span className="absolute -top-2 -right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-white"></span>
          </span>
        </div>
      )}

      {/* Backdrop click to dismiss or step forward (optional, safe overlay) */}
      <div
        className="absolute inset-0 cursor-default"
        onClick={(e) => {
          // Allow clicking outside the popover card to advance step
          if (e.target === e.currentTarget) {
            nextStep();
          }
        }}
      />

      {/* Floating Tour Popover Tooltip Card */}
      <div
        ref={popoverRef}
        style={{
          position: 'absolute',
          top: `${popoverPos.top}px`,
          left: `${popoverPos.left}px`,
          maxWidth: '520px',
          width: 'calc(100vw - 32px)',
        }}
        className="z-50 bg-[#00201C] text-slate-100 rounded-2xl shadow-2xl border border-teal-500/40 p-5 sm:p-6 transition-all duration-300 ease-out animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Zone: Badge, Step Counter, and Close Button */}
        <div className="flex items-center justify-between gap-3 border-b border-teal-900/60 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {currentStep.badge || 'PANDUAN TUR'}
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Langkah <strong className="text-white">{currentStepIndex + 1}</strong> dari {totalSteps}
            </span>
          </div>

          <button
            onClick={() => endTour(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-teal-900/50 transition cursor-pointer"
            title="Tutup Tur (ESC)"
            aria-label="Tutup tur"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content Area */}
        <div className="space-y-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {currentStep.title}
            </h3>
            {currentStep.subtitle && (
              <p className="text-xs font-medium text-emerald-300/90 mt-0.5">
                {currentStep.subtitle}
              </p>
            )}
          </div>

          <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed">
            {currentStep.content}
          </p>

          {/* Highlights Box */}
          {currentStep.highlights && currentStep.highlights.length > 0 && (
            <div className="p-3 bg-[#001714] rounded-xl border border-teal-950/80 space-y-1.5 mt-3">
              <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3 h-3" /> Poin Kunci & Kepatuhan
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {currentStep.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Step Progress Indicators (Clickable Pills) */}
        <div className="flex items-center justify-center gap-1.5 my-4 pt-1">
          {TOUR_STEPS.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={s.id}
                onClick={() => goToStep(idx)}
                title={`Lompat ke langkah ${idx + 1}: ${s.title}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'w-7 bg-emerald-400 shadow-sm'
                    : isCompleted
                    ? 'w-3.5 bg-teal-600 hover:bg-teal-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Buka langkah ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Footer Actions: Prev, Next, Complete, and Shortcuts */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-teal-900/60">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => endTour(true)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-teal-950/50 transition cursor-pointer"
            >
              Lewati Tur
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={prevStep}
                className="flex items-center gap-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
            )}

            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <span>{isFinalStep ? 'Selesai & Mulai Kerja' : 'Lanjut'}</span>
              {isFinalStep ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Keyboard shortcut helper footer */}
        <div className="hidden sm:flex items-center justify-between text-[10px] text-slate-400 pt-3 mt-2 border-t border-teal-950/40">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[9px]">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[9px]">
              →
            </kbd>{' '}
            Navigasi langkah
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[9px]">
              ESC
            </kbd>{' '}
            Keluar kapan saja
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Quick Floating Guide Pill / Welcome Prompt
 */
export const OnboardingWelcomeBanner: React.FC = () => {
  const { hasSeenTour, startTour, endTour } = useTour();
  const [isDismissed, setIsDismissed] = useState(false);

  // If user has seen tour or dismissed this session banner, do not render
  if (hasSeenTour || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 max-w-sm bg-[#00201C] text-white border border-teal-500/50 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white">Selamat Datang di CKG Smart Care!</h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Ikuti tur interaktif 2-menit untuk mengenal fitur utama (Dashboard, Care Tasks, Dinkes Command Center, & AI Copilot).
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => startTour(0)}
              className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-bold text-xs rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Mulai Tur Kilat
            </button>
            <button
              onClick={() => {
                setIsDismissed(true);
                endTour(true);
              }}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white font-medium transition cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setIsDismissed(true);
            endTour(true);
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
