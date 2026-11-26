import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Point, StoneColor } from "@/data/curriculum";
import type { Grid } from "@/lib/board";
import { keyOf } from "@/lib/board";

/** BadukPop 단위 (REA: Bf / Mf / Df) */
const Bf: [number, number] = [41 / 18, 43 / 18];
const Mf = 0.45 * Bf[0];
const Df: [number, number] = [1.5, 2];
const STONE_FLAT = 0.33;
const DROP_FROM = new THREE.Vector3(-4, 4, -10);
/** 정면에 가깝게 — 위에서 살짝만 기울여 봄 */
const CAM_OFFSET = new THREE.Vector3(0, 85, 8);

function boardScale(n: number): [number, number] {
  return [Bf[0] * (n - 1) + 2 * Df[0], Bf[1] * (n - 1) + 2 * Df[1]];
}

function stoneRest(n: number, x: number, y: number, lift = 0) {
  const mid = (n - 1) / 2;
  return new THREE.Vector3(Bf[0] * (x - mid), STONE_FLAT * Mf + lift, Bf[1] * (y - mid));
}

/** 단색 보드 + 격자·호선 (나무 결 없음) */
function makeBoardTexture(n: number): THREE.CanvasTexture {
  const px = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;

  g.fillStyle = "#c9a066";
  g.fillRect(0, 0, px, px);

  const pad = Df[0] / (Bf[0] * (n - 1) + 2 * Df[0]);
  const padY = Df[1] / (Bf[1] * (n - 1) + 2 * Df[1]);
  const spanX = 1 - 2 * pad;
  const spanY = 1 - 2 * padY;

  g.strokeStyle = "#5c3d1e";
  g.lineWidth = n >= 19 ? 1.4 : 2;
  g.lineCap = "butt";
  for (let i = 0; i < n; i++) {
    const tx = (pad + (spanX * i) / (n - 1)) * px;
    const ty = (padY + (spanY * i) / (n - 1)) * px;
    g.beginPath();
    g.moveTo(tx, padY * px);
    g.lineTo(tx, (1 - padY) * px);
    g.stroke();
    g.beginPath();
    g.moveTo(pad * px, ty);
    g.lineTo((1 - pad) * px, ty);
    g.stroke();
  }

  const stars =
    n >= 19
      ? [
          [3, 3],
          [3, 9],
          [3, 15],
          [9, 3],
          [9, 9],
          [9, 15],
          [15, 3],
          [15, 9],
          [15, 15],
        ]
      : n >= 13
        ? [
            [3, 3],
            [3, 9],
            [6, 6],
            [9, 3],
            [9, 9],
          ]
        : n >= 9
          ? [
              [2, 2],
              [2, 6],
              [4, 4],
              [6, 2],
              [6, 6],
            ]
          : n >= 7
            ? [[3, 3]]
            : [];

  g.fillStyle = "#5c3d1e";
  for (const [sx, sy] of stars) {
    const x = (pad + (spanX * sx) / (n - 1)) * px;
    const y = (padY + (spanY * sy) / (n - 1)) * px;
    g.beginPath();
    g.arc(x, y, n >= 19 ? 4.5 : 6, 0, Math.PI * 2);
    g.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function Goban({ n }: { n: number }) {
  const tex = useMemo(() => makeBoardTexture(n), [n]);
  useEffect(() => () => tex.dispose(), [tex]);
  const [sx, sz] = boardScale(n);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[sx * 2.4, sz * 2.4]} />
        <meshPhongMaterial color={0x101810} specular={0x000000} />
      </mesh>

      <mesh position={[0, -1, 0]} castShadow receiveShadow>
        <boxGeometry args={[sx, 2, sz]} />
        <meshPhongMaterial map={tex} color={0xffffff} specular={0x000000} />
      </mesh>
    </group>
  );
}

