"use client";
// Adapted from React Bits Silk, Copyright (c) 2026 David Haz.
// MIT + Commons Clause: see THIRD_PARTY_NOTICES.md. Portfolio-specific palette,
// pointer/scroll response, power limits, and context-loss fallback added here.
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Vector2, type ShaderMaterial } from "three";

const vertexShader = `varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uScroll;
uniform vec2 uPointer;
float noise(vec2 p){vec2 r=2.71828*sin(2.71828*p);return fract(r.x*r.y*(1.+p.x));}
void main(){
  vec2 uv=vUv;
  uv+=uPointer*.035;
  uv.y+=uScroll*.06;
  float c=cos(-.42), s=sin(-.42);
  vec2 tex=mat2(c,-s,s,c)*uv*1.15;
  tex.y+=.03*sin(8.*tex.x-uTime);
  float pattern=.6+.4*sin(5.*(tex.x+tex.y+cos(3.*tex.x+5.*tex.y)+.02*uTime)+sin(20.*(tex.x+tex.y-.1*uTime)));
  float fold=smoothstep(.2,.98,pattern);
  vec3 shadow=vec3(.035,.068,.12);
  vec3 indigo=vec3(.16,.32,.52);
  vec3 pearl=vec3(.52,.76,.85);
  float light=smoothstep(.20,.95,uv.x);
  vec3 color=mix(shadow,indigo,fold*light*.82);
  color=mix(color,pearl,pow(fold,9.)*light*.42);
  color-=noise(gl_FragCoord.xy)*.018;
  gl_FragColor=vec4(color,1.);
}`;
function SilkPlane() {
  const material = useRef<ShaderMaterial>(null);
  const { viewport } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 4 },
      uScroll: { value: 0 },
      uPointer: { value: new Vector2() },
    }),
    [],
  );
  const target = useMemo(() => new Vector2(), []);
  useEffect(() => {
    const move = (e: PointerEvent) =>
      target.set(
        e.clientX / window.innerWidth - 0.5,
        0.5 - e.clientY / window.innerHeight,
      );
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [target]);
  useFrame((_, delta) => {
    if (!material.current) return;
    const live = material.current.uniforms;
    live.uTime.value += Math.min(delta, 0.05) * 0.55;
    live.uScroll.value = window.scrollY / window.innerHeight;
    live.uPointer.value.lerp(target, 1 - Math.exp(-delta * 3));
  });
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
      />
    </mesh>
  );
}
export default function SilkScene() {
  const [visible, setVisible] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      document.querySelector(".atmosphere")?.removeAttribute("data-live");
    };
  }, []);
  if (failed) return null;
  return (
    <Canvas
      dpr={[1, 1.25]}
      frameloop={visible ? "always" : "never"}
      gl={{ antialias: false, powerPreference: "low-power", alpha: false }}
      onCreated={({ gl }) => {
        gl.domElement.closest(".atmosphere")?.setAttribute("data-live", "true");
        gl.domElement.addEventListener(
          "webglcontextlost",
          () => {
            setFailed(true);
            document.querySelector(".atmosphere")?.removeAttribute("data-live");
          },
          { once: true },
        );
      }}
    >
      <SilkPlane />
    </Canvas>
  );
}
