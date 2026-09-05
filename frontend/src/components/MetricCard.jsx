import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({ title, value, unit, delta, deltaLabel, icon: Icon, accentColor, subtitle }) {
  const isPositive = delta > 0;
  const isZero = delta === 0 || delta === undefined || delta === null;

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top ambient color glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: accentColor || 'var(--accent-indigo)'
      }} />

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={16} color={accentColor || 'var(--accent-indigo)'} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        {delta !== undefined && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
            background: isZero ? 'rgba(255, 255, 255, 0.05)' : isPositive ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isZero ? 'var(--text-muted)' : isPositive ? 'var(--accent-rose)' : 'var(--accent-emerald)'
          }}>
            {isZero ? <Minus size={12} /> : isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{Math.abs(delta)}%</span>
            <span style={{ fontWeight: 400, opacity: 0.8 }}>{deltaLabel || '24h'}</span>
          </div>
        )}
        {subtitle && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
