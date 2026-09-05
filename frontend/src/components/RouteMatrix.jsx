import React, { useState } from 'react';
import { PlaneTakeoff, Search, ArrowUpDown, Flame } from 'lucide-react';

export default function RouteMatrix({ routes, onSelectRoute }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('dgca_weight');
  const [sortAsc, setSortAsc] = useState(false);

  if (!routes || routes.length === 0) return null;

  const filtered = routes
    .filter(r => 
      r.route_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.origin_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destination_city.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlaneTakeoff size={18} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Domestic Corridors Basket (DGCA Traffic Weights)
            </h3>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Elementary Jevons aggregate prices across top 10 domestic air corridors
          </p>
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '6px 12px',
          width: '240px'
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search city or corridor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => handleSort('route_id')}>
                Corridor <ArrowUpDown size={12} style={{ display: 'inline' }} />
              </th>
              <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => handleSort('dgca_weight')}>
                DGCA Weight <ArrowUpDown size={12} style={{ display: 'inline' }} />
              </th>
              <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => handleSort('base_price')}>
                Base Price (2024) <ArrowUpDown size={12} style={{ display: 'inline' }} />
              </th>
              <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => handleSort('current_effective_fare')}>
                Current Fare <ArrowUpDown size={12} style={{ display: 'inline' }} />
              </th>
              <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => handleSort('route_index')}>
                Route Index <ArrowUpDown size={12} style={{ display: 'inline' }} />
              </th>
              <th style={{ padding: '10px 12px', cursor: 'pointer' }} onClick={() => handleSort('price_delta_pct')}>
                Inflation Delta <ArrowUpDown size={12} style={{ display: 'inline' }} />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const isHighSurge = r.price_delta_pct > 30;
              return (
                <tr
                  key={r.route_id}
                  onClick={() => onSelectRoute(r.route_id)}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--accent-indigo-light)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {r.route_id}
                      </span>
                      <span>{r.origin_city} ➔ {r.destination_city}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '50px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${r.dgca_weight_pct * 4}%`, height: '100%', background: 'var(--accent-indigo)' }} />
                      </div>
                      <span style={{ color: 'var(--text-secondary)' }}>{r.dgca_weight_pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    ₹{r.base_price.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                    ₹{r.current_effective_fare.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {r.route_index}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        color: r.price_delta_pct >= 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                        fontWeight: 700
                      }}>
                        {r.price_delta_pct >= 0 ? `+${r.price_delta_pct}` : r.price_delta_pct}%
                      </span>
                      {isHighSurge && (
                        <span title="High surge corridor" style={{ color: '#F59E0B' }}>
                          <Flame size={14} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
