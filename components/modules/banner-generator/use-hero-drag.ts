"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Types & constants ─────────────────────────────────────────────────────────

export interface HeroTransform {
  offsetX: number; // canvas-space px offset from centre (positive = right/down)
  offsetY: number;
  scale:   number; // 1.0 = baseline cover-fit
}

export const HERO_TRANSFORM_DEFAULT: HeroTransform = { offsetX: 0, offsetY: 0, scale: 1.0 };
export const HERO_SCALE_MIN  = 0.8;
export const HERO_SCALE_MAX  = 1.2;
export const HERO_SCALE_STEP = 0.01;

export interface HeroBounds {
  x: number; y: number; w: number; h: number;
}

/**
 * Maximum pan offsets (canvas px) for a given image AR, hero zone, and scale.
 * At scale = 1.0 the cover-fit is exact: one axis has zero room, the other may
 * have some if the image is wider/taller than the zone aspect ratio.
 */
export function computeMaxOffset(
  imageAR: number,
  heroW: number, heroH: number,
  scale: number,
): { maxX: number; maxY: number } {
  const zr = heroW / heroH;
  let fw: number, fh: number;
  if (imageAR > zr) { fh = heroH; fw = fh * imageAR; }
  else              { fw = heroW; fh = fw / imageAR; }
  return {
    maxX: Math.max(0, (fw * scale - heroW) / 2),
    maxY: Math.max(0, (fh * scale - heroH) / 2),
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseHeroDragOptions {
  cssDisplaySize: number;
  canvasSize:     number;
  heroBounds:     HeroBounds | null;
  imageAR:        number | null;
  hasImage:       boolean;
  transform:      HeroTransform;
  onTransform:    (t: HeroTransform) => void;
}

export function useHeroDrag({
  cssDisplaySize,
  canvasSize,
  heroBounds,
  imageAR,
  hasImage,
  transform,
  onTransform,
}: UseHeroDragOptions) {
  const [isDragging, setIsDragging] = useState(false);

  // Refs for values that must be current inside event handlers without
  // causing effect re-subscriptions on every render.
  const isDraggingRef  = useRef(false);
  const lastPosRef     = useRef({ x: 0, y: 0 });
  const transformRef   = useRef(transform);
  const boundsRef      = useRef(heroBounds);
  const arRef          = useRef(imageAR);
  const animFrameRef   = useRef<number | null>(null);

  transformRef.current = transform;
  boundsRef.current    = heroBounds;
  arRef.current        = imageAR;

  // ── Clamp helper ────────────────────────────────────────────────────────────

  const doClamp = useCallback((t: HeroTransform): HeroTransform => {
    const b  = boundsRef.current;
    const ar = arRef.current;
    if (!b || !ar) return t;
    const { maxX, maxY } = computeMaxOffset(ar, b.w, b.h, t.scale);
    return {
      ...t,
      offsetX: Math.max(-maxX, Math.min(maxX, t.offsetX)),
      offsetY: Math.max(-maxY, Math.min(maxY, t.offsetY)),
    };
  }, []);

  // ── Animation ───────────────────────────────────────────────────────────────

  function easeOutCubic(t: number) { return 1 - (1 - t) ** 3; }

  const animateTo = useCallback((target: HeroTransform, ms: number) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const from  = { ...transformRef.current };
    const start = performance.now();

    function step(now: number) {
      const p = Math.min((now - start) / ms, 1);
      const e = easeOutCubic(p);
      onTransform({
        offsetX: from.offsetX + (target.offsetX - from.offsetX) * e,
        offsetY: from.offsetY + (target.offsetY - from.offsetY) * e,
        scale:   from.scale   + (target.scale   - from.scale)   * e,
      });
      if (p < 1) { animFrameRef.current = requestAnimationFrame(step); }
      else         { animFrameRef.current = null; }
    }
    animFrameRef.current = requestAnimationFrame(step);
  }, [onTransform]);

  /** Animate to default position + scale (200 ms ease-out). */
  const resetTransform = useCallback(() => {
    animateTo(HERO_TRANSFORM_DEFAULT, 200);
  }, [animateTo]);

  // ── Drag start ──────────────────────────────────────────────────────────────

  const startDrag = useCallback((clientX: number, clientY: number) => {
    if (!hasImage) return;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    isDraggingRef.current = true;
    setIsDragging(true);
    lastPosRef.current = { x: clientX, y: clientY };
  }, [hasImage]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
  }, [startDrag]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
  }, [startDrag]);

  /** Double-click: animate offset to centre, keep current scale. */
  const handleDoubleClick = useCallback(() => {
    if (!hasImage) return;
    animateTo(doClamp({ ...transformRef.current, offsetX: 0, offsetY: 0 }), 200);
  }, [hasImage, doClamp, animateTo]);

  // ── Global capture during drag ───────────────────────────────────────────────

  useEffect(() => {
    if (!isDragging) return;

    const scale = canvasSize / cssDisplaySize;

    function getPos(e: MouseEvent | TouchEvent) {
      if ("touches" in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      const pos    = getPos(e);
      const deltaX = (pos.x - lastPosRef.current.x) * scale;
      const deltaY = (pos.y - lastPosRef.current.y) * scale;
      lastPosRef.current = pos;
      const prev = transformRef.current;
      onTransform(doClamp({ ...prev, offsetX: prev.offsetX + deltaX, offsetY: prev.offsetY + deltaY }));
    };

    const onEnd = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend",  onEnd);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
  }, [isDragging, canvasSize, cssDisplaySize, doClamp, onTransform]);

  // Cleanup animation on unmount
  useEffect(() => () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  return { isDragging, handleMouseDown, handleTouchStart, handleDoubleClick, resetTransform, doClamp };
}
