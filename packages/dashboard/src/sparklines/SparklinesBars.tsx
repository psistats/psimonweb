import React, { FC, CSSProperties } from "react";

interface SparklinesBarsProps {
  points?: any[];
  height?: number;
  style?: CSSProperties;
  barWidth?: number;
  margin?: number;
  onMouseMove?: () => void;
}

const SparklinesBars: FC<SparklinesBarsProps> = (
  props: SparklinesBarsProps
) => {
  const {
    points = [],
    height = 0,
    style = { fill: "slategray" },
    barWidth,
    margin,
    onMouseMove,
  } = props;
  const strokeWidth: number =
    1 * ((style && style.strokeWidth ? +style.strokeWidth : 0) || 0);
  const marginWidth = margin ? 2 * margin : 0;
  const width =
    barWidth ||
    (points && points.length >= 2
      ? Math.max(0, points[1].x - points[0].x - strokeWidth - marginWidth)
      : 0);

  return (
    <g transform="scale(1,-1)">
      {points.map((p, i) => {
        let fillColor: string;

        if (p.val < 50) {
          fillColor = '#6baa75'
        } else if (p.val >= 50 && p.val <= 75) {
          fillColor = '#ffff00'
        } else {
          fillColor = '#ff0000'
        }

        return (
          <rect
            key={i}
            x={p.x - (width + strokeWidth) / 2}
            y={-height}
            width={width}
            height={Math.max(0, height - p.y)}
            fill={ fillColor }
            stroke="#000000"
            // style={style}
            onMouseMove={onMouseMove && onMouseMove.bind({}, p)}
          />
        )}
      )}
    </g>
  );
};

export default SparklinesBars;
