import React from 'react';
import { Plane, RefreshCw, BookOpen, Download, Database, Activity } from 'lucide-react';

export default function Header({ onRefresh, isRefreshing, onOpenMethodology, onOpenESankhyiki, lastUpdated }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '14px 28px'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left: Brand & MoSPI Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)'
          }}>
            <Plane size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #FFFFFF, #93C5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AEROVA
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#818CF8'
              }}>
                SIH26056 • MoSPI
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Real-time High-Frequency Airfare Index for CPI Augmentation
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: '#F59E0B' }}>eSankhyiki Base 2024=100</span>
            </p>
          </div>
        </div>

        {/* Center: System Connectivity Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          padding: '6px 14px',
          borderRadius: '30px'
        }}>
          <span className="pulse-dot" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
            LIVE INGESTION
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>|</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            10 Trunk Corridors • 5 Advance Windows
          </span>
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            id="btn-methodology"
            onClick={onOpenMethodology} 
            className="btn-secondary"
            title="Statistical formulas and MoSPI standards"
          >
            <BookOpen size={16} color="#818CF8" />
            <span>Methodology</span>
          </button>

          <button 
            id="btn-esankhyiki-feed"
            onClick={onOpenESankhyiki} 
            className="btn-secondary"
            style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}
            title="Inspect eSankhyiki data feed"
          >
            <Database size={16} color="#F59E0B" />
            <span>eSankhyiki Feed</span>
          </button>

          <button 
            id="btn-recompute"
            onClick={onRefresh} 
            disabled={isRefreshing}
            className="btn-primary"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-anim' : ''} />
            <span>{isRefreshing ? 'Ingesting...' : 'Sync Fares'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
