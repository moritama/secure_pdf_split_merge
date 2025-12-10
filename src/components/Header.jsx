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
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'var(--accent-primary)',
                    borderRadius: '8px',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 'bold'
                }}>
                    PDF
                </div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{t('app.title')}</h1>
            </div>

            <nav style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '8px' }}>
                <button
                    onClick={() => onTabChange('split')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        background: activeTab === 'split' ? 'var(--bg-primary)' : 'transparent',
                        color: activeTab === 'split' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'split' ? 600 : 400
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
                        background: activeTab === 'merge' ? 'var(--bg-primary)' : 'transparent',
                        color: activeTab === 'merge' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: activeTab === 'merge' ? 600 : 400
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
