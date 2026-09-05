import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Clock, Navigation } from 'lucide-react';

export default function AdvanceCurveChart({ curveData, routes, selectedRoute, onSelectRoute }) {
  if (!curveData || curveData.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading booking curve data...</p>
      </div>
    );
  }

  // Find price premium of 1-day vs 45-day
  const day1 = curveData.find(d => d.advance_days === 1)?.avg_total_fare || 0;
  const day45 = curveData.find(d => d.advance_days === 45)?.avg_total_fare || 1;
  const leadPremium = day45 > 0 ? (((day1 - day45) / day45) * 100).toFixed(0) : 0;

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--accent-indigo-light)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Dynamic Booking Lead-Time Curve
            </h3>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Price elasticity as departure approaches (1d vs 7d vs 15d vs 30d vs 45d)
          </p>
        </div>

        {/* Route Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={14} color="var(--text-muted)" />
          <select
            value={selectedRoute || ''}
            onChange={(e) => onSelectRoute(e.target.value || null)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="" style={{ background: '#0D1322' }}>All Monitored Corridors (Aggregate)</option>
            {routes && routes.map(r => (
              <option key={r.route_id} value={r.route_id} style={{ background: '#0D1322' }}>
                {r.route_id} ({r.origin_city} ➔ {r.destination_city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={curveData} margin={{ top: 10, right: 15, left: -5, bottom: 0 }}>
            <defs>
              <linearGradient id="leadCurveGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis 
              dataKey="label" 
              stroke="var(--text-muted)" 
              fontSize={11}
              tickLine={false}
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={11}
              domain={['auto', 'auto']}
              tickFormatter={(v) => `₹${(v/1000).toFixed(1)}k`}
              tickLine={false}
            />
            <Tooltip content={<CurveTooltip />} />
            <Area 
              type="monotone" 
              dataKey="avg_total_fare" 
              stroke="#818CF8" 
              strokeWidth={3} 
              fill="url(#leadCurveGlow)" 
              dot={{ r: 4, fill: '#818CF8', stroke: '#070B14', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#818CF8', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
        <span>
          <strong>Last-Minute Premium:</strong> Urgent bookings (1d) cost <strong>+{leadPremium}%</strong> vs 45d advance.
        </span>
        <span style={{ color: '#818CF8', fontWeight: 600 }}>
          MoSPI Consumption-Weighted Aggregate
        </span>
      </div>
    </div>
  );
}

function CurveTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#0F172A',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
          {label} Departure
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>
          ₹{data.avg_total_fare.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Base: ₹{data.avg_base_fare.toLocaleString()} • Range: ₹{data.min_fare.toLocaleString()} - ₹{data.max_fare.toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
}
