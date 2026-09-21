import React from 'react';

// Code 39 (3 of 9) Encoding Table:
// 9 elements per char: 5 bars, 4 spaces. '1' = wide, '0' = narrow.
// Alternating: Bar, Space, Bar, Space, Bar, Space, Bar, Space, Bar.
const CODE39_MAP: Record<string, string> = {
  '0': '000110100',
  '1': '100100001',
  '2': '001100001',
  '3': '101100000',
  '4': '000110001',
  '5': '100110000',
  '6': '001110000',
  '7': '000100101',
  '8': '100100100',
  '9': '001100100',
  'A': '100001001',
  'B': '001001001',
  'C': '101001000',
  'D': '000011001',
  'E': '100011000',
  'F': '001011000',
  'G': '000001101',
  'H': '100001100',
  'I': '001001100',
  'J': '000011100',
  'K': '100000011',
  'L': '001000011',
  'M': '101000010',
  'N': '000010011',
  'O': '100010010',
  'P': '001010010',
  'Q': '000000111',
  'R': '100000110',
  'S': '001000110',
  'T': '000010110',
  'U': '110000001',
  'V': '011000001',
  'W': '111000000',
  'X': '010010001',
  'Y': '110010000',
  'Z': '011010000',
  '-': '010000101',
  '.': '110000100',
  ' ': '011000100',
  '$': '010101000',
  '/': '010100010',
  '+': '010001010',
  '%': '000101010',
  '*': '010010100',
};

interface BarcodeProps {
  value: string;
  height?: number;
  narrowWidth?: number;
  wideWidth?: number;
  showText?: boolean;
  className?: string;
}

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  height = 48,
  narrowWidth = 1.5,
  wideWidth = 3.5,
  showText = true,
  className = '',
}) => {
  // Clean string to valid Code39 chars and add start/stop asterisks
  const normalized = `*${value.toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g, '')}*`;

  // Build rectangles for SVG
  const bars: { x: number; width: number }[] = [];
  let currentX = 10; // Quiet zone margin

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const pattern = CODE39_MAP[char] || CODE39_MAP['-'];

    for (let j = 0; j < 9; j++) {
      const isBar = j % 2 === 0;
      const isWide = pattern[j] === '1';
      const width = isWide ? wideWidth : narrowWidth;

      if (isBar) {
        bars.push({ x: currentX, width });
      }
      currentX += width;
    }

    // Inter-character narrow space
    currentX += narrowWidth;
  }

  // Add trailing quiet zone
  const totalWidth = currentX + 10;
  const totalHeight = showText ? height + 18 : height;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="w-full max-w-full h-auto"
        style={{ maxHeight: totalHeight }}
      >
        <rect width={totalWidth} height={totalHeight} fill="white" />
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={2}
            width={bar.width}
            height={height}
            fill="#000000"
          />
        ))}
        {showText && (
          <text
            x={totalWidth / 2}
            y={height + 14}
            textAnchor="middle"
            fill="#000000"
            fontSize="11"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            fontWeight="bold"
            letterSpacing="2"
          >
            {value}
          </text>
        )}
      </svg>
    </div>
  );
};
