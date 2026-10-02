import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Play, Pause, Layers, Compass, Eye } from 'lucide-react';

interface InteractiveCadCanvasProps {
  modelType?: 'gear' | 'robotic-arm' | 'drone' | 'heat-sink' | 'swiss-poster' | 'brand-guideline' | 'custom';
  interactive?: boolean;
  className?: string;
  showBlueprintControls?: boolean;
}

export const InteractiveCadCanvas: React.FC<InteractiveCadCanvasProps> = ({
  modelType = 'gear',
  interactive = true,
  className = '',
  showBlueprintControls = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'blueprint' | 'wireframe' | 'shaded'>('blueprint');
  const [autoRotate, setAutoRotate] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [rotation, setRotation] = useState({ x: 25, y: -35 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotY = rotation.y;
    let rotX = rotation.x;
    let time = 0;

    const render = () => {
      time += 0.02;
      if (autoRotate && !isDragging.current) {
        rotY += 0.4;
      }

      // Handle retina displays
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * window.devicePixelRatio || canvas.height !== height * window.devicePixelRatio) {
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
      }

      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, width, height);

      // Background styles depending on view mode
      if (viewMode === 'blueprint') {
        // Technical Blueprint Aesthetic: Deep Prussian/Navy Cyan with grid
        ctx.fillStyle = '#061325';
        ctx.fillRect(0, 0, width, height);

        // Technical Grid
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 20;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Sub-grid lines every 100px
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.18)';
        for (let x = 0; x < width; x += 100) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 100) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Corner technical brackets
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 1.5;
        const corner = 16;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(12, 12 + corner);
        ctx.lineTo(12, 12);
        ctx.lineTo(12 + corner, 12);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(width - 12 - corner, 12);
        ctx.lineTo(width - 12, 12);
        ctx.lineTo(width - 12, 12 + corner);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(12, height - 12 - corner);
        ctx.lineTo(12, height - 12);
        ctx.lineTo(12 + corner, height - 12);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(width - 12 - corner, height - 12);
        ctx.lineTo(width - 12, height - 12);
        ctx.lineTo(width - 12, height - 12 - corner);
        ctx.stroke();

        // Technical Drafting Stamp watermark
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.fillText('CAD: ISO 2768-mK', 18, 24);
        ctx.fillText('ORTHO: 3RD ANGLE', 18, 36);
        ctx.fillText(`ROT: X ${Math.round(rotX)}° Y ${Math.round(rotY % 360)}°`, width - 110, 24);
      } else if (viewMode === 'shaded') {
        // High-end dark charcoal studio
        const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width);
        grad.addColorStop(0, '#1c1c22');
        grad.addColorStop(1, '#0a0a0d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Stark wireframe dark
        ctx.fillStyle = '#0a0a0c';
        ctx.fillRect(0, 0, width, height);

        // Dot grid
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let x = 10; x < width; x += 25) {
          for (let y = 10; y < height; y += 25) {
            ctx.fillRect(x, y, 1.5, 1.5);
          }
        }
      }

      // 3D Projection math
      const centerX = width / 2;
      const centerY = height / 2;
      const radX = (rotX * Math.PI) / 180;
      const radY = (rotY * Math.PI) / 180;

      const project = (x: number, y: number, z: number) => {
        // Rotate around Y
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // Perspective
        const scale = 380 / (380 + z2);
        return {
          x: centerX + x1 * scale,
          y: centerY + y2 * scale,
          scale,
          depth: z2,
        };
      };

      // Styling colors based on viewMode
      const strokeColor = viewMode === 'blueprint' 
        ? '#38bdf8' 
        : viewMode === 'shaded' 
        ? '#f59e0b' 
        : '#e2e8f0';
      const secondaryStroke = viewMode === 'blueprint' 
        ? 'rgba(56, 189, 248, 0.4)' 
        : viewMode === 'shaded' 
        ? 'rgba(245, 158, 11, 0.35)' 
        : 'rgba(255, 255, 255, 0.25)';

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;

      // Draw model based on modelType
      if (modelType === 'gear') {
        drawPlanetaryGear(ctx, project, time, strokeColor, secondaryStroke, viewMode, exploded);
      } else if (modelType === 'robotic-arm') {
        drawRoboticActuator(ctx, project, time, strokeColor, secondaryStroke, viewMode, exploded);
      } else if (modelType === 'drone') {
        drawDroneChassis(ctx, project, time, strokeColor, secondaryStroke, viewMode, exploded);
      } else if (modelType === 'swiss-poster' || modelType === 'brand-guideline') {
        drawSwissGraphicSystem(ctx, project, time, strokeColor, secondaryStroke, viewMode);
      } else {
        drawTopologyHeatSink(ctx, project, time, strokeColor, secondaryStroke, viewMode, exploded);
      }

      ctx.restore();
      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [viewMode, autoRotate, exploded, modelType, rotation]);

  // Mouse / Touch handlers for interactive rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !interactive) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotation((prev) => ({
      x: Math.max(-85, Math.min(85, prev.x + dy * 0.5)),
      y: prev.y + dx * 0.5,
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className={`relative overflow-hidden group select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {showBlueprintControls && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* View Modes */}
          <div className="flex items-center gap-1 bg-neutral-900/80 backdrop-blur-md p-1 border border-neutral-800 rounded-lg pointer-events-auto">
            <button
              onClick={() => setViewMode('blueprint')}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                viewMode === 'blueprint'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Draft Blueprint
            </button>
            <button
              onClick={() => setViewMode('wireframe')}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                viewMode === 'wireframe'
                  ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Wireframe
            </button>
            <button
              onClick={() => setViewMode('shaded')}
              className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                viewMode === 'shaded'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Studio
            </button>
          </div>

          {/* Action toggles */}
          <div className="flex items-center gap-1 bg-neutral-900/80 backdrop-blur-md p-1 border border-neutral-800 rounded-lg pointer-events-auto">
            <button
              onClick={() => setExploded(!exploded)}
              title={exploded ? 'Collapse Assembly' : 'Exploded View'}
              className={`p-1.5 rounded text-xs transition-colors ${
                exploded ? 'bg-amber-500/20 text-amber-400' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setRotation({ x: 25, y: -35 })}
              title="Reset Isometric Angle"
              className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Drag Hint */}
      <div className="absolute top-3 right-3 text-[10px] font-mono text-neutral-500 bg-neutral-950/70 border border-neutral-800/80 px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Drag to 3D Orbit
      </div>
    </div>
  );
};

