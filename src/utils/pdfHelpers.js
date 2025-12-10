import { PDFDocument } from 'pdf-lib';

export const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

export const mergePdfs = async (files) => {
    try {
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const fileBuffer = await readFileAsArrayBuffer(file);
            const pdf = await PDFDocument.load(fileBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
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
