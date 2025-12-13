
import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import FileUploader from '../FileUploader';
import { SortableItem } from './SortableItem';
import { useI18n } from '../../hooks/useI18n';
import { mergePdfs, downloadPdf } from '../../utils/pdfHelpers';
import { Download, Loader2 } from 'lucide-react';

const MergeView = () => {
    const [files, setFiles] = useState([]);
    const [isMerging, setIsMerging] = useState(false);
    const { t } = useI18n();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFilesSelected = (newFiles) => {
        const filesWithId = newFiles.map(file => ({
            id: uuidv4(),
            file
        }));
        setFiles(prev => [...prev, ...filesWithId]);
    };

    const handleRemove = (id) => {
        setFiles(items => items.filter(item => item.id !== id));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleMerge = async () => {
        if (files.length < 2) return;

        setIsMerging(true);
        try {
            const fileObjects = files.map(f => f.file);
            const mergedBytes = await mergePdfs(fileObjects);
            downloadPdf(mergedBytes, `merged_${Date.now()}.pdf`);
        } catch (err) {
            console.error(err);
            alert(t('merge.error'));
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section>
                <FileUploader onFilesSelected={handleFilesSelected} label={t('merge.add_files')} />
            </section>

            {files.length > 0 && (
                <section className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{t('merge.file_list')} ({files.length})</h2>
                        <button
                            className="btn-primary"
                            onClick={handleMerge}
                            disabled={files.length < 2 || isMerging}
                            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: isMerging ? 0.7 : 1 }}
                        >
                            {isMerging ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                            {t('merge.execute')}
                        </button>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={files.map(f => f.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {files.map((item) => (
                                    <SortableItem key={item.id} id={item.id} file={item.file} onRemove={handleRemove} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </section>
            )}
        </div>
    );
};

export default MergeView;
