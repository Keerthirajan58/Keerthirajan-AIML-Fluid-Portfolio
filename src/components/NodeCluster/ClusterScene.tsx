"use client";

/* eslint-disable react-hooks/immutability --
   useFrame mutates preallocated three.js buffers (positions/sizes/line
   segments) in place every frame — the standard R3F pattern. React never
   re-renders from these values; uploading fresh arrays each frame would be
   the actual bug (GC churn at 60fps). */

import { useMemo, useRef, type RefObject } from "react";
// Named + type-only imports (not `import * as THREE`) so bundlers can
// tree-shake the rest of three.js — we only ever construct Color at runtime;
// Group/BufferGeometry are used purely as ref types, which are erased at
// compile time. This was the single largest driver of a real Lighthouse
// mobile-performance regression (see git history): the R3F/three chunk was
// competing with hydration on the main thread, and most of it was unused.
import { Color, type Group, type BufferGeometry } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { colors } from "@/lib/theme";
import { NODES, toWorld, mulberry32 } from "./data";

/**
 * The interactive "Latent Space" scene. Design constraints:
 * light background, so soft alpha-blended crimson/wine discs — NOT additive
 * glow, which washes out to white on paper. All motion is CPU-simmed over a
 * small point count (≤ ~80), rendered as two draw calls (points + line
 * segments) with custom shaders. Pauses entirely when `active` is false
 * (offscreen / hidden tab) via frameloop="never".
 */

export type PointerState = { x: number; y: number; inside: boolean };

