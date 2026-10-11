"use client";
/* Rive's documented imperative state-machine API mutates input.value, not React state. */
/* eslint-disable react-hooks/immutability */
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useMotionEnabled } from "@/components/motion/useMotionEnabled";
export default function RiveMark({ src }: { src: string }) {
  const enabled = useMotionEnabled();
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: "NeuralSpark",
    autoplay: enabled,
  });
  const hover = useStateMachineInput(rive, "NeuralSpark", "hover");
  return enabled ? (
    <RiveComponent
      className="rive-mark"
      onMouseEnter={() => {
        if (hover) hover.value = true;
      }}
      onMouseLeave={() => {
        if (hover) hover.value = false;
      }}
    />
  ) : null;
}
