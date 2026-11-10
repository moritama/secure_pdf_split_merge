import { PDFDocument, degrees } from 'pdf-lib';

/**
 * ファイルをArrayBufferとして読み込む
 * @param {File} file - 読み込むPDFファイル
 * @returns {Promise<ArrayBuffer>} ファイルのArrayBuffer
 */
export const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

/**
 * 複数のPDFファイルまたは編集済みページ配列を結合して新しいPDFのバイト列を生成する
 * @param {Array<File | {file: File, pageIndex: number, rotation?: number}>} items - Fileオブジェクトの配列、またはページ情報の配列
 * @returns {Promise<Uint8Array>} 結合されたPDFのバイト配列
 */
export const mergePdfs = async (items) => {
    try {
        const mergedPdf = await PDFDocument.create();
        // 同一ファイルの重複読み込みを防ぐためのキャッシュマップ
        const loadedPdfCache = new Map();

        /**
         * ファイルをキャッシュ経由でPDFDocumentとして取得する内部関数
         * @param {File} file - 対象のPDFファイル
         * @returns {Promise<PDFDocument>} 読み込まれたPDFDocumentインスタンス
         */
        const getLoadedPdf = async (file) => {
            if (!loadedPdfCache.has(file)) {
                const fileBuffer = await readFileAsArrayBuffer(file);
                const pdf = await PDFDocument.load(fileBuffer);
                loadedPdfCache.set(file, pdf);
            }
            return loadedPdfCache.get(file);
        };

        for (const item of items) {
            // 従来のFileオブジェクト直接指定にも対応
            if (item instanceof File) {
                const pdf = await getLoadedPdf(item);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            } else {
                // ページ単位の指定（ページの並び替え・削除・回転に対応）
                const { file, pageIndex, rotation = 0 } = item;
                const pdf = await getLoadedPdf(file);
                const [copiedPage] = await mergedPdf.copyPages(pdf, [pageIndex]);

                // 回転角度が指定されている場合は、元のページの回転角に加算して適用する
                if (rotation !== 0) {
                    const currentRotation = copiedPage.getRotation().angle;
                    copiedPage.setRotation(degrees((currentRotation + rotation) % 360));
                }

                mergedPdf.addPage(copiedPage);
            }
        }

        const mergedPdfBytes = await mergedPdf.save();
        return mergedPdfBytes;
    } catch (error) {
        console.error('Error merging PDFs:', error);
        throw error;
    }
};

export const downloadPdf = (pdfBytes, filename = 'merged.pdf') => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const extractPages = async (file, pageIndices) => {
    try {
        const fileBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(fileBuffer);
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));
        return await newPdf.save();
    } catch (error) {
        console.error('Error extracting pages:', error);
        throw error;
    }
};

export const splitByPageCount = async (file, pagesPerFile) => {
    try {
        const fileBuffer = await readFileAsArrayBuffer(file);
        const pdf = await PDFDocument.load(fileBuffer);
        const totalPages = pdf.getPageCount();
        const splitFiles = [];

        for (let i = 0; i < totalPages; i += pagesPerFile) {
            const newPdf = await PDFDocument.create();
            const pageIndices = [];
            for (let j = 0; j < pagesPerFile && i + j < totalPages; j++) {
                pageIndices.push(i + j);
            }
            const copiedPages = await newPdf.copyPages(pdf, pageIndices);
            copiedPages.forEach((page) => newPdf.addPage(page));
            splitFiles.push(await newPdf.save());
        }
        return splitFiles;
    } catch (error) {
        console.error('Error periodic split:', error);
        throw error;
    }
};
