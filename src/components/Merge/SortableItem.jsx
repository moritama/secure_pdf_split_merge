import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, FileText } from 'lucide-react';

export const SortableItem = ({ id, file, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="glass-panel"
        >
            <div style={{
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)'
            }}>
                <div
                    {...attributes}
                    {...listeners}
                    style={{ cursor: 'grab', color: 'var(--text-secondary)', display: 'flex' }}
                >
                    <GripVertical size={20} />
                </div>

                <div style={{
                    width: '32px',
                    height: '32px',
                    background: '#ef4444',
                    borderRadius: '4px',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'white'
                }}>
                    <FileText size={16} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 500
                    }}>
                        {file.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                </div>

                <button
                    onClick={() => onRemove(id)}
                    style={{ color: 'var(--text-secondary)', padding: '4px' }}
                    className="hover:text-red-500" // Note: using tailwind utility if configured, but inline style works
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};
