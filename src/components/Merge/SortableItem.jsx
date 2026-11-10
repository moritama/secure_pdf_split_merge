import React, { useEffect, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, RotateCw, RotateCcw, ZoomIn } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

/**
 * 結合画面のグリッド上でドラッグ＆ドロップ並び替え・回転・削除・プレビューが可能な単一ページカードコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Object} props.item - ページアイテム情報 ({ id, fileId, fileName, pdfProxy, pageIndex, rotation, color })
 * @param {number} props.orderIndex - 結合後の通しページ番号 (0始まり)
 * @param {Function} props.onRotate - ページ回転時のコールバック (id, deltaAngle)
 * @param {Function} props.onRemove - ページ削除時のコールバック (id)
 * @param {Function} props.onPreview - 拡大プレビュー表示時のコールバック (item)
 */
export const SortableItem = ({ item, orderIndex, onRotate, onRemove, onPreview }) => {
    const { t } = useI18n();
    const canvasRef = useRef(null);
    // 描画完了済みの状態キー（ページインデックス＋回転角）を保持し、未描画時はローディング表示とする
    const [renderedKey, setRenderedKey] = useState('');
    const currentRenderKey = `${item.pageIndex}_${item.rotation || 0}`;
    const loading = renderedKey !== currentRenderKey;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    // ドラッグ＆ドロップ時の座標変換と明るいカード下地スタイル設定
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
        zIndex: isDragging ? 20 : 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '0.6rem',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: isDragging
            ? '2px solid #ef4444'
            : '1px solid #cbd5e1',
        boxShadow: isDragging
            ? '0 8px 20px rgba(239, 68, 68, 0.2)'
            : '0 1px 4px rgba(0, 0, 0, 0.06)',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        color: '#1e293b',
    };

    // PDFページサムネイルを回転角度込みでCanvasへ描画
    useEffect(() => {
        if (!item.pdfProxy) return;

        let cancelRender = false;
        let renderTask = null;
        const targetKey = `${item.pageIndex}_${item.rotation || 0}`;

        /**
         * サムネイル用のスケールでPDFページを描画する非同期関数
         */
        const renderThumbnail = async () => {
            try {
                const page = await item.pdfProxy.getPage(item.pageIndex + 1);
                if (cancelRender) return;

                // 元ページの回転角度にユーザーの回転角度を加算
                const totalRotation = (page.rotate + (item.rotation || 0)) % 360;
                const viewport = page.getViewport({ scale: 0.35, rotation: totalRotation });
                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                renderTask = page.render({
                    canvasContext: context,
                    viewport: viewport,
                });

                await renderTask.promise;
                if (!cancelRender) {
                    setRenderedKey(targetKey);
                }
            } catch (error) {
                if (error?.name !== 'RenderingCancelledException') {
                    console.error('サムネイル描画エラー:', error);
                }
            }
        };

        renderThumbnail();

        return () => {
            cancelRender = true;
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [item.pdfProxy, item.pageIndex, item.rotation]);

    // カード上部の小アイコンボタン共通スタイル（明るい背景に濃いアイコン色で視認性を確保）
    const actionBtnStyle = {
        padding: '4px',
        borderRadius: '6px',
        backgroundColor: '#f1f5f9',
        border: '1px solid #cbd5e1',
        color: '#334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            {/* カード上部：通し番号と操作ボタン群 */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    gap: '0.25rem',
                }}
            >
                {/* ドラッグハンドル＋結合後のページ番号バッジ */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        color: '#475569',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                    }}
                >
                    <GripVertical size={15} color="#64748b" />
                    <span
                        style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                        }}
                    >
                        #{orderIndex + 1}
                    </span>
                </div>

                {/* アクションボタン群（ドラッグ開始を阻止するため onPointerDown で stopPropagation） */}
                <div
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                    <button
                        type="button"
                        onClick={() => onPreview(item)}
                        title={t('merge.preview_page')}
                        style={actionBtnStyle}
                    >
                        <ZoomIn size={14} color="#334155" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onRotate(item.id, 270)}
                        title={t('merge.rotate_left')}
                        style={actionBtnStyle}
                    >
                        <RotateCcw size={14} color="#334155" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onRotate(item.id, 90)}
                        title={t('merge.rotate_right')}
                        style={actionBtnStyle}
                    >
                        <RotateCw size={14} color="#334155" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        title={t('merge.delete_page')}
                        style={{
                            ...actionBtnStyle,
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                        }}
                    >
                        <Trash2 size={14} color="#dc2626" />
                    </button>
                </div>
            </div>

            {/* サムネイル表示領域（クリックで拡大プレビューを起動） */}
            <div
                onClick={() => onPreview(item)}
                title={t('merge.preview_page')}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '170px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '0.4rem',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                }}
            >
                <canvas
                    ref={canvasRef}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '3px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                    }}
                />

                {loading && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: '#475569',
                            backgroundColor: 'rgba(248, 250, 252, 0.8)',
                        }}
                    >
                        Loading...
                    </div>
                )}

                {/* 回転角度が適用されている場合のバッジ表示 */}
                {item.rotation > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            bottom: '6px',
                            right: '6px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '999px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                    >
                        {item.rotation}°
                    </span>
                )}
            </div>

            {/* カード下部：元ファイル名と元ページ番号 */}
            <div
                style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                }}
            >
                <div
                    title={item.fileName}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        minWidth: 0,
                        flex: 1,
                    }}
                >
                    <span
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: item.color || '#ef4444',
                            flexShrink: 0,
                        }}
                    />
                    <span
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: '#334155',
                            fontWeight: 500,
                        }}
                    >
                        {item.fileName}
                    </span>
                </div>
                <span
                    style={{
                        color: '#0f172a',
                        fontWeight: 700,
                        flexShrink: 0,
                    }}
                >
                    P.{item.pageIndex + 1}
                </span>
            </div>
        </div>
    );
};
