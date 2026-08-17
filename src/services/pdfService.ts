import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type Reseller, type Transaction } from '../db/database';
import { isTransactionReversed, transactionOccurredAt } from '../domain/transactions';

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export function generateResellerExtract(
    reseller: Reseller,
    transactions: Transaction[],
    balance: number,
    dateRange?: DateRange
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont('helvetica');

    doc.setFontSize(22);
    doc.text('Extrato do Revendedor', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nome: ${reseller.name}`, 14, 40);
    doc.text(`Telefone: ${reseller.phone || '-'}`, 14, 48);
    doc.text(`Email: ${reseller.email || '-'}`, 14, 56);

    let saldoY = 70;
    if (dateRange) {
        const fmt = (d: Date) => d.toLocaleDateString('pt-BR');
        const periodoText = `Período: ${fmt(dateRange.startDate)} a ${fmt(dateRange.endDate)}`;
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(periodoText, 14, 64);
        saldoY = 76;
    }
    const balanceText = `Saldo Devedor${dateRange ? ' do Período' : ' Atual'}: R$ ${balance.toFixed(2)}`;
    const balanceColor = balance > 0 ? [220, 38, 38] : [22, 163, 74];
    doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    doc.text(balanceText, 14, saldoY);

    const filtered = dateRange
        ? transactions.filter(transaction => {
            const occurredAt = transactionOccurredAt(transaction);
            return occurredAt >= dateRange.startDate && occurredAt <= dateRange.endDate;
        })
        : transactions;

    const tableData = filtered.map(t => {
        const reversed = isTransactionReversed(t);
        const notes = [
            t.observation,
            reversed ? `Motivo do estorno: ${t.reversal?.reason}` : undefined,
            t.reversal?.replacementTransactionId
                ? `Substituído pelo lançamento #${t.reversal.replacementTransactionId}`
                : undefined,
            t.correction?.replacesTransactionId
                ? `Correção do lançamento #${t.correction.replacesTransactionId}`
                : undefined,
        ].filter(Boolean).join(' | ') || '-';

        return [
            transactionOccurredAt(t).toLocaleDateString(),
            t.type === 'order' ? 'Pedido' : t.type === 'payment' ? 'Pagamento' : 'Sinal',
            t.itemName || '-',
            t.quantity ? t.quantity.toString() : '-',
            `R$ ${t.totalPrice.toFixed(2)}`,
            reversed ? 'Estornado' : 'Válido',
            notes,
        ];
    });

    autoTable(doc, {
        startY: 80,
        head: [['Data', 'Tipo', 'Item', 'Qtd', 'Valor', 'Status', 'Observação']],
        body: tableData,
        didParseCell: function (data) {
            if (data.section !== 'body') return;

            const transaction = filtered[data.row.index];
            if (isTransactionReversed(transaction)) {
                data.cell.styles.textColor = [100, 100, 100];
                return;
            }

            if (data.column.index === 4) {
                if (transaction.type === 'order') {
                    data.cell.styles.textColor = [220, 38, 38];
                } else {
                    data.cell.styles.textColor = [22, 163, 74];
                }
            }
        }
    });

    const safeName = reseller.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fmt = (d: Date) => d.toLocaleDateString('pt-BR').replace(/\//g, '-');
    const filename = dateRange
        ? `extrato_${safeName}_${fmt(dateRange.startDate)}_a_${fmt(dateRange.endDate)}.pdf`
        : `extrato_${safeName}.pdf`;

    doc.save(filename);
}
