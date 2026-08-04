"use client";

interface HeroDragLayerProps {
  heroBoundsCanvas: { x: number; y: number; w: number; h: number };
  canvasResolution: number;
  cssDisplaySize:   number;
  isDragging:       boolean;
  hasImage:         boolean;
  onMouseDown:      (e: React.MouseEvent) => void;
  onTouchStart:     (e: React.TouchEvent) => void;
  onDoubleClick:    () => void;
}

/**
 * Transparent overlay that captures drag/touch/double-click events over the
 * hero image area. Positioned using the bounds the canvas reports after each
 * render via onHeroBoundsReady.
 */
export function HeroDragLayer({
  heroBoundsCanvas,
  canvasResolution,
  cssDisplaySize,
  isDragging,
  hasImage,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
}: HeroDragLayerProps) {
  const sf = cssDisplaySize / canvasResolution;
  const { x, y, w, h } = heroBoundsCanvas;

  return (
    <div
      aria-hidden="true"
      style={{
        position:    "absolute",
        left:        x * sf,
        top:         y * sf,
        width:       w * sf,
        height:      h * sf,
        cursor:      !hasImage ? "default" : isDragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect:  "none",
        WebkitUserSelect: "none",
        zIndex:      10,
      }}
      onMouseDown={hasImage ? onMouseDown : undefined}
      onTouchStart={hasImage ? onTouchStart : undefined}
      onDoubleClick={hasImage ? onDoubleClick : undefined}
    />
  );
}
