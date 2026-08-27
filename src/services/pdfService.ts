import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Reseller, type Transaction } from '../db/database';
import {
    isTransactionReversed,
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
    reversed: boolean;
    transactions: Transaction[];
};

function formatMoney(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function auditNotes(transaction: Transaction) {
    return [
        isTransactionReversed(transaction)
            ? `Motivo do estorno: ${transaction.reversal?.reason}`
            : undefined,
        transaction.reversal?.replacementTransactionId
            ? `Substituído pelo lançamento #${transaction.reversal.replacementTransactionId}`
            : undefined,
        transaction.correction?.replacesTransactionId
            ? `Correção do lançamento #${transaction.correction.replacesTransactionId}`
            : undefined,
    ].filter((note): note is string => Boolean(note));
}

function groupOrders(transactions: Transaction[]) {
    const groups = new Map<string, OrderGroup>();

    transactions
        .filter(transaction => transaction.type === 'order')
        .forEach(transaction => {
            const quantity = transaction.quantity ?? 1;
            const unitPrice = transaction.unitPrice ?? (
                quantity > 0 ? transaction.totalPrice / quantity : transaction.totalPrice
            );
            const itemName = transaction.itemName?.trim() || 'Item não informado';
            const reversed = isTransactionReversed(transaction);
            const key = [
                transaction.itemId ?? 'legacy',
                itemName.toLocaleLowerCase('pt-BR'),
                unitPrice.toFixed(4),
                reversed ? 'reversed' : 'valid',
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
                reversed,
                transactions: [transaction],
            });
        });

    return [...groups.values()];
}

function orderTableBody(transactions: Transaction[]) {
    return groupOrders(transactions).flatMap(group => {
        const textColor: [number, number, number] = group.reversed
            ? [100, 100, 100]
            : [0, 0, 0];
        const valueColor: [number, number, number] = group.reversed
            ? [100, 100, 100]
            : [220, 38, 38];
        const label = group.reversed ? `${group.itemName} — ESTORNADO` : group.itemName;

        const rows = [[
            { content: label, styles: { fontStyle: 'bold' as const, textColor } },
            { content: group.quantity.toString(), styles: { fontStyle: 'bold' as const, textColor } },
            { content: formatMoney(group.unitPrice), styles: { textColor } },
            { content: formatMoney(group.totalPrice), styles: { fontStyle: 'bold' as const, textColor: valueColor } },
        ]];

        const details = group.transactions.flatMap(transaction => {
            const observation = transaction.observation?.trim();
            const lines = [
                observation || undefined,
                ...auditNotes(transaction),
            ].filter((line): line is string => Boolean(line));

            return lines.map(line => ([{
                content: line,
                colSpan: 4,
                styles: {
                    fontStyle: 'italic' as const,
                    textColor: [90, 90, 90] as [number, number, number],
                    cellPadding: { top: 1, right: 2, bottom: 1, left: 8 },
                },
            }]));
        });

        return [...rows, ...details];
    });
}

function paymentTableBody(transactions: Transaction[]) {
    return transactions
        .filter(transaction => transaction.type !== 'order')
        .map(transaction => {
            const reversed = isTransactionReversed(transaction);
            const notes = [
                transaction.observation,
                ...auditNotes(transaction),
            ].filter(Boolean).join(' | ') || '-';

            return [
                transactionOccurredAt(transaction).toLocaleDateString(),
                transaction.type === 'payment' ? 'Pagamento' : 'Sinal',
                formatMoney(transaction.totalPrice),
                reversed ? 'Estornado' : 'Válido',
                notes,
            ];
        });
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
    const closingBalance = typeof balanceOrStatement === 'number'
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

    let tableStartY = 80;

    if (dateRange) {
        const fmt = (d: Date) => d.toLocaleDateString('pt-BR');
        const periodoText = `Período: ${fmt(dateRange.startDate)} a ${fmt(dateRange.endDate)}`;
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(periodoText, 14, 64);

        if (statement) {
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`Saldo inicial: ${formatMoney(statement.openingBalance)}`, 14, 76);
            doc.text(`Movimentos do período: ${formatMoney(statement.periodMovement)}`, 14, 84);

            const closingColor = statement.closingBalance > 0 ? [220, 38, 38] : [22, 163, 74];
            doc.setTextColor(closingColor[0], closingColor[1], closingColor[2]);
            doc.text(`Saldo final: ${formatMoney(statement.closingBalance)}`, 14, 92);
            tableStartY = 102;
        } else {
            const balanceColor = closingBalance > 0 ? [220, 38, 38] : [22, 163, 74];
            doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
            doc.text(`Saldo Devedor do Período: ${formatMoney(closingBalance)}`, 14, 76);
        }
    } else {
        const balanceColor = closingBalance > 0 ? [220, 38, 38] : [22, 163, 74];
        doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
        doc.text(`Saldo Devedor Atual: ${formatMoney(closingBalance)}`, 14, 70);
    }

    const filtered = statement
        ? statement.movements
        : dateRange
            ? transactions.filter(transaction => {
                const occurredAt = transactionOccurredAt(transaction);
                return occurredAt >= dateRange.startDate && occurredAt <= dateRange.endDate;
            })
            : transactions;

    const itemRows = orderTableBody(filtered);
    autoTable(doc, {
        startY: tableStartY,
        head: [
            [{ content: 'Itens do pedido', colSpan: 4, styles: { halign: 'left' } }],
            ['Descrição', 'Qtd.', 'Valor unitário', 'Subtotal'],
        ],
        body: itemRows,
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
    const paymentStartY = (docWithAutoTable.lastAutoTable?.finalY ?? tableStartY) + 10;
    const settlements = filtered.filter(transaction => transaction.type !== 'order');

    autoTable(doc, {
        startY: paymentStartY,
        head: [
            [{ content: 'Pagamentos e sinais', colSpan: 5, styles: { halign: 'left' } }],
            ['Data', 'Tipo', 'Valor', 'Status', 'Observação'],
        ],
        body: paymentTableBody(filtered),
        theme: 'grid',
        styles: { fontSize: 9, valign: 'middle' },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 24 },
            2: { halign: 'right', cellWidth: 28 },
            3: { cellWidth: 23 },
            4: { cellWidth: 'auto' },
        },
        didParseCell: data => {
            if (data.section !== 'body' || data.column.index !== 2) return;
            const transaction = settlements[data.row.index];
            if (!transaction) return;

            data.cell.styles.textColor = isTransactionReversed(transaction)
                ? [100, 100, 100]
                : [22, 163, 74];
        },
    });

    const safeName = reseller.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fmt = (d: Date) => d.toLocaleDateString('pt-BR').replace(/\//g, '-');
    const filename = dateRange
        ? `extrato_${safeName}_${fmt(dateRange.startDate)}_a_${fmt(dateRange.endDate)}.pdf`
        : `extrato_${safeName}.pdf`;

    doc.save(filename);
}
