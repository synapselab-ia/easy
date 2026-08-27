import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResellerDetailPage from './ResellerDetailPage';
import { MemoryRouter } from 'react-router-dom';
import { useReseller } from '../hooks/useResellers';
import { useTransactions } from '../hooks/useTransactions';
import { generateResellerExtract } from '../services/pdfService';

vi.mock('../hooks/useResellers', () => ({
    useReseller: vi.fn(),
}));

vi.mock('../hooks/useTransactions', () => ({
    useTransactions: vi.fn(),
    useReverseTransaction: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock('../services/pdfService', () => ({
    generateResellerExtract: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
    },
}));

describe('ResellerDetailPage Calculation and Unit rendering', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockReseller = { id: 1, name: 'João Silva', phone: '123', createdAt: new Date(), updatedAt: new Date() };

    it('calculates the balance correctly and displays it in red when positive', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({
            data: [
                { id: 1, resellerId: 1, type: 'order', totalPrice: 150, createdAt: new Date() },
                { id: 2, resellerId: 1, type: 'payment', totalPrice: 50, createdAt: new Date() }
            ],
            isLoading: false
        } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);

        expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
        const balanceDiv = screen.getByText('R$ 100,00');
        expect(balanceDiv.className).toContain('text-debt');
    });

    it('keeps a reversed transaction visible but excludes it from the displayed balance', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({
            data: [
                {
                    id: 1,
                    resellerId: 1,
                    type: 'order',
                    totalPrice: 150,
                    itemName: 'Pedido Incorreto',
                    reversal: { reason: 'Valor incorreto', reversedAt: '2026-08-17T15:00:00.000Z' },
                    createdAt: new Date(),
                },
                { id: 2, resellerId: 1, type: 'payment', totalPrice: 50, createdAt: new Date() }
            ],
            isLoading: false
        } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);

        expect(screen.getByText('R$ -50,00')).toBeInTheDocument();
        expect(screen.getByText('Pedido Incorreto')).toBeInTheDocument();
        expect(screen.getByText('Estornado')).toBeInTheDocument();
        expect(screen.getByText(/Motivo do estorno: Valor incorreto/i)).toBeInTheDocument();
    });

    it('displays history with correct colors', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({
            data: [
                { id: 1, resellerId: 1, type: 'order', totalPrice: 150, itemName: 'Produto A', createdAt: new Date() },
                { id: 2, resellerId: 1, type: 'payment', totalPrice: 50, createdAt: new Date() }
            ],
            isLoading: false
        } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);

        expect(screen.getByText('Produto A')).toBeInTheDocument();
    });

    it('displays green balance when balance is negative or zero (credit/paid)', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({
            data: [
                { id: 1, resellerId: 1, type: 'order', totalPrice: 50, createdAt: new Date() },
                { id: 2, resellerId: 1, type: 'payment', totalPrice: 100, createdAt: new Date() }
            ],
            isLoading: false
        } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);

        expect(screen.getByText('R$ -50,00')).toBeInTheDocument();
        const balanceDiv = screen.getByText('R$ -50,00');
        expect(balanceDiv.className).toContain('text-payment');
    });

    it('calls generateResellerExtract when PDF button is clicked (sem filtro)', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({ data: [], isLoading: false } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.click(screen.getByText('Gerar PDF'));

        expect(generateResellerExtract).toHaveBeenCalledWith(mockReseller, [], 0);
    });

    it('passes all audit rows to PDF while using only effective transactions in the balance', () => {
        const transactions = [
            {
                id: 1,
                resellerId: 1,
                type: 'order' as const,
                totalPrice: 500,
                reversal: { reason: 'Pedido duplicado', reversedAt: '2026-08-17T15:00:00.000Z' },
                createdAt: new Date(),
            },
            { id: 2, resellerId: 1, type: 'order' as const, totalPrice: 100, createdAt: new Date() },
        ];
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({ data: transactions, isLoading: false } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.click(screen.getByText('Gerar PDF'));

        expect(generateResellerExtract).toHaveBeenCalledWith(mockReseller, transactions, 100);
    });

    it('desabilita o botão quando apenas startDate é preenchida', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({ data: [], isLoading: false } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '2025-01-01' } });
        expect(screen.getByText('Gerar PDF')).toBeDisabled();
    });

    it('desabilita o botão quando apenas endDate é preenchida', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({ data: [], isLoading: false } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2025-03-31' } });
        expect(screen.getByText('Gerar PDF')).toBeDisabled();
    });

    it('habilita o botão quando ambas as datas são preenchidas', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({ data: [], isLoading: false } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '2025-01-01' } });
        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2025-03-31' } });
        expect(screen.getByText('Gerar PDF')).not.toBeDisabled();
    });

    it('exibe estado inválido imediatamente, bloqueia o fallback e se recupera quando o período é corrigido', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({
            data: [{
                id: 1,
                resellerId: 1,
                type: 'order',
                totalPrice: 100,
                itemName: 'Pedido do intervalo',
                occurredAt: new Date('2025-03-15T12:00:00'),
                createdAt: new Date('2025-03-15T12:00:00'),
            }],
            isLoading: false
        } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '2025-03-01' } });
        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2025-01-01' } });

        expect(screen.getByRole('alert')).toHaveTextContent('Período inválido');
        expect(screen.getByText('Gerar PDF')).toBeDisabled();
        expect(screen.getByLabelText('Data Início')).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText('Data Fim')).toHaveAttribute('aria-invalid', 'true');
        expect(screen.queryByText('Saldo Devedor Atual')).not.toBeInTheDocument();
        expect(screen.queryByText('Pedido do intervalo')).not.toBeInTheDocument();
        expect(screen.getByText(/Histórico indisponível enquanto o período estiver inválido/i)).toBeInTheDocument();
        expect(generateResellerExtract).not.toHaveBeenCalled();

        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2025-03-31' } });

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText('Gerar PDF')).not.toBeDisabled();
        expect(screen.getByText('Resumo do Período')).toBeInTheDocument();
        expect(screen.getByText('Pedido do intervalo')).toBeInTheDocument();
    });

    it('limpar uma faixa inválida remove a orientação e restaura a visão corrente', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({ data: [], isLoading: false } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '2025-03-01' } });
        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2025-01-01' } });
        expect(screen.getByRole('alert')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '' } });

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(screen.getByText('Saldo Devedor Atual')).toBeInTheDocument();
        expect(screen.getByText('Gerar PDF')).not.toBeDisabled();
    });

    it('gera extrato formal quando o período não tem movimentações', () => {
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({
            data: [{ id: 1, resellerId: 1, type: 'order', totalPrice: 100, createdAt: new Date('2024-06-01') }],
            isLoading: false
        } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '2025-01-01' } });
        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2025-03-31' } });
        fireEvent.click(screen.getByText('Gerar PDF'));

        expect(generateResellerExtract).toHaveBeenCalledWith(
            mockReseller,
            expect.any(Array),
            expect.objectContaining({
                openingBalance: 100,
                periodMovement: 0,
                closingBalance: 100,
                movements: [],
            }),
        );
    });

    it('chama generateResellerExtract com o statement formal quando o período é válido', () => {
        const transactionDate = new Date('2025-02-15T10:00:00');
        vi.mocked(useReseller).mockReturnValue({ data: mockReseller, isLoading: false } as any);
        vi.mocked(useTransactions).mockReturnValue({
            data: [{ id: 1, resellerId: 1, type: 'order', totalPrice: 100, createdAt: transactionDate }],
            isLoading: false
        } as any);

        render(<MemoryRouter><ResellerDetailPage /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Data Início'), { target: { value: '2025-01-01' } });
        fireEvent.change(screen.getByLabelText('Data Fim'), { target: { value: '2025-03-31' } });
        fireEvent.click(screen.getByText('Gerar PDF'));

        expect(generateResellerExtract).toHaveBeenCalledWith(
            mockReseller,
            [expect.objectContaining({ id: 1 })],
            expect.objectContaining({
                openingBalance: 0,
                periodMovement: 100,
                closingBalance: 100,
                movements: [expect.objectContaining({ id: 1 })],
                range: expect.objectContaining({
                    startDate: expect.any(Date),
                    endDate: expect.any(Date),
                }),
            }),
        );
    });
});