function StoneMesh({
  color,
  at,
  n,
  dropping,
}: {
  color: StoneColor;
  at: Point;
  n: number;
  dropping: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const start = useRef(performance.now());
  const [settled, setSettled] = useState(!dropping);
  const rest = useMemo(() => stoneRest(n, at.x, at.y), [n, at.x, at.y]);
  const from = useMemo(() => rest.clone().add(DROP_FROM), [rest]);

  useEffect(() => {
    start.current = performance.now();
    setSettled(!dropping);
  }, [dropping, at.x, at.y]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    if (settled) {
      g.position.copy(rest);
      g.rotation.set(0, 0, 0);
      return;
    }
    const t = Math.min(1, (performance.now() - start.current) / 280);
    const ease = 1 - Math.pow(1 - t, 3);
    g.position.lerpVectors(from, rest, ease);
    if (t > 0.7) {
      const w = Math.sin((t - 0.7) * 26) * (1 - t) * 0.22;
      g.rotation.x = w;
      g.rotation.z = w * 0.5;
    }
    if (t >= 1) setSettled(true);
  });

  const black = color === "B";
  // BadukPop: MeshPhysicalMaterial + scale (1, 0.33, 1)
  return (
    <group ref={group} position={rest.toArray()}>
      <mesh castShadow scale={[1, STONE_FLAT, 1]} position={[0, 0, 0]}>
        <sphereGeometry args={[Mf, 24, 16]} />
        <meshPhysicalMaterial
          color={black ? 0x000000 : 0xfdfdfd}
          metalness={black ? 0.4 : 0.01}
          roughness={0.8}
          clearcoat={black ? 0.7 : 1}
          clearcoatRoughness={black ? 0.4 : 0.2}
        />
      </mesh>
      {/* fake disc shadow (BadukPop fake_shadows) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, -STONE_FLAT * Mf + 0.02, 0.1]}>
        <circleGeometry args={[Mf * 0.95, 20]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.45} depthWrite={false} />
      </mesh>
    </group>
  );
}

function LastMark({ n, at }: { n: number; at: Point }) {
  const p = stoneRest(n, at.x, at.y);
  return (
    <mesh position={[p.x, p.y + STONE_FLAT * Mf * 0.55, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[Mf * 0.18, Mf * 0.32, 28]} />
      <meshBasicMaterial color="#e8ff6a" transparent opacity={0.95} depthWrite={false} />
    </mesh>
  );
}

function ClickPlane({ n, onPlay }: { n: number; onPlay?: (p: Point) => void }) {
  const { camera, gl } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const [sx, sz] = boardScale(n);

  const pick = (e: ThreeEvent<PointerEvent>) => {
    if (!onPlay) return;
    e.stopPropagation();
    const rect = gl.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(plane, hit)) return;
    const mid = (n - 1) / 2;
    const x = Math.round(hit.x / Bf[0] + mid);
    const y = Math.round(hit.z / Bf[1] + mid);
    if (x < 0 || y < 0 || x >= n || y >= n) return;
    onPlay({ x, y });
  };

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} onPointerDown={pick} visible={false}>
      <planeGeometry args={[sx, sz]} />
      <meshBasicMaterial />
    </mesh>
  );
}

/**
 * 바둑팝 updateCamera FOV 피팅:
 * 보드 모서리가 들어가도록 fov를 줄이고, 상·하 UI 세이프마진만큼 viewOffset.
 */
function FitCamera({
  n,
  marginTop = 0.1,
  marginBottom = 0.1,
  fovMargin = 0.55,
}: {
  n: number;
  marginTop?: number;
  marginBottom?: number;
  /** 보드 바깥 여유 (교차점 단위에 가깝게) */
  fovMargin?: number;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const mid = (n - 1) / 2;
    const target = new THREE.Vector3(0, 0, 0);
    const camPos = target.clone().add(CAM_OFFSET);
    cam.position.copy(camPos);
    cam.near = 1;
    cam.far = 1000;
    cam.lookAt(target);

    // 보드 bbox 코너 (+ margin) — BadukPop getBoardFOVMargin
    const x0 = -mid - fovMargin;
    const x1 = mid + fovMargin;
    const z0 = -mid - fovMargin;
    const z1 = mid + fovMargin;
    const corners = [
      new THREE.Vector3(Bf[0] * x0, 0, Bf[1] * z0),
      new THREE.Vector3(Bf[0] * x1, 0, Bf[1] * z0),
      new THREE.Vector3(Bf[0] * x0, 0, Bf[1] * z1),
      new THREE.Vector3(Bf[0] * x1, 0, Bf[1] * z1),
    ];

    const forward = target.clone().sub(camPos).normalize();
    const right = new THREE.Vector3(1, 0, 0);
    const upCam = right.clone().cross(forward).normalize();

    let needH = 0;
    let needV = 0;
    for (const corner of corners) {
      const dir = corner.clone().sub(camPos).normalize();
      const h = Math.abs(-dir.dot(right));
      const v = Math.abs(-dir.dot(upCam));
      needH = Math.max(needH, (180 / Math.PI) * 2 * Math.asin(THREE.MathUtils.clamp(h, 0, 1)));
      needV = Math.max(needV, (180 / Math.PI) * 2 * Math.asin(THREE.MathUtils.clamp(v, 0, 1)));
    }

    const usable = 1 - Math.min(marginTop + marginBottom, 0.9);
    let fov = needV / usable;
    const aspect = size.width / Math.max(size.height, 1);
    const hIfV = fov * aspect;
    if (needH > hIfV) fov *= needH / hIfV;

    // 작은 화면에서 살짝 더 줌아웃
    const short = Math.min(size.width, size.height);
    if (short < 420) fov *= 1.06;
    if (short < 340) fov *= 1.08;

    cam.fov = THREE.MathUtils.clamp(fov, 12, 48);
    const vOffset = (marginBottom - marginTop) / 2;
    cam.setViewOffset(aspect, 1, 0, vOffset, aspect, 1);
    cam.updateProjectionMatrix();
  }, [camera, n, size.width, size.height, marginTop, marginBottom, fovMargin]);

  return null;
}

function Scene({
  size,
  board,
  lastMove,
  onPlay,
  marginTop,
  marginBottom,
}: {
  size: number;
  board: Grid;
  lastMove?: Point | null;
  onPlay?: (p: Point) => void;
  marginTop: number;
  marginBottom: number;
}) {
  const n = board.length || size;
  const stones = useMemo(() => {
    const out: { key: string; color: StoneColor; at: Point }[] = [];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const c = board[y][x];
        if (c) out.push({ key: keyOf({ x, y }), color: c, at: { x, y } });
      }
    }
    return out;
  }, [board, n]);
  const lastKey = lastMove ? keyOf(lastMove) : null;

  return (
    <>
      <FitCamera n={n} marginTop={marginTop} marginBottom={marginBottom} />
      {/* BadukPop: AmbientLight HSL(0.6,0.4,0.6) intensity 0.7 + narrow SpotLight */}
      <ambientLight intensity={0.7} color={new THREE.Color().setHSL(0.6, 0.4, 0.6)} />
      <spotLight
        color={0xffffff}
        intensity={1.7e6}
        distance={0}
        angle={(Math.PI / 180) * 3}
        penumbra={0.1}
        decay={2}
        position={[-360, 570, -450]}
        castShadow={false}
      />

      <Goban n={n} />
      <ClickPlane n={n} onPlay={onPlay} />

      {stones.map((s) => (
        <StoneMesh key={s.key} color={s.color} at={s.at} n={n} dropping={s.key === lastKey} />
      ))}
      {lastMove && <LastMark n={n} at={lastMove} />}
    </>
  );
}

export function Board3D({
  size,
  board,
  lastMove = null,
  onPlay,
  className = "",
  marginTop = 0.1,
  marginBottom = 0.1,
}: {
  size: number;
  board: Grid;
  lastMove?: Point | null;
  onPlay?: (p: Point) => void;
  className?: string;
  /** 상단 UI가 가리는 비율 0~1 */
  marginTop?: number;
  /** 하단 UI가 가리는 비율 0~1 */
  marginBottom?: number;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 20, near: 1, far: 1000, position: [CAM_OFFSET.x, CAM_OFFSET.y, CAM_OFFSET.z] }}
        gl={{ antialias: true }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          scene.background = new THREE.Color(0x1a1a1a);
        }}
      >
        <Scene
          size={size}
          board={board}
          lastMove={lastMove}
          onPlay={onPlay}
          marginTop={marginTop}
          marginBottom={marginBottom}
        />
      </Canvas>
    </div>
  );
}
