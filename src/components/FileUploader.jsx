import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { clsx } from 'clsx'; // I installed clsx

const FileUploader = ({ onFilesSelected, multiple = true, label }) => {
    const { t } = useI18n();
    const displayLabel = label || t('uploader.drop_text');
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
        if (files.length > 0) {
            onFilesSelected(files);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        if (files.length > 0) {
            onFilesSelected(files);
        }
        // Reset input to allow selecting same file again
        e.target.value = '';
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsx(
                "glass-panel",
                "drag-overlay",
                "animate-fade-in",
                { "active": isDragging }
            )}
            style={{
                padding: '3rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderColor: isDragging ? 'var(--accent-primary)' : 'var(--border-color)',
                background: isDragging ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-glass)'
            }}
        >
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileInput}
                accept=".pdf"
                multiple={multiple}
                style={{ display: 'none' }}
            />

            <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    padding: '1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '50%',
                    color: 'var(--accent-primary)'
                }}>
                    <UploadCloud size={48} />
                </div>
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{displayLabel}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {multiple ? t('uploader.help_text_multiple') : t('uploader.help_text_single')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FileUploader;
