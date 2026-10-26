'use client';

import React, { useState } from 'react';
import { ChartPoint } from '@/lib/marketData';

interface StockChartProps {
  data: ChartPoint[];
  color?: string;
  height?: number;
  showAxes?: boolean;
  isPositive?: boolean;
  valuePrefix?: string;
}

export default function StockChart({
  data,
  color = '#10B981',
  height = 240,
  showAxes = true,
  isPositive = true,
  valuePrefix = '$',
}: StockChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-gray-500 text-sm"
        style={{ height }}
      >
        Loading market chart...
      </div>
    );
  }

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1 || 5;
  const yMin = Math.max(0, minPrice - padding);
  const yMax = maxPrice + padding;

  const width = 800;
  const svgHeight = height;
  const chartPaddingTop = 20;
  const chartPaddingBottom = showAxes ? 35 : 10;
  const usableHeight = svgHeight - chartPaddingTop - chartPaddingBottom;

  const getX = (index: number) => {
    return (index / (data.length - 1)) * (width - 40) + 20;
  };

  const getY = (val: number) => {
    const ratio = (val - yMin) / (yMax - yMin);
    return svgHeight - chartPaddingBottom - ratio * usableHeight;
  };

  // Generate SVG path commands
  const pathD = data.reduce((acc, point, index) => {
    const x = getX(index);
    const y = getY(point.price);
    return `${acc} ${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${getX(data.length - 1)} ${svgHeight - chartPaddingBottom} L ${getX(0)} ${svgHeight - chartPaddingBottom} Z`;

  const strokeColor = isPositive ? '#10B981' : '#EF4444';
  const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative w-full select-none" style={{ height }}>
      {hoveredPoint && (
        <div
          className="absolute top-2 left-4 z-10 px-3 py-1.5 rounded-lg bg-[#141822]/95 border border-white/10 shadow-xl backdrop-blur-md pointer-events-none transition-all duration-75"
        >
          <div className="text-xs text-gray-400">{hoveredPoint.time}</div>
          <div className="text-sm font-bold font-mono text-white">
            {valuePrefix}{hoveredPoint.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${svgHeight}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
            <stop offset="60%" stopColor={strokeColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {showAxes && (
          <>
            {[0, 0.33, 0.66, 1].map((r, i) => {
              const y = chartPaddingTop + r * usableHeight;
              const priceVal = yMax - r * (yMax - yMin);
              return (
                <g key={i}>
                  <line
                    x1="20"
                    y1={y}
                    x2={width - 20}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={width - 15}
                    y={y + 4}
                    fill="#6B7280"
                    fontSize="11"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {valuePrefix}{Math.round(priceVal)}
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Line stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive hover points & trigger bars */}
        {data.map((point, index) => {
          const x = getX(index);
          const y = getY(point.price);
          const isHovered = hoveredPoint === point;

          return (
            <g key={index}>
              {/* Invisible touch/mouse slice */}
              <rect
                x={x - (width / data.length) / 2}
                y="0"
                width={width / data.length}
                height={svgHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredPoint(point)}
              />
              {isHovered && (
                <>
                  <line
                    x1={x}
                    y1={chartPaddingTop}
                    x2={x}
                    y2={svgHeight - chartPaddingBottom}
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill={strokeColor}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Time labels */}
        {showAxes && (
          <g>
            {[0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75), data.length - 1].map(
              (idx) => {
                const pt = data[idx];
                if (!pt) return null;
                const x = getX(idx);
                return (
                  <text
                    key={idx}
                    x={x}
                    y={svgHeight - 10}
                    fill="#9CA3AF"
                    fontSize="11"
                    textAnchor="middle"
                  >
                    {pt.time}
                  </text>
                );
              }
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
