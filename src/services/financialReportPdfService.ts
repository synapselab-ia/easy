import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FinancialReport } from '../domain/financialReporting';

export interface FinancialReportPdfOptions {
    includeSummary: boolean;
    includeTimeline: boolean;
    includeCategories: boolean;
    includeResellers: boolean;
}

export const DEFAULT_FINANCIAL_REPORT_PDF_OPTIONS: FinancialReportPdfOptions = {
    includeSummary: true,
    includeTimeline: true,
    includeCategories: true,
    includeResellers: true,
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

function money(value: number) {
    return currencyFormatter.format(value);
}

function formatDate(date: Date) {
    return date.toLocaleDateString('pt-BR');
}

function safeFilenameDate(date: Date) {
    return formatDate(date).replace(/\//g, '-');
}

function lastTableY(doc: jsPDF, fallback: number) {
    return (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? fallback;
}

function ensureSectionSpace(doc: jsPDF, y: number) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y <= pageHeight - 28) return y;
    doc.addPage();
    return 18;
}

function sectionTitle(doc: jsPDF, index: number, title: string, y: number) {
    const sectionY = ensureSectionSpace(doc, y);
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(`${String(index).padStart(2, '0')}  ${title}`, 14, sectionY);
    doc.setFont('helvetica', 'normal');
    return sectionY;
}

function subsectionTitle(doc: jsPDF, title: string, y: number) {
    const sectionY = ensureSectionSpace(doc, y);
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, sectionY);
    doc.setFont('helvetica', 'normal');
    return sectionY;
}

function productClassification(categoryLabel: string, subcategoryLabel?: string) {
    return subcategoryLabel ? `${categoryLabel} > ${subcategoryLabel}` : categoryLabel;
}

export function generateFinancialReportPdf(
    report: FinancialReport,
    options: FinancialReportPdfOptions = DEFAULT_FINANCIAL_REPORT_PDF_OPTIONS,
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let cursorY = 20;
    let sectionIndex = 0;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text('Relatório Financeiro', pageWidth / 2, cursorY, { align: 'center' });

    cursorY += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
        `${formatDate(report.range.startDate)} a ${formatDate(report.range.endDate)}`,
        pageWidth / 2,
        cursorY,
        { align: 'center' },
    );
    cursorY += 6;
    doc.text(
        `Gerado em ${new Date().toLocaleString('pt-BR')}`,
        pageWidth / 2,
        cursorY,
        { align: 'center' },
    );
    cursorY += 10;

    if (options.includeSummary) {
        cursorY = sectionTitle(doc, ++sectionIndex, 'RESUMO DO PERÍODO', cursorY) + 5;
        autoTable(doc, {
            startY: cursorY,
            head: [['Vendas', 'Recebimentos', 'Movimento líquido', 'Em aberto no fim']],
            body: [[
                money(report.summary.sales),
                money(report.summary.receipts),
                money(report.summary.periodNet),
                money(report.summary.openDebt),
            ]],
            theme: 'grid',
            styles: { fontSize: 10, halign: 'center', cellPadding: 4 },
            headStyles: { fontStyle: 'bold' },
        });
        cursorY = lastTableY(doc, cursorY) + 6;
        doc.setFontSize(8.5);
        doc.setTextColor(90, 90, 90);
        doc.text(
            `${report.summary.orderCount} pedidos · ${report.summary.itemQuantity} itens vendidos no período`,
            14,
            cursorY,
        );
        cursorY += 10;
    }

    if (options.includeTimeline && report.timeline.length > 0) {
        cursorY = sectionTitle(doc, ++sectionIndex, 'MOVIMENTO NO PERÍODO', cursorY) + 5;
        autoTable(doc, {
            startY: cursorY,
            head: [['Período', 'Vendas', 'Recebimentos', 'Movimento líquido']],
            body: report.timeline.map(point => [
                point.label,
                money(point.sales),
                money(point.receipts),
                money(point.sales - point.receipts),
            ]),
            theme: 'striped',
            styles: { fontSize: 8 },
            columnStyles: {
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right' },
            },
        });
        cursorY = lastTableY(doc, cursorY) + 10;
    }

    if (options.includeCategories && (report.products.length > 0 || report.categories.length > 0)) {
        cursorY = sectionTitle(doc, ++sectionIndex, 'PRODUTOS E CATEGORIAS', cursorY) + 5;

        if (report.products.length > 0) {
            cursorY = subsectionTitle(doc, 'Produtos vendidos', cursorY) + 4;
            autoTable(doc, {
                startY: cursorY,
                head: [['Produto', 'Classificação', 'Pedidos', 'Itens', 'Vendas']],
                body: report.products.map(product => [
                    product.label,
                    productClassification(product.categoryLabel, product.subcategoryLabel),
                    product.orderCount.toString(),
                    product.quantity.toString(),
                    money(product.grossValue),
                ]),
                theme: 'striped',
                styles: { fontSize: 8 },
                columnStyles: {
                    2: { halign: 'right', cellWidth: 18 },
                    3: { halign: 'right', cellWidth: 16 },
                    4: { halign: 'right', cellWidth: 31 },
                },
            });
            cursorY = lastTableY(doc, cursorY) + 8;
        }

        if (report.categories.length > 0) {
            cursorY = subsectionTitle(doc, 'Categorias e subcategorias', cursorY) + 4;
            const categoryRows = report.categories.flatMap(category => [
                [
                    category.label,
                    category.orderCount.toString(),
                    category.quantity.toString(),
                    money(category.grossValue),
                ],
                ...category.subcategories.map(subcategory => [
                    `   ↳ ${subcategory.label}`,
                    subcategory.orderCount.toString(),
                    subcategory.quantity.toString(),
                    money(subcategory.grossValue),
                ]),
            ]);
            autoTable(doc, {
                startY: cursorY,
                head: [['Categoria / subcategoria', 'Pedidos', 'Itens', 'Vendas']],
                body: categoryRows,
                theme: 'striped',
                styles: { fontSize: 8.5 },
                columnStyles: {
                    1: { halign: 'right', cellWidth: 22 },
                    2: { halign: 'right', cellWidth: 20 },
                    3: { halign: 'right', cellWidth: 34 },
                },
            });
            cursorY = lastTableY(doc, cursorY) + 10;
        }
    }

    if (options.includeResellers && report.resellers.length > 0) {
        cursorY = sectionTitle(doc, ++sectionIndex, 'REVENDEDORES', cursorY) + 5;
        autoTable(doc, {
            startY: cursorY,
            head: [['Revendedor', 'Pedidos', 'Vendas', 'Recebimentos', 'Em aberto no fim']],
            body: report.resellers.map(reseller => [
                reseller.name,
                reseller.orderCount.toString(),
                money(reseller.sales),
                money(reseller.receipts),
                money(reseller.openDebt),
            ]),
            theme: 'striped',
            styles: { fontSize: 8.5 },
            columnStyles: {
                1: { halign: 'right', cellWidth: 18 },
                2: { halign: 'right', cellWidth: 31 },
                3: { halign: 'right', cellWidth: 31 },
                4: { halign: 'right', cellWidth: 31 },
            },
        });
    }

    const filename = `relatorio_financeiro_${safeFilenameDate(report.range.startDate)}_a_${safeFilenameDate(report.range.endDate)}.pdf`;
    doc.save(filename);
}