const POINT_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const POINT_FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.16, d) * 0.95;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const LINE_VERT = /* glsl */ `
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;

const LINK_DISTANCE = 0.72;
const CURSOR_RADIUS = 0.9;

type Sim = {
  count: number;
  anchorCount: number;
  home: Float32Array;
  phase: Float32Array;
  speed: Float32Array;
  amp: Float32Array;
  baseSize: Float32Array;
  positions: Float32Array;
  sizes: Float32Array;
  colorArr: Float32Array;
  linePositions: Float32Array;
  lineAlphas: Float32Array;
  maxSegments: number;
};

function buildSim(isMobile: boolean): Sim {
  const ambientCount = isMobile ? 26 : 60;
  const anchorCount = NODES.length;
  const count = anchorCount + ambientCount;
  const rand = mulberry32(58); // fixed seed — identical cloud every visit

  const home = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const speed = new Float32Array(count);
  const amp = new Float32Array(count);
  const baseSize = new Float32Array(count);
  const colorArr = new Float32Array(count * 3);

  const crimson = new Color(colors.crimson);
  const wine = new Color(colors.wine);

  NODES.forEach((n, i) => {
    const [wx, wy] = toWorld(n.x, n.y);
    home.set([wx, wy, 0], i * 3);
    phase[i] = rand() * Math.PI * 2;
    speed[i] = 0.4 + rand() * 0.3;
    // Anchors barely move so the HTML labels stay visually attached.
    amp[i] = n.label ? 0.02 : 0.06;
    baseSize[i] = i === 0 ? 0.3 : n.label ? 0.2 : 0.11;
    const c = i === 0 ? crimson : wine;
    colorArr.set([c.r, c.g, c.b], i * 3);
  });

  for (let i = anchorCount; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 0.35 + Math.sqrt(rand()) * 1.75;
    home.set(
      [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.92,
        (rand() - 0.5) * 1.1,
      ],
      i * 3,
    );
    phase[i] = rand() * Math.PI * 2;
    speed[i] = 0.5 + rand() * 0.5;
    amp[i] = 0.1 + rand() * 0.1;
    baseSize[i] = 0.05 + rand() * 0.06;
    const c = rand() < 0.35 ? crimson : wine;
    colorArr.set([c.r, c.g, c.b], i * 3);
  }

  const maxSegments = count * 5;
  return {
    count,
    anchorCount,
    home,
    phase,
    speed,
    amp,
    baseSize,
    positions: new Float32Array(home),
    sizes: new Float32Array(baseSize),
    colorArr,
    linePositions: new Float32Array(maxSegments * 6),
    lineAlphas: new Float32Array(maxSegments * 2),
    maxSegments,
  };
}

function Cluster({
  isMobile,
  pointer,
}: {
  isMobile: boolean;
  pointer: RefObject<PointerState>;
}) {
  const sim = useMemo(() => buildSim(isMobile), [isMobile]);
  const group = useRef<Group>(null);
  const pointsGeo = useRef<BufferGeometry>(null);
  const linesGeo = useRef<BufferGeometry>(null);

  const lineColor = useMemo(
    () => new Color(colors.crimson),
    [],
  );

  useFrame((state, rawDelta) => {
    const t = state.clock.elapsedTime;
    const delta = Math.min(rawDelta, 0.05);
    const p = pointer.current;
    const { positions, sizes, home, phase, speed, amp, baseSize } = sim;

    // Pointer in world space at the z=0 plane (camera z=5, fov 50 → the
    // visible half-height at z=0 is 5*tan(25°) ≈ 2.33).
    const half = 2.33;
    const px = p.x * half;
    const py = p.y * half;

    for (let i = 0; i < sim.count; i++) {
      const i3 = i * 3;
      const drift = t * speed[i] + phase[i];
      let x = home[i3] + Math.sin(drift) * amp[i];
      let y = home[i3 + 1] + Math.cos(drift * 0.9) * amp[i];
      const z = home[i3 + 2] + Math.sin(drift * 0.6) * amp[i] * 0.6;

      if (p.inside && !isMobile && i >= sim.anchorCount) {
        const dx = x - px;
        const dy = y - py;
        const dist = Math.hypot(dx, dy);
        if (dist < CURSOR_RADIUS && dist > 0.0001) {
          const force = (1 - dist / CURSOR_RADIUS) * 0.38;
          x += (dx / dist) * force;
          y += (dy / dist) * force;
        }
      }

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Labeled anchors pulse gently.
      sizes[i] =
        i < sim.anchorCount
          ? baseSize[i] * (1 + 0.14 * Math.sin(t * 1.6 + i * 1.3))
          : baseSize[i];
    }

    // Rebuild proximity links (O(n²) over ≤86 points — cheap).
    let seg = 0;
    for (let i = 0; i < sim.count && seg < sim.maxSegments; i++) {
      for (let j = i + 1; j < sim.count && seg < sim.maxSegments; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < LINK_DISTANCE) {
          const alpha = (1 - dist / LINK_DISTANCE) * 0.32;
          sim.linePositions.set(
            [
              positions[i * 3],
              positions[i * 3 + 1],
              positions[i * 3 + 2],
              positions[j * 3],
              positions[j * 3 + 1],
              positions[j * 3 + 2],
            ],
            seg * 6,
          );
          sim.lineAlphas[seg * 2] = alpha;
          sim.lineAlphas[seg * 2 + 1] = alpha;
          seg++;
        }
      }
    }

    if (pointsGeo.current) {
      pointsGeo.current.attributes.position.needsUpdate = true;
      pointsGeo.current.attributes.aSize.needsUpdate = true;
    }
    if (linesGeo.current) {
      linesGeo.current.attributes.position.needsUpdate = true;
      linesGeo.current.attributes.aAlpha.needsUpdate = true;
      linesGeo.current.setDrawRange(0, seg * 2);
    }

    // Cursor parallax on the whole cluster (desktop only).
    if (group.current) {
      const targetY = p.inside && !isMobile ? p.x * 0.14 : 0;
      const targetX = p.inside && !isMobile ? -p.y * 0.1 : 0;
      const ease = Math.min(1, delta * 4);
      group.current.rotation.y += (targetY - group.current.rotation.y) * ease;
      group.current.rotation.x += (targetX - group.current.rotation.x) * ease;
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry ref={pointsGeo}>
          <bufferAttribute
            attach="attributes-position"
            args={[sim.positions, 3]}
          />
          <bufferAttribute attach="attributes-aSize" args={[sim.sizes, 1]} />
          <bufferAttribute
            attach="attributes-aColor"
            args={[sim.colorArr, 3]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={POINT_VERT}
          fragmentShader={POINT_FRAG}
          transparent
          depthWrite={false}
        />
      </points>
      <lineSegments frustumCulled={false}>
        <bufferGeometry ref={linesGeo}>
          <bufferAttribute
            attach="attributes-position"
            args={[sim.linePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-aAlpha"
            args={[sim.lineAlphas, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={LINE_VERT}
          fragmentShader={LINE_FRAG}
          uniforms={{ uColor: { value: lineColor } }}
          transparent
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export default function ClusterScene({
  active,
  isMobile,
  pointer,
  onContextLost,
}: {
  active: boolean;
  isMobile: boolean;
  pointer: RefObject<PointerState>;
  onContextLost: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, isMobile ? 1.5 : 2]}
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            onContextLost();
          },
          { once: true },
        );
      }}
      aria-hidden="true"
      className="!absolute !inset-0"
    >
      <Cluster isMobile={isMobile} pointer={pointer} />
    </Canvas>
  );
}
