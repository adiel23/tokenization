import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';
import { cn } from '@lib/utils';
import type { PricePoint } from '@types';

interface PriceChartProps {
  data: PricePoint[];
  type?: 'candles' | 'line';
  height?: number;
  className?: string;
  showVolume?: boolean;
}

export function PriceChart({
  data,
  type = 'candles',
  height = 400,
  className,
  showVolume = true,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#737373',
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: '#27272a', style: 1 },
        horzLines: { color: '#27272a', style: 1 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#f7931a',
          labelBackgroundColor: '#f7931a',
        },
        horzLine: {
          color: '#f7931a',
          labelBackgroundColor: '#f7931a',
        },
      },
      rightPriceScale: {
        borderColor: '#27272a',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#27272a',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
    });

    chartRef.current = chart;

    // Create series
    if (type === 'candles') {
      const candleSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });
      seriesRef.current = candleSeries;
    } else {
      const lineSeries = chart.addLineSeries({
        color: '#f7931a',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        lastValueVisible: true,
      });
      seriesRef.current = lineSeries;
    }

    // Volume series
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#f7931a',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        base: 0,
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      volumeSeriesRef.current = volumeSeries;
    }

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: height,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    setIsReady(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [type, height, showVolume]);

  // Update data
  useEffect(() => {
    if (!seriesRef.current || !isReady) return;

    if (type === 'candles') {
      const candleData: CandlestickData[] = data.map((d) => ({
        time: d.timestamp as unknown as string,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      (seriesRef.current as ISeriesApi<'Candlestick'>).setData(candleData);
    } else {
      const lineData: LineData[] = data.map((d) => ({
        time: d.timestamp as unknown as string,
        value: d.close,
      }));
      (seriesRef.current as ISeriesApi<'Line'>).setData(lineData);
    }

    if (volumeSeriesRef.current && showVolume) {
      const volumeData = data.map((d) => ({
        time: d.timestamp as unknown as string,
        value: d.volume,
        color: d.close >= d.open ? '#22c55e80' : '#ef444480',
      }));
      volumeSeriesRef.current.setData(volumeData);
    }

    chartRef.current?.timeScale().fitContent();
  }, [data, type, isReady, showVolume]);

  return (
    <div
      ref={chartContainerRef}
      className={cn('w-full rounded-lg overflow-hidden', className)}
      style={{ height }}
    />
  );
}
