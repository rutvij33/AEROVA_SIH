import React from 'react';
import { X, CheckCircle, Award, FileText } from 'lucide-react';

export default function MethodologyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '88vh',
          overflowY: 'auto',
          padding: '32px',
          background: '#0B101D',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={24} color="#818CF8" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                Statistical Methodology & MoSPI CPI Compliance
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Compliant with UN Practical Guide to Producing Consumer Price Indices & IMF Guidelines
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.86rem', lineHeight: '1.6' }}>
          
          {/* Section 1 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '8px' }}>
              1. Elementary Level Aggregation: Jevons Geometric Mean
            </h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              For each route <em>r</em> on observation day <em>t</em>, individual flight fare quotes <em>P(i, t)</em> are collected across airlines and advance windows. In accordance with MoSPI best practices for items with high price substitution elasticity, we compute the <strong>Jevons Elementary Index</strong>:
            </p>
            <div style={{ background: '#070B14', padding: '10px 16px', borderRadius: '6px', margin: '8px 0', fontFamily: 'monospace', color: '#93C5FD', fontSize: '0.88rem' }}>
              I_J(t) = exp [ (1/n) * Σ ln(P_i,t / P_i,0) ]
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Unlike the arithmetic Carli formula (which suffers from upward bias), the Jevons formula satisfies the Time Reversal Test and Transitivity Test.
            </p>
          </div>

          {/* Section 2 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--accent-indigo-light)', fontWeight: 700, marginBottom: '8px' }}>
              2. Advance Booking Window Distribution Profile
            </h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Airfares escalate non-linearly as departure nears. A single price snapshot misrepresents true consumer expenditure. AEROVA models the synthetic consumption profile across 5 advance purchase horizons:
            </p>
            <ul style={{ paddingLeft: '20px', marginTop: '6px', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              <li><strong>1 Day Prior:</strong> 15% (Urgent / High-yield)</li>
              <li><strong>7 Days Prior:</strong> 30% (Standard business)</li>
              <li><strong>15 Days Prior:</strong> 28% (Planned travel)</li>
              <li><strong>30 Days Prior:</strong> 18% (Early leisure)</li>
              <li><strong>45 Days Prior:</strong> 9% (Advance saver)</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--accent-saffron)', fontWeight: 700, marginBottom: '8px' }}>
              3. National Upper-Level Aggregation: Laspeyres Index with DGCA Weights
            </h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              The National Airfare Price Index (API) combines route elementary indices using official domestic passenger traffic shares reported by the Directorate General of Civil Aviation (DGCA):
            </p>
            <div style={{ background: '#070B14', padding: '10px 16px', borderRadius: '6px', margin: '8px 0', fontFamily: 'monospace', color: '#FCD34D', fontSize: '0.88rem' }}>
              API_t = Σ [ w_r * I_r(t) ] * Base_Index (2024 = 100)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Top corridors like Delhi-Mumbai (18.5%), Bengaluru-Delhi (14.2%), and Mumbai-Bengaluru (12.8%) carry representative volume weights reflecting actual household travel expenditures.
            </p>
          </div>

          {/* Section 4 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '8px' }}>
              4. Data Cleansing & Statutory Disaggregation
            </h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Fares are cleaned to remove scrap errors and promotional zero-fare coupons using Interquartile Range (IQR) bounding. Statutory fees (Aviation Security Fee ₹236, airport-specific User Development Fees, and 5% GST) are separated from dynamic airline base fares to ensure pure price index tracking.
            </p>
          </div>

        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-primary">
            Close Methodology Note
          </button>
        </div>
      </div>
    </div>
  );
}
