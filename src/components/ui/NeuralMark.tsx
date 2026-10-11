"use client";
import dynamic from "next/dynamic";
const RiveMark = dynamic(() => import("./RiveMark"), { ssr: false });
export function NeuralMark() {
  const src = process.env.NEXT_PUBLIC_RIVE_SRC;
  return (
    <span className="neural-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        <path
          d="M8 34 24 8l16 26M8 34h32M16 21h16M16 21l8 19 8-19M24 8v32"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        {[
          [8, 34],
          [24, 8],
          [40, 34],
          [16, 21],
          [32, 21],
          [24, 40],
        ].map(([x, y]) => (
          <circle key={x + "," + y} cx={x} cy={y} r="2.7" fill="currentColor" />
        ))}
      </svg>
      {src && <RiveMark src={src} />}
    </span>
  );
}
