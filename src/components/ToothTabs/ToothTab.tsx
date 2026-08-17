import React from 'react';

interface ToothTabProps {
  label: string;
  top: number;
  active?: boolean;
  color?: string;
  count?: number;
  onClick?: () => void;
}

export const ToothTab: React.FC<ToothTabProps> = ({
  label,
  top,
  active = false,
  color,
  count,
  onClick,
}) => {
  const getStyle = () => {
    const style: any = { top: `${top}px` };

    // 设置左边框颜色和背景色
    if (color) {
      style.borderLeftColor = color;

      if (active) {
        // 激活时用该颜色的背景
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : null;
        };

        const rgb = hexToRgb(color);
        if (rgb) {
          style.background = `linear-gradient(180deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85) 100%)`;
        }
      } else {
        // 未激活时用半透明背景
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : null;
        };

        const rgb = hexToRgb(color);
        if (rgb) {
          style.background = `linear-gradient(180deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45) 100%)`;
        }
      }
    }

    return style;
  };

  return (
    <div
      className={`tooth-tab ${active ? 'active' : ''}`}
      style={getStyle()}
      onClick={onClick}
    >
      <span className="tooth-label">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="tooth-count">{count}</span>
      )}
    </div>
  );
};
