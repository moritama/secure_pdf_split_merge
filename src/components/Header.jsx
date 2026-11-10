import React from 'react';
import { Layers, Scissors } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const Header = ({ activeTab, onTabChange }) => {
    const { t } = useI18n();
    return (
        <header className="glass-panel" style={{
            margin: '1rem',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: '1rem',
            zIndex: 100,
            // 透過しない薄い赤の下地を設定
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            color: '#1e293b'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '8px',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                }}>
                    PDF
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{t('app.title')}</h1>
                    {/* 拡張機能のバージョン表記バッジ */}
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.5rem',
                        borderRadius: '999px',
                        background: '#ffffff',
                        color: '#dc2626',
                        border: '1px solid #fca5a5'
                    }}>
                        {t('app.version')}
                    </span>
                </div>
            </div>

            <nav style={{
                display: 'flex',
                gap: '0.5rem',
                background: '#fecaca',
                padding: '0.25rem',
                borderRadius: '8px'
            }}>
                <button
                    onClick={() => onTabChange('split')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        background: activeTab === 'split' ? '#ffffff' : 'transparent',
                        color: activeTab === 'split' ? '#dc2626' : '#475569',
                        fontWeight: activeTab === 'split' ? 700 : 500,
                        boxShadow: activeTab === 'split' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                >
                    <Scissors size={18} />
                    {t('nav.split')}
                </button>
                <button
                    onClick={() => onTabChange('merge')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        background: activeTab === 'merge' ? '#ffffff' : 'transparent',
                        color: activeTab === 'merge' ? '#dc2626' : '#475569',
                        fontWeight: activeTab === 'merge' ? 700 : 500,
                        boxShadow: activeTab === 'merge' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                >
                    <Layers size={18} />
                    {t('nav.merge')}
                </button>
            </nav>
        </header>
    );
};

export default Header;
