import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Reseller, type Transaction } from '../db/database';
import {
    calculateBalance,
    effectiveTransactions,
    transactionOccurredAt,
    type StatementPeriod,
    type StatementRange,
} from '../domain/transactions';

export type DateRange = StatementRange;

type OrderGroup = {
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    transactions: Transaction[];
};

function formatMoney(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function groupOrders(transactions: Transaction[]) {
    const groups = new Map<string, OrderGroup>();

    effectiveTransactions(transactions)
        .filter(transaction => transaction.type === 'order')
        .forEach(transaction => {
            const quantity = transaction.quantity ?? 1;
            const unitPrice = transaction.unitPrice ?? (
                quantity > 0 ? transaction.totalPrice / quantity : transaction.totalPrice
            );
            const itemName = transaction.itemName?.trim() || 'Item não informado';
            const key = [
                transaction.itemId ?? 'legacy',
                itemName.toLocaleLowerCase('pt-BR'),
                unitPrice.toFixed(4),
            ].join('|');

            const current = groups.get(key);
            if (current) {
                current.quantity += quantity;
                current.totalPrice += transaction.totalPrice;
                current.transactions.push(transaction);
                return;
            }

            groups.set(key, {
                itemName,
                quantity,
                unitPrice,
                totalPrice: transaction.totalPrice,
                transactions: [transaction],
            });
        });

    return [...groups.values()];
}

function orderTableBody(transactions: Transaction[]) {
    return groupOrders(transactions).flatMap(group => {
        const rows = [[
            { content: group.itemName, styles: { fontStyle: 'bold' as const, textColor: [0, 0, 0] as [number, number, number] } },
            { content: group.quantity.toString(), styles: { fontStyle: 'bold' as const, textColor: [0, 0, 0] as [number, number, number] } },
            { content: formatMoney(group.unitPrice), styles: { textColor: [0, 0, 0] as [number, number, number] } },
            { content: formatMoney(group.totalPrice), styles: { fontStyle: 'bold' as const, textColor: [220, 38, 38] as [number, number, number] } },
        ]];

        const details = group.transactions.flatMap(transaction => {
            const observation = transaction.observation?.trim();
            if (!observation) return [];

            return [[{
                content: observation,
                colSpan: 4,
                styles: {
                    fontStyle: 'italic' as const,
                    textColor: [90, 90, 90] as [number, number, number],
                    cellPadding: { top: 1, right: 2, bottom: 1, left: 8 },
                },
            }]];
        });

        return [...rows, ...details];
    });
}

function paymentTableBody(transactions: Transaction[]) {
    return effectiveTransactions(transactions)
        .filter(transaction => transaction.type !== 'order')
        .map(transaction => [
            transactionOccurredAt(transaction).toLocaleDateString('pt-BR'),
            transaction.type === 'payment' ? 'Pagamento' : 'Sinal',
            formatMoney(transaction.totalPrice),
        ]);
}

export function generateResellerExtract(
    reseller: Reseller,
    transactions: Transaction[],
    balanceOrStatement: number | StatementPeriod,
    legacyDateRange?: DateRange
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const statement = typeof balanceOrStatement === 'number' ? undefined : balanceOrStatement;
    const dateRange = statement?.range ?? legacyDateRange;
    const providedClosingBalance = typeof balanceOrStatement === 'number'
        ? balanceOrStatement
        : balanceOrStatement.closingBalance;

    doc.setFont('helvetica');

    doc.setFontSize(22);
    doc.text('Extrato do Revendedor', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nome: ${reseller.name}`, 14, 40);
    doc.text(`Telefone: ${reseller.phone || '-'}`, 14, 48);
    doc.text(`Email: ${reseller.email || '-'}`, 14, 56);

    const generatedAt = new Date();
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Emitido em: ${generatedAt.toLocaleDateString('pt-BR')}`, 14, 64);

    let tableStartY = 76;

    if (dateRange) {
        const fmt = (d: Date) => d.toLocaleDateString('pt-BR');
        const periodoText = `Período: ${fmt(dateRange.startDate)} a ${fmt(dateRange.endDate)}`;
        doc.text(periodoText, 14, 72);
        tableStartY = 82;
    }

    const filtered = statement
        ? statement.movements
        : dateRange
            ? transactions.filter(transaction => {
                const occurredAt = transactionOccurredAt(transaction);
                return occurredAt >= dateRange.startDate && occurredAt <= dateRange.endDate;
            })
            : transactions;

    const effectiveFiltered = effectiveTransactions(filtered);
    const totalOrders = effectiveFiltered
        .filter(transaction => transaction.type === 'order')
        .reduce((sum, transaction) => sum + transaction.totalPrice, 0);
    const totalPayments = effectiveFiltered
        .filter(transaction => transaction.type !== 'order')
        .reduce((sum, transaction) => sum + transaction.totalPrice, 0);
    const openingBalance = statement
        ? statement.openingBalance
        : dateRange
            ? calculateBalance(transactions.filter(
                transaction => transactionOccurredAt(transaction) < dateRange.startDate,
            ))
            : 0;
    const closingBalance = statement
        ? statement.closingBalance
        : dateRange
            ? openingBalance + totalOrders - totalPayments
            : providedClosingBalance;

    autoTable(doc, {
        startY: tableStartY,
        head: [
            [{ content: 'Itens do pedido', colSpan: 4, styles: { halign: 'left' } }],
            ['Descrição', 'Qtd.', 'Valor unitário', 'Subtotal'],
        ],
        body: orderTableBody(filtered),
        theme: 'grid',
        styles: { fontSize: 9, valign: 'middle' },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'center', cellWidth: 18 },
            2: { halign: 'right', cellWidth: 30 },
            3: { halign: 'right', cellWidth: 30 },
        },
    });

    const docWithAutoTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
    const summaryStartY = (docWithAutoTable.lastAutoTable?.finalY ?? tableStartY) + 8;

    autoTable(doc, {
        startY: summaryStartY,
        body: [
            ['Total dos pedidos', formatMoney(totalOrders)],
            ['Saldo anterior', formatMoney(openingBalance)],
            ['(-) Total de pagamentos', formatMoney(totalPayments)],
            ['SALDO ATUAL', formatMoney(closingBalance)],
        ],
        theme: 'plain',
        tableWidth: 100,
        margin: { left: pageWidth - 114, right: 14 },
        styles: { fontSize: 10, cellPadding: 1.5 },
        columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 40, halign: 'right' },
        },
        didParseCell: data => {
            if (data.section !== 'body' || data.row.index !== 3) return;

            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 12;
            if (data.column.index === 1) {
                data.cell.styles.textColor = closingBalance > 0
                    ? [220, 38, 38]
                    : [22, 163, 74];
            }
        },
    });

    const settlements = effectiveFiltered.filter(transaction => transaction.type !== 'order');

    if (settlements.length > 0) {
        const paymentStartY = (docWithAutoTable.lastAutoTable?.finalY ?? summaryStartY) + 10;

        autoTable(doc, {
            startY: paymentStartY,
            head: [
                [{ content: 'Pagamentos e sinais', colSpan: 3, styles: { halign: 'left' } }],
                ['Data', 'Tipo', 'Valor'],
            ],
            body: paymentTableBody(settlements),
            theme: 'grid',
            styles: { fontSize: 9, valign: 'middle' },
            columnStyles: {
                0: { cellWidth: 32 },
                1: { cellWidth: 32 },
                2: { halign: 'right', cellWidth: 32 },
            },
            didParseCell: data => {
                if (data.section !== 'body' || data.column.index !== 2) return;
                data.cell.styles.textColor = [22, 163, 74];
            },
        });
    }

    const safeName = reseller.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fmt = (d: Date) => d.toLocaleDateString('pt-BR').replace(/\//g, '-');
    const filename = dateRange
        ? `extrato_${safeName}_${fmt(dateRange.startDate)}_a_${fmt(dateRange.endDate)}.pdf`
        : `extrato_${safeName}.pdf`;

    doc.save(filename);
}
