"use client";

import React from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

export default function Tooltip({ children, content, className = "" }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const ref = React.useRef<HTMLDivElement | null>(null);

  const handleEnter = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      top: r.top - 8,
      left: r.left + r.width / 2,
    });
    setOpen(true);
  };

  const handleLeave = () => setOpen(false);

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={`inline-block ${className}`}
      >
        {children}
      </div>
      {open && coords && typeof window !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg shadow-lg px-4 py-3 max-w-xs leading-snug"
            style={{ top: coords.top, left: coords.left, transform: "translate(-50%, -100%)" }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
