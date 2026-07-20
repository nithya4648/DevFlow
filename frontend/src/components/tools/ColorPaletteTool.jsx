// src/components/tools/ColorPaletteTool.jsx
import { useState, useMemo } from "react";
import ToolCard from "./ToolCard";
import CopyButton from "./CopyButton";

// Convert hex to HSL
function hexToHSL(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Convert HSL to hex
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const val = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * val).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(baseHex) {
  try {
    const [h, s] = hexToHSL(baseHex);
    const lightnesses = [95, 85, 70, 55, 45, 35, 25, 15];
    return lightnesses.map((l, i) => ({
      name: `${(i + 1) * 100}`,
      hex: hslToHex(h, Math.max(s - 10 + i * 2, 0), l),
      isBase: Math.abs(l - 45) < 12,
    }));
  } catch {
    return [];
  }
}

export default function ColorPaletteTool() {
  const [baseColor, setBaseColor] = useState("#6366f1");
  const [scheme, setScheme] = useState("monochromatic");

  const palette = useMemo(() => generatePalette(baseColor), [baseColor]);

  const [h, s, l] = useMemo(() => {
    try { return hexToHSL(baseColor); } catch { return [0, 0, 50]; }
  }, [baseColor]);

  const complementary = useMemo(() => generatePalette(hslToHex((h + 180) % 360, s, l)), [h, s, l]);
  const analogous1 = useMemo(() => generatePalette(hslToHex((h + 30) % 360, s, l)), [h, s, l]);
  const analogous2 = useMemo(() => generatePalette(hslToHex((h - 30 + 360) % 360, s, l)), [h, s, l]);

  const schemes = {
    monochromatic: [{ name: "Base", swatches: palette }],
    complementary: [
      { name: "Base", swatches: palette },
      { name: "Complement", swatches: complementary },
    ],
    analogous: [
      { name: `Analogous −30°`, swatches: analogous2 },
      { name: "Base", swatches: palette },
      { name: `Analogous +30°`, swatches: analogous1 },
    ],
  };

  const activeScheme = schemes[scheme];

  return (
    <div className="space-y-5">
      {/* Controls */}
      <ToolCard title="Base Color">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="h-12 w-12 cursor-pointer rounded-xl border-2 border-gray-200 dark:border-gray-700"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-28 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-800 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 outline-none"
            />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              hsl({h}°, {s}%, {l}%)
            </span>
          </div>
          <div className="flex gap-2 ml-auto">
            {["monochromatic", "complementary", "analogous"].map((s) => (
              <button
                key={s}
                onClick={() => setScheme(s)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition ${
                  scheme === s
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </ToolCard>

      {/* Palette rows */}
      {activeScheme.map((group) => (
        <ToolCard key={group.name} title={group.name}>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {group.swatches.map((swatch) => (
              <div key={swatch.name} className="group flex flex-col items-center gap-2">
                <div
                  className={`relative h-14 w-full rounded-xl transition-transform group-hover:scale-105 ${swatch.isBase ? "ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-900" : ""}`}
                  style={{ backgroundColor: swatch.hex }}
                />
                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{swatch.name}</p>
                  <CopyButton text={swatch.hex} label={swatch.hex} className="!px-1 !py-0.5 !text-[9px] mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </ToolCard>
      ))}
    </div>
  );
}
