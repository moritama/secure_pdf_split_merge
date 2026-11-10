import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, RotateCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

/**
 * 結合前の単一ページを大きく表示・操作するための拡大プレビューモーダルコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Object|null} props.pageItem - 表示対象のページアイテム情報
 * @param {number} props.currentIndex - 結合後リスト内での現在のインデックス (0始まり)
 * @param {number} props.totalCount - 結合後リストの総ページ数
 * @param {Function} props.onClose - モーダルを閉じるコールバック
 * @param {Function} props.onRotate - ページを回転するコールバック (id, deltaAngle)
 * @param {Function} props.onRemove - ページを削除するコールバック (id)
 * @param {Function} props.onNavigate - 前後のページへ移動するコールバック (newIndex)
 */
const PagePreviewModal = ({
    pageItem,
    currentIndex,
    totalCount,
    onClose,
    onRotate,
    onRemove,
    onNavigate,
}) => {
    const { t } = useI18n();
    const canvasRef = useRef(null);
    // 描画完了済みの状態キー（ページID＋回転角）を保持し、現在のキーと異なる場合はローディング中と判定する
    const [renderedKey, setRenderedKey] = useState('');
    const currentRenderKey = pageItem ? `${pageItem.id}_${pageItem.rotation || 0}` : '';
    const loading = Boolean(pageItem && renderedKey !== currentRenderKey);

    // キーボードショートカット（Escで閉じる、左右矢印キーで前後ページ移動）の登録
    useEffect(() => {
        if (!pageItem) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                onNavigate(currentIndex - 1);
            } else if (e.key === 'ArrowRight' && currentIndex < totalCount - 1) {
                onNavigate(currentIndex + 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageItem, currentIndex, totalCount, onClose, onNavigate]);

    // 対象ページおよび回転角度に応じた高解像度Canvas描画
    useEffect(() => {
        if (!pageItem || !pageItem.pdfProxy) return;

        let cancelRender = false;
        let renderTask = null;
        const targetKey = `${pageItem.id}_${pageItem.rotation || 0}`;

        /**
         * PDFページを高解像度でCanvasへ描画する非同期関数
         */
        const renderLargePage = async () => {
            try {
                const page = await pageItem.pdfProxy.getPage(pageItem.pageIndex + 1);
                if (cancelRender) return;

                // 元ページの回転角にユーザー指定の回転角を加算してビューポートを生成
                const totalRotation = (page.rotate + (pageItem.rotation || 0)) % 360;
                const viewport = page.getViewport({ scale: 1.5, rotation: totalRotation });
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
                // レンダリングキャンセル時以外のエラーを出力
                if (error?.name !== 'RenderingCancelledException') {
                    console.error('拡大プレビュー描画エラー:', error);
                }
            }
        };

        renderLargePage();

        return () => {
            cancelRender = true;
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [pageItem]);

    if (!pageItem) return null;

    /**
     * モーダル内で削除ボタンを押した際のハンドラ
     */
    const handleDeleteInModal = () => {
        const targetId = pageItem.id;
        // 削除後に表示するページインデックスを調整、1ページしかない場合はモーダルを閉じる
        if (totalCount <= 1) {
            onClose();
        } else if (currentIndex >= totalCount - 1) {
            onNavigate(currentIndex - 1);
        }
        onRemove(targetId);
    };

    // モーダル内の通常操作ボタンスタイル（明るい背景に濃い文字・アイコン）
    const modalBtnStyle = {
        padding: '0.45rem 0.75rem',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
            }}
        >
            {/* モーダル上部コントロールバー（薄い赤の下地で文字・アイコンの視認性を確保） */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '900px',
                    padding: '0.75rem 1.25rem',
                    marginBottom: '1rem',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    boxSizing: 'border-box',
                }}
            >
                {/* ページ情報表示 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <span
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: pageItem.color || '#ef4444',
                            flexShrink: 0,
                        }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t('merge.modal_page_info', {
                            index: currentIndex + 1,
                            total: totalCount,
                            fileName: pageItem.fileName,
                            originalPage: pageItem.pageIndex + 1,
                        })}
                    </span>
                    {pageItem.rotation > 0 && (
                        <span style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            fontWeight: 700,
                        }}>
                            {pageItem.rotation}°
                        </span>
                    )}
                </div>

                {/* 操作ボタン群（回転・削除・閉じる） */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        type="button"
                        onClick={() => onRotate(pageItem.id, 270)}
                        title={t('merge.rotate_left')}
                        style={modalBtnStyle}
                    >
                        <RotateCcw size={16} color="#1e293b" />
                        <span>-90°</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onRotate(pageItem.id, 90)}
                        title={t('merge.rotate_right')}
                        style={modalBtnStyle}
                    >
                        <RotateCw size={16} color="#1e293b" />
                        <span>+90°</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteInModal}
                        title={t('merge.delete_page')}
                        style={{
                            ...modalBtnStyle,
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fca5a5',
                            color: '#dc2626',
                        }}
                    >
                        <Trash2 size={16} color="#dc2626" />
                    </button>
                    <div style={{ width: '1px', height: '24px', backgroundColor: '#fca5a5', margin: '0 0.25rem' }} />
                    <button
                        type="button"
                        onClick={onClose}
                        title={t('merge.close')}
                        style={{
                            ...modalBtnStyle,
                            padding: '0.45rem',
                        }}
                    >
                        <X size={20} color="#1e293b" />
                    </button>
                </div>
            </div>

            {/* プレビュー本体と左右ナビゲーションボタン */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: '900px',
                    flex: 1,
                    minHeight: 0,
                    gap: '1rem',
                }}
            >
                {/* 前のページへ */}
                <button
                    type="button"
                    onClick={() => onNavigate(currentIndex - 1)}
                    disabled={currentIndex <= 0}
                    title={t('merge.prev_page')}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#1e293b',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        opacity: currentIndex <= 0 ? 0.35 : 1,
                        cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <ChevronLeft size={24} color="#1e293b" />
                </button>

                {/* Canvas コンテナ */}
                <div
                    style={{
                        flex: 1,
                        height: '100%',
                        maxHeight: '78vh',
                        overflow: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                        position: 'relative',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
                            backgroundColor: '#ffffff',
                        }}
                    />
                    {loading && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(248, 250, 252, 0.75)',
                            color: '#1e293b',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                        }}>
                            Loading...
                        </div>
                    )}
                </div>

                {/* 次のページへ */}
                <button
                    type="button"
                    onClick={() => onNavigate(currentIndex + 1)}
                    disabled={currentIndex >= totalCount - 1}
                    title={t('merge.next_page')}
                    style={{
                        padding: '0.75rem',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#1e293b',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        opacity: currentIndex >= totalCount - 1 ? 0.35 : 1,
                        cursor: currentIndex >= totalCount - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <ChevronRight size={24} color="#1e293b" />
                </button>
            </div>
        </div>
    );
};

export default PagePreviewModal;
