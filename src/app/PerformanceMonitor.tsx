'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domLoad: number; // DOM Content Loaded
  windowLoad: number; // Window Load
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number>(0);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_PERFORMANCE_MONITOR === 'true') {
      setIsVisible(true);
    }

    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Measure First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[entries.length - 1];
        if (fcp) {
          setMetrics(prev => prev ? { ...prev, fcp: fcp.startTime } : { fcp: fcp.startTime } as PerformanceMetrics);
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Measure Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        if (lcp) {
          setMetrics(prev => prev ? { ...prev, lcp: lcp.startTime } : { lcp: lcp.startTime } as PerformanceMetrics);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fid = entries[entries.length - 1];
        if (fid) {
          setMetrics(prev => prev ? { ...prev, fid: fid.processingStart - fid.startTime } : { fid: fid.processingStart - fid.startTime } as PerformanceMetrics);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Measure Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        setMetrics(prev => prev ? { ...prev, cls: clsValue } : { cls: clsValue } as PerformanceMetrics);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Measure Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        setMetrics(prev => prev ? { ...prev, ttfb } : { ttfb } as PerformanceMetrics);
      }

      // Measure DOM and Window load times
      const domLoad = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
      const windowLoad = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => prev ? { ...prev, domLoad, windowLoad } : { domLoad, windowLoad } as PerformanceMetrics);

      return () => {
        fcpObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (metrics) {
      // Calculate performance score based on Core Web Vitals
      let score = 100;
      
      // FCP scoring (0-100)
      if (metrics.fcp > 3000) score -= 30;
      else if (metrics.fcp > 2000) score -= 20;
      else if (metrics.fcp > 1500) score -= 10;
      
      // LCP scoring (0-100)
      if (metrics.lcp > 4000) score -= 30;
      else if (metrics.lcp > 2500) score -= 20;
      else if (metrics.lcp > 2000) score -= 10;
      
      // FID scoring (0-100)
      if (metrics.fid > 300) score -= 30;
      else if (metrics.fid > 200) score -= 20;
      else if (metrics.fid > 100) score -= 10;
      
      // CLS scoring (0-100)
      if (metrics.cls > 0.25) score -= 30;
      else if (metrics.cls > 0.15) score -= 20;
      else if (metrics.cls > 0.1) score -= 10;
      
      setPerformanceScore(Math.max(0, score));
    }
  }, [metrics]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  if (!isVisible) return null;

  return (
    <div className="performance-monitor show">
      <div className="text-xs font-bold mb-2">Performance Monitor</div>
      
      {performanceScore > 0 && (
        <div className="mb-2">
          <div className={`text-lg font-bold ${getScoreColor(performanceScore)}`}>
            {performanceScore}/100
          </div>
          <div className="text-xs text-gray-300">{getScoreLabel(performanceScore)}</div>
        </div>
      )}
      
      {metrics && (
        <div className="space-y-1 text-xs">
          <div>FCP: {metrics.fcp?.toFixed(0)}ms</div>
          <div>LCP: {metrics.lcp?.toFixed(0)}ms</div>
          <div>FID: {metrics.fid?.toFixed(0)}ms</div>
          <div>CLS: {metrics.cls?.toFixed(3)}</div>
          <div>TTFB: {metrics.ttfb?.toFixed(0)}ms</div>
          <div>DOM: {metrics.domLoad?.toFixed(0)}ms</div>
          <div>Load: {metrics.windowLoad?.toFixed(0)}ms</div>
        </div>
      )}
      
      <button
        onClick={() => setIsVisible(false)}
        className="mt-2 text-xs text-gray-400 hover:text-white"
      >
        Hide
      </button>
    </div>
  );
};

export default PerformanceMonitor;