// --- 3D Vector Geometry Helpers ---

function drawCircle3D(
  ctx: CanvasRenderingContext2D,
  project: (x: number, y: number, z: number) => { x: number; y: number },
  centerX: number,
  centerY: number,
  centerZ: number,
  radius: number,
  segments: number = 32,
  plane: 'xy' | 'xz' | 'yz' = 'xz'
) {
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    let px = centerX;
    let py = centerY;
    let pz = centerZ;

    if (plane === 'xz') {
      px += Math.cos(angle) * radius;
      pz += Math.sin(angle) * radius;
    } else if (plane === 'xy') {
      px += Math.cos(angle) * radius;
      py += Math.sin(angle) * radius;
    } else {
      py += Math.cos(angle) * radius;
      pz += Math.sin(angle) * radius;
    }

    const pt = project(px, py, pz);
    if (i === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();
}

function drawCylinder3D(
  ctx: CanvasRenderingContext2D,
  project: (x: number, y: number, z: number) => { x: number; y: number },
  centerX: number,
  centerY: number,
  centerZ: number,
  radius: number,
  height: number,
  ribs: number = 8
) {
  const yTop = centerY - height / 2;
  const yBottom = centerY + height / 2;

  drawCircle3D(ctx, project, centerX, yTop, centerZ, radius, 32, 'xz');
  drawCircle3D(ctx, project, centerX, yBottom, centerZ, radius, 32, 'xz');

  for (let i = 0; i < ribs; i++) {
    const angle = (i / ribs) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const z = centerZ + Math.sin(angle) * radius;
    const p1 = project(x, yTop, z);
    const p2 = project(x, yBottom, z);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}

// 1. Planetary Gear Assembly
function drawPlanetaryGear(
  ctx: CanvasRenderingContext2D,
  project: any,
  time: number,
  stroke: string,
  secStroke: string,
  mode: string,
  exploded: boolean
) {
  const explodeOffset = exploded ? 40 : 0;

  // Outer Ring Gear
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  drawCylinder3D(ctx, project, 0, 0 - explodeOffset, 0, 95, 20, 16);
  drawCircle3D(ctx, project, 0, -10 - explodeOffset, 0, 85, 36, 'xz');
  drawCircle3D(ctx, project, 0, 10 - explodeOffset, 0, 85, 36, 'xz');

  // Sun Gear (Center)
  ctx.strokeStyle = mode === 'shaded' ? '#fbbf24' : stroke;
  drawCylinder3D(ctx, project, 0, 0 + explodeOffset, 0, 28, 22, 12);
  drawCircle3D(ctx, project, 0, -11 + explodeOffset, 0, 12, 16, 'xz'); // Hollow bore

  // 3 Planetary Gears
  const planetDist = 58;
  const numPlanets = 3;
  ctx.strokeStyle = stroke;

  for (let i = 0; i < numPlanets; i++) {
    const angle = (i / numPlanets) * Math.PI * 2 + time * 0.5;
    const px = Math.cos(angle) * planetDist;
    const pz = Math.sin(angle) * planetDist;

    drawCylinder3D(ctx, project, px, 0, pz, 28, 18, 10);
    drawCircle3D(ctx, project, px, -9, pz, 8, 12, 'xz'); // Pin bore

    // Gear teeth pitch circle indicator
    ctx.strokeStyle = secStroke;
    ctx.setLineDash([3, 3]);
    drawCircle3D(ctx, project, px, 0, pz, 32, 24, 'xz');
    ctx.setLineDash([]);
    ctx.strokeStyle = stroke;
  }

  // Carrier Plate if exploded
  if (exploded) {
    ctx.strokeStyle = mode === 'blueprint' ? '#38bdf8' : '#e2e8f0';
    drawCircle3D(ctx, project, 0, -35, 0, 75, 24, 'xz');
    drawCircle3D(ctx, project, 0, 35, 0, 75, 24, 'xz');
  }

  // Pitch diameter annotations for blueprint mode
  if (mode === 'blueprint') {
    const ptCenter = project(0, 0, 0);
    const ptOuter = project(95, 0, 0);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(ptCenter.x, ptCenter.y);
    ctx.lineTo(ptOuter.x, ptOuter.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('PCD: Ø 190.00 mm', (ptCenter.x + ptOuter.x) / 2 - 15, ptCenter.y - 8);
  }
}

// 2. Robotic Actuator Joint
function drawRoboticActuator(
  ctx: CanvasRenderingContext2D,
  project: any,
  time: number,
  stroke: string,
  secStroke: string,
  mode: string,
  exploded: boolean
) {
  const exp = exploded ? 35 : 0;

  // Stator Housing
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.4;
  drawCylinder3D(ctx, project, 0, 40 + exp, 0, 70, 35, 12);

  // Cycloidal Pin Ring
  drawCylinder3D(ctx, project, 0, 0, 0, 65, 25, 16);

  // Output Flange
  ctx.strokeStyle = mode === 'shaded' ? '#f59e0b' : stroke;
  drawCylinder3D(ctx, project, 0, -40 - exp, 0, 60, 20, 12);
  // Center hollow bore (25mm)
  drawCircle3D(ctx, project, 0, -50 - exp, 0, 18, 20, 'xz');

  // Bolt pattern holes on flange
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const bx = Math.cos(a) * 44;
    const bz = Math.sin(a) * 44;
    drawCircle3D(ctx, project, bx, -50 - exp, bz, 4, 8, 'xz');
  }

  // Cross section / bearings
  ctx.strokeStyle = secStroke;
  drawCircle3D(ctx, project, 0, 15, 0, 52, 24, 'xz');
  drawCircle3D(ctx, project, 0, -15, 0, 52, 24, 'xz');

  if (mode === 'blueprint') {
    const p1 = project(0, -50 - exp, 0);
    const p2 = project(60, -50 - exp, 0);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('6x M4 ON Ø 88.00 PCD', p2.x + 8, p2.y);
  }
}

// 3. Drone Carbon Airframe
function drawDroneChassis(
  ctx: CanvasRenderingContext2D,
  project: any,
  time: number,
  stroke: string,
  secStroke: string,
  mode: string,
  exploded: boolean
) {
  const armLen = 85;
  const exp = exploded ? 25 : 0;

  // Central Top & Bottom Monocoque Plates
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.3;
  drawCylinder3D(ctx, project, 0, -8 - exp, 0, 36, 6, 8);
  drawCylinder3D(ctx, project, 0, 8 + exp, 0, 36, 6, 8);

  // 4 Carbon Arms in X-configuration
  const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  angles.forEach((angle, idx) => {
    const x = Math.cos(angle) * armLen;
    const z = Math.sin(angle) * armLen;

    // Carbon Tube
    const pCenter = project(Math.cos(angle) * 25, 0, Math.sin(angle) * 25);
    const pEnd = project(x, 0, z);

    ctx.beginPath();
    ctx.moveTo(pCenter.x, pCenter.y);
    ctx.lineTo(pEnd.x, pEnd.y);
    ctx.stroke();

    // Motor Pod Mount at arm tip
    drawCylinder3D(ctx, project, x, 0, z, 16, 12, 8);

    // Propeller disk sweep preview
    ctx.strokeStyle = secStroke;
    ctx.setLineDash([4, 4]);
    drawCircle3D(ctx, project, x, -12, z, 35, 20, 'xz');
    ctx.setLineDash([]);
    ctx.strokeStyle = stroke;
  });

  if (mode === 'blueprint') {
    ctx.font = '10px monospace';
    ctx.fillStyle = '#38bdf8';
    const p0 = project(0, 0, 0);
    ctx.fillText('WHEELBASE: 520 mm Ø', p0.x - 45, p0.y + 40);
  }
}

// 4. Topology Optimized Heat Sink
function drawTopologyHeatSink(
  ctx: CanvasRenderingContext2D,
  project: any,
  time: number,
  stroke: string,
  secStroke: string,
  mode: string,
  exploded: boolean
) {
  // Base plate
  ctx.strokeStyle = stroke;
  drawCylinder3D(ctx, project, 0, 30, 0, 75, 14, 16);

  // Radial Fins Array
  const finCount = 18;
  for (let i = 0; i < finCount; i++) {
    const a = (i / finCount) * Math.PI * 2;
    const rIn = 25;
    const rOut = 70;

    const x1 = Math.cos(a) * rIn;
    const z1 = Math.sin(a) * rIn;
    const x2 = Math.cos(a) * rOut;
    const z2 = Math.sin(a) * rOut;

    const pBotIn = project(x1, 23, z1);
    const pBotOut = project(x2, 23, z2);
    const pTopIn = project(x1, -35, z1);
    const pTopOut = project(x2, -25, z2);

    ctx.beginPath();
    ctx.moveTo(pBotIn.x, pBotIn.y);
    ctx.lineTo(pBotOut.x, pBotOut.y);
    ctx.lineTo(pTopOut.x, pTopOut.y);
    ctx.lineTo(pTopIn.x, pTopIn.y);
    ctx.closePath();
    ctx.stroke();
  }

  // Central copper vapor chamber core
  ctx.strokeStyle = mode === 'shaded' ? '#f59e0b' : secStroke;
  drawCylinder3D(ctx, project, 0, 0, 0, 22, 50, 12);
}

// 5. Swiss Graphic Design System (3D Isometric Layout)
function drawSwissGraphicSystem(
  ctx: CanvasRenderingContext2D,
  project: any,
  time: number,
  stroke: string,
  secStroke: string,
  mode: string
) {
  // 3D Isometric Poster / Grid planes
  const w = 90;
  const h = 130;

  // Outer Editorial Board
  const p1 = project(-w, 0, -h);
  const p2 = project(w, 0, -h);
  const p3 = project(w, 0, h);
  const p4 = project(-w, 0, h);

  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.stroke();

  // 12-Column Grid Lines
  ctx.strokeStyle = secStroke;
  ctx.lineWidth = 0.8;
  for (let c = 1; c < 6; c++) {
    const gx = -w + (c * (w * 2)) / 6;
    const ptA = project(gx, 0, -h);
    const ptB = project(gx, 0, h);
    ctx.beginPath();
    ctx.moveTo(ptA.x, ptA.y);
    ctx.lineTo(ptB.x, ptB.y);
    ctx.stroke();
  }

  // Golden Ratio Spiral / Asymmetric Focus
  ctx.strokeStyle = mode === 'blueprint' ? '#38bdf8' : '#f59e0b';
  ctx.lineWidth = 1.8;
  drawCircle3D(ctx, project, -25, 0, -35, 38, 32, 'xz');

  // Floating typography layer plane
  const elev = -24;
  const t1 = project(-60, elev, 10);
  const t2 = project(40, elev, 10);
  const t3 = project(40, elev, 45);
  const t4 = project(-60, elev, 45);

  ctx.beginPath();
  ctx.moveTo(t1.x, t1.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.lineTo(t4.x, t4.y);
  ctx.closePath();
  ctx.stroke();

  if (mode === 'blueprint') {
    ctx.font = '10px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('SWISS 12-COL MODULAR', p1.x + 8, p1.y + 14);
    ctx.fillText('1:1.618 GOLDEN SECTION', p4.x + 8, p4.y - 10);
  }
}
