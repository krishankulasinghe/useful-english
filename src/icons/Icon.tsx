import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { iconPaths, type IconName } from './paths';

export type { IconName };

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  // Fills the shape with `color` too (e.g. the saved-word bookmark icon).
  filled?: boolean;
}

export function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.8, filled = false }: IconProps) {
  const shapes = iconPaths[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {shapes.map((shape, i) => {
        const common = {
          stroke: color,
          strokeWidth,
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
          fill: filled ? color : ('none' as const),
        };
        if (shape.type === 'path') return <Path key={i} {...common} d={shape.d} />;
        if (shape.type === 'circle') return <Circle key={i} {...common} cx={shape.cx} cy={shape.cy} r={shape.r} />;
        return (
          <Rect
            key={i}
            {...common}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            rx={shape.rx}
          />
        );
      })}
    </Svg>
  );
}
