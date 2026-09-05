import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Layers, Calendar, AlertTriangle } from 'lucide-react';

export default function IndexChart({ data, selectedRange, onRangeChange }) {
  const [showDivergenceArea, setShowDivergenceArea] = useState(true);

  if (!data || data.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading time-series index data...</p>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const earliest = data[0];
  const netInflation = latest && earliest 
    ? (((latest.aerova_index - earliest.aerova_index) / earliest.aerova_index) * 100).toFixed(1)
    : 0;

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Chart Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Real-Time Airfare Price Index vs Official MoSPI CPI
            </h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Daily automated web-scraped index (Base 2024=100) vs eSankhyiki Monthly Benchmark (45-day survey lag)
          </p>
        </div>

        {/* Range Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowDivergenceArea(!showDivergenceArea)}
            className="btn-secondary"
            style={{
              fontSize: '0.75rem',
              padding: '4px 10px',
              backgroundColor: showDivergenceArea ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              borderColor: showDivergenceArea ? 'var(--accent-indigo)' : 'var(--border-subtle)'
            }}
          >
            <Layers size={13} />
            <span>Lag Gap Fill</span>
          </button>

          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => onRangeChange(days)}
                style={{
                  background: selectedRange === days ? 'var(--accent-indigo)' : 'transparent',
                  color: selectedRange === days ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: '360px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="aerovaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="divergenceGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="var(--text-muted)" 
              fontSize={11}
              tickFormatter={(val) => {
                const parts = val.split('-');
                return `${parts[2]}/${parts[1]}`;
              }}
              tickLine={false}
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={11}
              domain={['auto', 'auto']}
              tickFormatter={(v) => `${v}`}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '0.8rem' }}
            />

            {showDivergenceArea && (
              <Area 
                type="monotone" 
                dataKey="aerova_index" 
                name="AEROVA Volatility Band"
                stroke="none"
                fill="url(#aerovaGlow)" 
              />
            )}

            {/* Official eSankhyiki Line (Monthly Step) */}
            <Line 
              type="stepAfter" 
              dataKey="official_cpi_transport" 
              name="Official MoSPI eSankhyiki CPI" 
              stroke="#F59E0B" 
              strokeWidth={2.5} 
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 5, fill: '#F59E0B' }}
            />

            {/* AEROVA Daily Real-Time Index */}
            <Line 
              type="monotone" 
              dataKey="aerova_index" 
              name="AEROVA Real-Time Daily Index" 
              stroke="#06B6D4" 
              strokeWidth={2.5} 
              dot={false}
              activeDot={{ r: 6, fill: '#06B6D4', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer / Takeaway Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.78rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={15} color="#F59E0B" />
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong>MoSPI Lag Revelation:</strong> The gold dashed line lags ~45 days. AEROVA captures the mid-August holiday surge immediately at T+0.
          </span>
        </div>
        <div style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
          {selectedRange}D Period Drift: +{netInflation}%
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const aerova = payload.find(p => p.dataKey === 'aerova_index')?.value;
    const official = payload.find(p => p.dataKey === 'official_cpi_transport')?.value;
    const diff = aerova && official ? (aerova - official).toFixed(2) : null;

    return (
      <div style={{
        background: '#0F172A',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
      }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
          Date: {label}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ color: '#06B6D4', fontWeight: 600 }}>AEROVA Daily Index:</span>
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{aerova}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ color: '#F59E0B', fontWeight: 600 }}>Official eSankhyiki CPI:</span>
            <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{official}</span>
          </div>
          {diff && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4px', marginTop: '2px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Augmentation Spread:</span>
              <span style={{ color: Number(diff) >= 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 700 }}>
                {Number(diff) >= 0 ? `+${diff}` : diff} pts
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}
