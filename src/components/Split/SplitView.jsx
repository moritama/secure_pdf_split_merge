import React, { useState, useEffect } from 'react';
import FileUploader from '../FileUploader';
import PdfPreview from './PdfPreview';
import { useI18n } from '../../hooks/useI18n';
import { extractPages, splitByPageCount, downloadPdf } from '../../utils/pdfHelpers';
import { Scissors, RefreshCw, Download, Loader2, Check } from 'lucide-react';

const SplitView = () => {
    const [file, setFile] = useState(null);
    const [selectedPages, setSelectedPages] = useState([]);
    const [splitMode, setSplitMode] = useState('selection'); // 'selection' or 'periodic'
    const [splitInterval, setSplitInterval] = useState(1);
    const { t } = useI18n();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelected = (files) => {
        if (files.length > 0) {
            setFile(files[0]); // Only handle first file for split
            setSelectedPages([]);
        }
    };

    const handlePageToggle = (pageIndex) => {
        setSelectedPages(prev => {
            if (prev.includes(pageIndex)) {
                return prev.filter(p => p !== pageIndex);
            } else {
                return [...prev, pageIndex].sort((a, b) => a - b);
            }
        });
    };

    const handleSelectiveSplit = async () => {
        if (selectedPages.length === 0) return;
        setIsProcessing(true);
        try {
            const pdfBytes = await extractPages(file, selectedPages);
            downloadPdf(pdfBytes, `extracted_pages_${Date.now()}.pdf`);
        } catch (error) {
            console.error(error);
            alert(t('split.extract_error'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePeriodicSplit = async () => {
        if (splitInterval < 1) return;
        setIsProcessing(true);
        try {
            const splitPdfs = await splitByPageCount(file, parseInt(splitInterval));
            // Download all files (in a real extension, maybe zip them, but for now individual downloads)
            // Browser might block multiple downloads without permission.
            // We will try to download them with delay or just one by one.
            splitPdfs.forEach((bytes, index) => {
                setTimeout(() => {
                    downloadPdf(bytes, `split_${index + 1}_${Date.now()}.pdf`);
                }, index * 500);
            });
        } catch (error) {
            console.error(error);
            alert(t('split.split_error'));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {!file ? (
                <FileUploader onFilesSelected={handleFileSelected} multiple={false} label={t('split.select_file')} />
            ) : (
                <div className="animate-fade-in">
                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{file.name}</span>
                            <button onClick={() => setFile(null)} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                                {t('split.change_file')}
                            </button>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div
                            onClick={() => setSplitMode('selection')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '8px',
                                border: `2px solid ${splitMode === 'selection' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                background: splitMode === 'selection' ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: splitMode === 'selection' ? 'var(--accent-primary)' : 'inherit' }}>
                                <Check size={18} /> {t('split.mode_selection')}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {t('split.mode_selection_desc')}
                            </p>
                        </div>
                        <div
                            onClick={() => setSplitMode('periodic')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '8px',
                                border: `2px solid ${splitMode === 'periodic' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                background: splitMode === 'periodic' ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: splitMode === 'periodic' ? 'var(--accent-primary)' : 'inherit' }}>
                                <RefreshCw size={18} /> {t('split.mode_periodic')}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {t('split.mode_periodic_desc')}
                            </p>
                        </div>
                    </div>

                    {splitMode === 'periodic' && (
                        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <label>{t('split.split_interval')}</label>
                            <input
                                type="number"
                                min="1"
                                value={splitInterval}
                                onChange={(e) => setSplitInterval(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 w-20"
                            />
                            <span>{t('split.split_every_page')}</span>
                            <button
                                className="btn-primary"
                                onClick={handlePeriodicSplit}
                                disabled={isProcessing}
                                style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Scissors size={18} />}
                                {t('split.execute_split')}
                            </button>
                        </div>
                    )}

                    {splitMode === 'selection' && (
                        <div className="glass-panel animate-fade-in" style={{ padding: '1rem', position: 'sticky', top: '5rem', zIndex: 50, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>{t('split.selected_pages', { count: selectedPages.length })}</strong>
                            </div>
                            <button
                                className="btn-primary"
                                onClick={handleSelectiveSplit}
                                disabled={selectedPages.length === 0 || isProcessing}
                                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: selectedPages.length === 0 ? 0.5 : 1 }}
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                {t('split.extract_selected')}
                            </button>
                        </div>
                    )}

                    <div style={{ opacity: splitMode === 'periodic' ? 0.5 : 1, pointerEvents: splitMode === 'periodic' ? 'none' : 'auto' }}>
                        <PdfPreview file={file} selectedPages={selectedPages} onPageToggle={handlePageToggle} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplitView;
