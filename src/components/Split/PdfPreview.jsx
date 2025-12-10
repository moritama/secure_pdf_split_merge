import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

const PdfPreview = ({ file, selectedPages, onPageToggle }) => {
    const [pdfProxy, setPdfProxy] = useState(null);
    const [numPages, setNumPages] = useState(0);

    useEffect(() => {
        if (!file) return;

        const loadPdf = async () => {
            try {
                const fileReader = new FileReader();
                fileReader.onload = async function () {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    setPdfProxy(pdf);
                    setNumPages(pdf.numPages);
                };
                fileReader.readAsArrayBuffer(file);
            } catch (error) {
                console.error('Error loading PDF for preview:', error);
            }
        };

        loadPdf();
    }, [file]);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
        }}>
            {Array.from({ length: numPages }).map((_, index) => (
                <PageThumbnail
                    key={index}
                    pageIndex={index}
                    pdf={pdfProxy}
                    isSelected={selectedPages.includes(index)}
                    onToggle={() => onPageToggle(index)}
                />
            ))}
        </div>
    );
};

const PageThumbnail = ({ pageIndex, pdf, isSelected, onToggle }) => {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pdf) return;

        let cancelRender = false;

        const renderPage = async () => {
            try {
                const page = await pdf.getPage(pageIndex + 1);
                if (cancelRender) return;

                const viewport = page.getViewport({ scale: 0.3 }); // Small scale for thumbnail
                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                setLoading(false);
            } catch (error) {
                console.error('Page render error:', error);
            }
        };

        renderPage();

        return () => { cancelRender = true; };
    }, [pdf, pageIndex]);

    return (
        <div
            onClick={onToggle}
            className={`glass-panel cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : 'hover:bg-white/5'}`}
            style={{
                position: 'relative',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: isSelected ? '4px solid #ef4444' : '1px solid #e5e7eb'
            }}
        >
            <div style={{ position: 'relative', width: '100%', minHeight: '100px', display: 'flex', justifyContent: 'center' }}>
                <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} />
                {loading && <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">Loading...</div>}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: isSelected ? '#ef4444' : 'var(--text-secondary)' }}>
                Page {pageIndex + 1}
            </div>

            {isSelected && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '20px',
                    height: '20px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>✓</div>
            )}
        </div>
    );
};

export default PdfPreview;
