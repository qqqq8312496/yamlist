import { create } from 'zustand';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  accentBg: string;
  borderColor: string;
  shadowColor: string;
}

interface ThemeState {
  colors: ThemeColors;
  updateThemeFromTopColor: (topColor: string) => void;
}

// 解析 linear-gradient 字符串，提取颜色
function parseGradientColors(gradientStr: string): string[] {
  // 匹配所有 # 开头的十六进制颜色
  const hexMatches = gradientStr.match(/#[0-9A-Fa-f]{6}/g);
  if (hexMatches && hexMatches.length >= 2) {
    return hexMatches;
  }
  // 如果不是渐变，返回纯色
  if (gradientStr.startsWith('#')) {
    return [gradientStr, gradientStr, gradientStr];
  }
  // 默认返回紫色
  return ['#a78bfa', '#818cf8', '#6366f1'];
}

// 将十六进制颜色转换为RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 167, g: 139, b: 250 }; // 默认紫色
}

// 将RGB转换为HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// 将HSL转换回十六进制
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 生成浅色版本（增加亮度）
function lightenColor(hex: string, amount: number = 20): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + amount));
}

// 生成深色版本（降低亮度）
function darkenColor(hex: string, amount: number = 20): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - amount));
}

// 从顶部颜色生成完整主题
function generateTheme(topColor: string): ThemeColors {
  const colors = parseGradientColors(topColor);

  // 主色使用渐变的中间色
  const primary = colors[Math.floor(colors.length / 2)] || colors[0];
  const gradientStart = colors[0];
  const gradientEnd = colors[colors.length - 1];
  const gradientMid = colors.length > 2 ? colors[1] : primary;

  const primaryLight = lightenColor(primary, 15);
  const primaryDark = darkenColor(primary, 15);

  const rgb = hexToRgb(primary);
  const accentBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;
  const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
  const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;

  return {
    primary,
    primaryLight,
    primaryDark,
    gradientStart,
    gradientMid,
    gradientEnd,
    accentBg,
    borderColor,
    shadowColor,
  };
}

// 默认紫色主题
const defaultTheme = generateTheme('linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #6366f1 100%)');

export const useThemeStore = create<ThemeState>((set) => ({
  colors: defaultTheme,

  updateThemeFromTopColor: (topColor: string) => {
    const newColors = generateTheme(topColor);
    set({ colors: newColors });
  },
}));
