export interface CutPiece {
  id: string;
  windowId: string;
  label: string;
  length: number; // mm
  profileCode: string;
  angleLeft: number;
  angleRight: number;
  color?: string;
}

export interface OptimizedBar {
  barIndex: number;
  stockLength: number; // usually 6000 mm
  profileCode: string;
  usedLength: number;
  wasteLength: number;
  wastePercentage: number;
  cuts: {
    piece: CutPiece;
    offset: number;
  }[];
}

export interface OptimizationResult {
  bars: OptimizedBar[];
  totalBars: number;
  totalRequiredLength: number;
  totalStockUsedLength: number;
  totalWasteLength: number;
  overallYieldPercentage: number;
  overallWastePercentage: number;
}

const STOCK_BAR_LENGTH = 6000; // 6 meters standard extrusion length
const SAW_KERF = 4; // 4mm saw blade kerf allowance per cut

export function optimizeLinearCuts(
  pieces: CutPiece[],
  stockLength: number = STOCK_BAR_LENGTH
): OptimizationResult {
  // Sort pieces descending by length for First Fit Decreasing
  const sorted = [...pieces].sort((a, b) => b.length - a.length);

  const bars: OptimizedBar[] = [];

  for (const piece of sorted) {
    let placed = false;

    for (const bar of bars) {
      if (bar.profileCode === piece.profileCode) {
        const needed = piece.length + SAW_KERF;
        if (bar.stockLength - bar.usedLength >= needed) {
          bar.cuts.push({
            piece,
            offset: bar.usedLength,
          });
          bar.usedLength += needed;
          bar.wasteLength = bar.stockLength - bar.usedLength;
          bar.wastePercentage = Number(
            ((bar.wasteLength / bar.stockLength) * 100).toFixed(1)
          );
          placed = true;
          break;
        }
      }
    }

    if (!placed) {
      // Open a new stock bar
      const newBar: OptimizedBar = {
        barIndex: bars.length + 1,
        stockLength,
        profileCode: piece.profileCode,
        usedLength: piece.length + SAW_KERF,
        wasteLength: stockLength - (piece.length + SAW_KERF),
        wastePercentage: Number(
          (
            ((stockLength - (piece.length + SAW_KERF)) / stockLength) *
            100
          ).toFixed(1)
        ),
        cuts: [
          {
            piece,
            offset: 0,
          },
        ],
      };
      bars.push(newBar);
    }
  }

  const totalRequiredLength = pieces.reduce((sum, p) => sum + p.length, 0);
  const totalStockUsedLength = bars.length * stockLength;
  const totalWasteLength = totalStockUsedLength - totalRequiredLength;
  const overallYieldPercentage = totalStockUsedLength
    ? Number(((totalRequiredLength / totalStockUsedLength) * 100).toFixed(1))
    : 100;
  const overallWastePercentage = Number(
    (100 - overallYieldPercentage).toFixed(1)
  );

  return {
    bars,
    totalBars: bars.length,
    totalRequiredLength,
    totalStockUsedLength,
    totalWasteLength,
    overallYieldPercentage,
    overallWastePercentage,
  };
}
