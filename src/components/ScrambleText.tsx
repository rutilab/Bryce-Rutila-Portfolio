"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CharSet = "ascii" | "alphanumeric" | "binary" | "blocks";

interface ScrambleTextProps {
  phrases: string | string[];
  charSet?: CharSet;
  churnSpeed?: number;
  decodeSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHAR_SETS: Record<CharSet, string> = {
  ascii:        "!@#$%^&*()_+-=[]{}|;:'\",.<>?/~`\\",
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  binary:       "01",
  blocks:       "░▒▓█▄▀■□▪▫▬▲▶▼◀●○◆◇★☆",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rnd(set: string) {
  return set[Math.floor(Math.random() * set.length)];
}

// speed 1 → ~600ms per churn tick, speed 10 → ~60ms
function churnInterval(speed: number) {
  return Math.max(60, Math.round(600 / speed));
}

// speed 1 → ~20 scramble frames per char, speed 10 → 2 frames
function decodeStepsPerChar(speed: number) {
  return Math.max(2, Math.round(20 / speed));
}

// speed 1 → ~300ms between chars, speed 10 → ~30ms
function decodeCharDelay(speed: number) {
  return Math.max(30, Math.round(300 / speed));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScrambleText({
  phrases,
  charSet = "ascii",
  churnSpeed = 3,
  decodeSpeed = 5,
  pauseDuration = 1800,
  className,
}: ScrambleTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  const state = useRef({
    slots: [] as { span: HTMLSpanElement; locked: boolean; target: string }[],
    churnTimer: null as ReturnType<typeof setTimeout> | null,
    decodeTimer: null as ReturnType<typeof setTimeout> | null,
    rafId: null as number | null,
    churnActive: false,
    running: false,
    currentIndex: 0,
  });

  const phraseList = Array.isArray(phrases) ? phrases : [phrases];

  // ── Slot management ───────────────────────────────────────────────────────

  // Read all widths in one pass, then write — avoids interleaved layout thrash.
  const pinWidths = useCallback((slots: typeof state.current.slots) => {
    const widths = slots.map(({ span }) => span.getBoundingClientRect().width);
    for (let i = 0; i < slots.length; i++) {
      slots[i].span.style.width = `${widths[i]}px`;
      slots[i].span.style.textAlign = "center";
    }
  }, []);

  // Render target chars first so getBoundingClientRect measures the right width,
  // then pin, then swap to scramble chars.
  const buildSlots = useCallback((text: string) => {
    const s = state.current;
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    s.slots = [];

    for (const ch of text) {
      const span = document.createElement("span");
      span.style.cssText = "display:inline-block; color:inherit;";
      span.textContent = ch === " " ? " " : ch;
      container.appendChild(span);
      s.slots.push({ span, locked: false, target: ch });
    }

    pinWidths(s.slots);

    for (const slot of s.slots) {
      if (slot.target !== " ") slot.span.textContent = rnd(CHAR_SETS[charSet]);
    }
  }, [charSet, pinWidths]);

  // On each new phrase: strip old width pins, render new target chars to
  // re-measure, re-pin, then swap to scramble. This prevents old widths
  // (from different characters in the previous phrase) from persisting.
  const resizeSlots = useCallback((newText: string) => {
    const s = state.current;
    const container = containerRef.current;
    if (!container) return;

    const newLen = newText.length;

    // Remove excess slots
    while (s.slots.length > newLen) {
      s.slots[s.slots.length - 1].span.remove();
      s.slots.pop();
    }

    // Add any new slots
    for (let i = s.slots.length; i < newLen; i++) {
      const span = document.createElement("span");
      span.style.cssText = "display:inline-block; color:inherit;";
      container.appendChild(span);
      s.slots.push({ span, locked: false, target: newText[i] });
    }

    // Strip old width pins and render new target chars for measurement
    for (let i = 0; i < newLen; i++) {
      const slot = s.slots[i];
      slot.target = newText[i];
      slot.locked = false;
      slot.span.style.width = "";
      slot.span.style.textAlign = "";
      slot.span.textContent = slot.target === " " ? " " : slot.target;
    }

    // Re-pin all widths, then swap to scramble chars
    pinWidths(s.slots);
    for (const slot of s.slots) {
      if (slot.target !== " ") slot.span.textContent = rnd(CHAR_SETS[charSet]);
    }
  }, [charSet, pinWidths]);

  // ── Churn loop ────────────────────────────────────────────────────────────

  const stopAll = useCallback(() => {
    const s = state.current;
    s.churnActive = false;
    if (s.churnTimer) clearTimeout(s.churnTimer);
    if (s.decodeTimer) clearTimeout(s.decodeTimer);
    if (s.rafId) cancelAnimationFrame(s.rafId);
    s.churnTimer = null;
    s.decodeTimer = null;
    s.rafId = null;
  }, []);

  const startChurn = useCallback(() => {
    const s = state.current;
    s.churnActive = true;

    function tick() {
      if (!s.churnActive) return;
      for (const slot of s.slots) {
        if (!slot.locked) {
          slot.span.textContent =
            slot.target === " " ? " " : rnd(CHAR_SETS[charSet]);
        }
      }
      s.churnTimer = setTimeout(tick, churnInterval(churnSpeed));
    }
    tick();
  }, [charSet, churnSpeed]);

  // ── Decode pass ───────────────────────────────────────────────────────────

  const decodeSlots = useCallback((onDone: () => void) => {
    const s = state.current;
    const steps = decodeStepsPerChar(decodeSpeed);
    const delay = decodeCharDelay(decodeSpeed);
    let idx = 0;

    function decodeOne() {
      if (idx >= s.slots.length) { onDone(); return; }
      const slot = s.slots[idx];
      let step = 0;

      function tick() {
        if (step < steps) {
          if (!slot.locked) {
            slot.span.textContent =
              slot.target === " " ? " " : rnd(CHAR_SETS[charSet]);
          }
          step++;
          s.rafId = requestAnimationFrame(tick);
        } else {
          slot.span.textContent =
            slot.target === " " ? " " : slot.target;
          slot.locked = true;
          idx++;
          s.decodeTimer = setTimeout(decodeOne, delay);
        }
      }
      tick();
    }
    decodeOne();
  }, [charSet, decodeSpeed]);

  // ── Cycle orchestration ───────────────────────────────────────────────────

  const cycle = useCallback((isFirst: boolean) => {
    const s = state.current;
    if (!s.running) return;

    const text = phraseList[s.currentIndex];

    if (isFirst) buildSlots(text);
    else resizeSlots(text);

    stopAll();
    startChurn();

    // Brief churn-only window before decode begins
    s.decodeTimer = setTimeout(() => {
      if (!s.running) return;
      stopAll();
      startChurn();
      decodeSlots(() => {
        s.decodeTimer = setTimeout(() => {
          if (!s.running) return;
          s.currentIndex = (s.currentIndex + 1) % phraseList.length;
          cycle(false);
        }, pauseDuration);
      });
    }, 400);
  }, [phraseList, buildSlots, resizeSlots, stopAll, startChurn, decodeSlots, pauseDuration]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const s = state.current;
    s.running = true;
    s.currentIndex = 0;
    cycle(true);

    return () => {
      s.running = false;
      stopAll();
    };
  }, [cycle, stopAll]);

  return (
    <span
      ref={containerRef}
      className={className}
      aria-label={phraseList[0]}
      aria-live="polite"
    />
  );
}
