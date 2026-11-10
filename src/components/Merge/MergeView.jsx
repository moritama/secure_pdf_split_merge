import React, { useState, useMemo, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import * as pdfjsLib from 'pdfjs-dist';
import FileUploader from '../FileUploader';
import { SortableItem } from './SortableItem';
import PagePreviewModal from './PagePreviewModal';
import { useI18n } from '../../hooks/useI18n';
import { mergePdfs, downloadPdf, readFileAsArrayBuffer } from '../../utils/pdfHelpers';
import { Download, Loader2, Trash2, X, FileText } from 'lucide-react';

/**
 * 複数ファイルを識別しやすくするためのアクセントカラーパレット
 */
const FILE_COLORS = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#f43f5e', // Rose
    '#14b8a6', // Teal
];

/**
 * PDFファイルの結合および結合前のページ単位編集（並び替え・回転・削除・プレビュー）を行う画面コンポーネント
 */
const MergeView = () => {
    // 全ページのフラットな配列（案1：全ページ一括グリッド方式）
    const [pages, setPages] = useState([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [isMerging, setIsMerging] = useState(false);
    const [previewPageId, setPreviewPageId] = useState(null);
    const colorCounterRef = useRef(0);
    const { t } = useI18n();

    // 6px以上動かしたときにドラッグを開始することで、ボタンクリックやプレビュークリックとの競合を防ぐ
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    /**
     * アップロードされたPDFファイルを読み込み、ページ単位のアイテムに展開して追加する
     * @param {File[]} newFiles - 追加されたPDFファイルの配列
     */
    const handleFilesSelected = async (newFiles) => {
        if (!newFiles || newFiles.length === 0) return;

        setIsLoadingFiles(true);
        try {
            const expandedPages = [];

            for (const file of newFiles) {
                const fileId = uuidv4();
                const color = FILE_COLORS[colorCounterRef.current % FILE_COLORS.length];
                colorCounterRef.current += 1;

                // pdfjs-dist でドキュメントを読み込み、総ページ数を取得
                const buffer = await readFileAsArrayBuffer(file);
                const typedArray = new Uint8Array(buffer);
                const pdfProxy = await pdfjsLib.getDocument(typedArray).promise;

                for (let i = 0; i < pdfProxy.numPages; i++) {
                    expandedPages.push({
                        id: uuidv4(),
                        fileId,
                        fileName: file.name,
                        file,
                        pdfProxy,
                        pageIndex: i,
                        rotation: 0,
                        color,
                    });
                }
            }

            setPages((prev) => [...prev, ...expandedPages]);
        } catch (error) {
            console.error('PDF展開エラー:', error);
            alert(t('merge.error'));
        } finally {
            setIsLoadingFiles(false);
        }
    };

    /**
     * 指定したIDのページを一覧から削除する
     * @param {string} id - 削除対象ページのユニークID
     */
    const handleRemovePage = (id) => {
        setPages((items) => items.filter((item) => item.id !== id));
    };

    /**
     * 指定したファイルに属するすべてのページを一括削除する
     * @param {string} fileId - 削除対象ファイルのID
     */
    const handleRemoveFilePages = (fileId) => {
        setPages((items) => items.filter((item) => item.fileId !== fileId));
    };

    /**
     * すべてのページをクリアする
     */
    const handleClearAll = () => {
        setPages([]);
        setPreviewPageId(null);
    };

    /**
     * 指定したIDのページを回転させる
     * @param {string} id - 回転対象ページのユニークID
     * @param {number} deltaAngle - 加算する回転角度（90 または 270）
     */
    const handleRotatePage = (id, deltaAngle) => {
        setPages((items) =>
            items.map((item) =>
                item.id === id
                    ? { ...item, rotation: ((item.rotation || 0) + deltaAngle) % 360 }
                    : item
            )
        );
    };

    /**
     * ドラッグ＆ドロップ終了時にページの並び順を更新する
     * @param {Object} event - dnd-kitのドラッグ終了イベント
     */
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    /**
     * 現在のページ順序・回転状態を反映してPDFを結合しダウンロードする
     */
    const handleMerge = async () => {
        if (pages.length === 0) return;

        setIsMerging(true);
        try {
            const mergedBytes = await mergePdfs(pages);
            downloadPdf(mergedBytes, `merged_${Date.now()}.pdf`);
        } catch (err) {
            console.error(err);
            alert(t('merge.error'));
        } finally {
            setIsMerging(false);
        }
    };

    // 現在グリッド上に残っているファイルのサマリー情報（ファイルバッジ表示用）
    const activeFilesSummary = useMemo(() => {
        const map = new Map();
        for (const page of pages) {
            if (!map.has(page.fileId)) {
                map.set(page.fileId, {
                    fileId: page.fileId,
                    fileName: page.fileName,
                    color: page.color,
                    count: 0,
                });
            }
            map.get(page.fileId).count += 1;
        }
        return Array.from(map.values());
    }, [pages]);

    // 拡大プレビューモーダル用の現在ページ情報とインデックス
    const previewPageIndex = useMemo(
        () => pages.findIndex((p) => p.id === previewPageId),
        [pages, previewPageId]
    );
    const previewPageItem = previewPageIndex >= 0 ? pages[previewPageIndex] : null;

    /**
     * 拡大プレビューモーダル内で前後のページへ移動する
     * @param {number} targetIndex - 移動先のページインデックス
     */
    const handleModalNavigate = (targetIndex) => {
        if (targetIndex >= 0 && targetIndex < pages.length) {
            setPreviewPageId(pages[targetIndex].id);
        }
    };

    return (
        <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* ファイルアップロード領域 */}
            <section>
                <FileUploader onFilesSelected={handleFilesSelected} label={t('merge.add_files')} />
            </section>

            {/* ファイル展開中のローディング表示 */}
            {isLoadingFiles && (
                <div
                    className="glass-panel animate-fade-in"
                    style={{
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        backgroundColor: '#fff1f2',
                        border: '1px solid #fecaca',
                        borderRadius: '10px',
                        color: '#1e293b',
                        fontWeight: 500,
                    }}
                >
                    <Loader2 className="animate-spin" size={20} color="#dc2626" />
                    <span>{t('merge.loading_pages')}</span>
                </div>
            )}

            {/* ページ編集・結合グリッドセクション */}
            {pages.length > 0 && (
                <section className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* スティッキーヘッダーバー（総ページ数・クリア・結合実行ボタン） */}
                    <div
                        className="glass-panel"
                        style={{
                            padding: '1rem 1.25rem',
                            position: 'sticky',
                            top: '5.5rem',
                            zIndex: 40,
                            backgroundColor: '#fff1f2',
                            border: '1px solid #fecaca',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                            color: '#1e293b',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem',
                        }}
                    >
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{t('merge.page_list')}</h2>
                                <span
                                    style={{
                                        backgroundColor: '#fee2e2',
                                        color: '#dc2626',
                                        border: '1px solid #fca5a5',
                                        padding: '0.2rem 0.65rem',
                                        borderRadius: '999px',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {t('merge.page_count', { count: pages.length })}
                                </span>
                            </div>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#475569' }}>
                                {t('merge.hint')}
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                disabled={isMerging}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.65rem 1rem',
                                    borderRadius: '8px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    color: '#334155',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                }}
                            >
                                <Trash2 size={16} color="#334155" />
                                {t('merge.clear_all')}
                            </button>

                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleMerge}
                                disabled={pages.length === 0 || isMerging}
                                style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    alignItems: 'center',
                                    padding: '0.65rem 1.25rem',
                                    borderRadius: '8px',
                                    backgroundColor: '#ef4444',
                                    border: '1px solid #dc2626',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    opacity: isMerging ? 0.7 : 1,
                                }}
                            >
                                {isMerging ? <Loader2 className="animate-spin" size={20} color="#ffffff" /> : <Download size={20} color="#ffffff" />}
                                {t('merge.execute')}
                            </button>
                        </div>
                    </div>

                    {/* 読み込み済みファイルのバッジ一覧（薄い背景色でファイル名がはっきり見えるように設定） */}
                    {activeFilesSummary.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                            {activeFilesSummary.map((fileInfo) => (
                                <div
                                    key={fileInfo.fileId}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        backgroundColor: '#fff1f2',
                                        border: '1px solid #fca5a5',
                                        color: '#1e293b',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: fileInfo.color,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <FileText size={14} color="#475569" />
                                    <span style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, color: '#1e293b' }}>
                                        {fileInfo.fileName}
                                    </span>
                                    <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 500 }}>
                                        ({fileInfo.count}p)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFilePages(fileInfo.fileId)}
                                        title={t('merge.remove_file_pages')}
                                        style={{
                                            padding: '2px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#fee2e2',
                                            border: '1px solid #fca5a5',
                                            color: '#dc2626',
                                            borderRadius: '50%',
                                        }}
                                    >
                                        <X size={13} color="#dc2626" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 全ページ一括グリッド（ドラッグ＆ドロップ並び替え対応） */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={pages.map((p) => p.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
                                    gap: '1rem',
                                }}
                            >
                                {pages.map((item, index) => (
                                    <SortableItem
                                        key={item.id}
                                        item={item}
                                        orderIndex={index}
                                        onRotate={handleRotatePage}
                                        onRemove={handleRemovePage}
                                        onPreview={(target) => setPreviewPageId(target.id)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </section>
            )}

            {/* ページの拡大プレビューモーダル */}
            <PagePreviewModal
                pageItem={previewPageItem}
                currentIndex={previewPageIndex}
                totalCount={pages.length}
                onClose={() => setPreviewPageId(null)}
                onRotate={handleRotatePage}
                onRemove={handleRemovePage}
                onNavigate={handleModalNavigate}
            />
        </div>
    );
};

export default MergeView;
