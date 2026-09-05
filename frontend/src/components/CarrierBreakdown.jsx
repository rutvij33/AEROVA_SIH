import React from 'react';
import { ShieldCheck, AlertOctagon, Tag } from 'lucide-react';

export default function CarrierBreakdown({ carriers, anomalies }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
      {/* Carrier Price Dispersion */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={18} color="var(--accent-saffron)" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Carrier Dispersion & Average Yield
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Pricing variance between Low-Cost Carriers (LCC) and Full-Service Airlines
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {carriers && carriers.map((c) => (
            <div key={c.carrier} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FFFFFF' }}>
                  {c.carrier}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Spread: ₹{c.min_fare.toLocaleString()} - ₹{c.max_fare.toLocaleString()} ({c.quotes_count} quotes)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  ₹{c.avg_fare.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  Mean Sampled Fare
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Surge Anomalies */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertOctagon size={18} color="var(--accent-rose)" />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Real-Time Surge Anomaly Detector
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Fares exceeding 1.9× base benchmark (predatory spikes vs holiday surges)
              </p>
            </div>
          </div>
          <span style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'rgba(244, 63, 94, 0.15)',
            color: 'var(--accent-rose)',
            fontWeight: 700
          }}>
            {anomalies ? anomalies.length : 0} Active Spikes
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '310px', overflowY: 'auto' }}>
          {anomalies && anomalies.length > 0 ? (
            anomalies.map((a, idx) => (
              <div key={idx} style={{
                background: 'rgba(244, 63, 94, 0.04)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#FFFFFF' }}>
                      {a.corridor}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ({a.carrier} {a.flight_number})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-saffron)', marginTop: '2px' }}>
                    {a.advance_days} • {a.status}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-rose)' }}>
                    ₹{a.total_fare.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {a.surge_multiple}× Base Reference
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No critical pricing anomalies detected in current observation window.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
