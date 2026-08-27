import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchableSelect, normalizeSearchText } from './SearchableSelect';

const options = [
    { value: '1', label: 'Elétrico' },
    { value: '2', label: 'Eletron' },
    { value: '3', label: 'Eletrana' },
    { value: '4', label: 'Eudorado' },
    { value: '5', label: 'El Dorado' },
];

describe('SearchableSelect', () => {
    it('normalizes accents and case for operator search', () => {
        expect(normalizeSearchText('  ELÉTRICO  ')).toBe('eletrico');
        expect(normalizeSearchText('João')).toBe('joao');
    });

    it('filters by substring as the operator types', () => {
        render(
            <div>
                <label htmlFor="destination">Destino</label>
                <SearchableSelect
                    id="destination"
                    value=""
                    onValueChange={vi.fn()}
                    options={options}
                    placeholder="Selecione..."
                    searchPlaceholder="Pesquisar destino..."
                />
            </div>,
        );

        fireEvent.click(screen.getByRole('combobox', { name: 'Destino' }));
        const input = screen.getByPlaceholderText('Pesquisar destino...');

        fireEvent.change(input, { target: { value: 'eu' } });
        expect(screen.getByText('Eudorado')).toBeInTheDocument();
        expect(screen.queryByText('Elétrico')).not.toBeInTheDocument();
        expect(screen.queryByText('El Dorado')).not.toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'dorado' } });
        expect(screen.getByText('Eudorado')).toBeInTheDocument();
        expect(screen.getByText('El Dorado')).toBeInTheDocument();
        expect(screen.queryByText('Eletron')).not.toBeInTheDocument();
    });

    it('finds accented labels without requiring accents and returns only the option value', () => {
        const onValueChange = vi.fn();
        render(
            <div>
                <label htmlFor="product">Produto</label>
                <SearchableSelect
                    id="product"
                    value=""
                    onValueChange={onValueChange}
                    options={options}
                    placeholder="Selecione..."
                    searchPlaceholder="Pesquisar produto..."
                />
            </div>,
        );

        fireEvent.click(screen.getByRole('combobox', { name: 'Produto' }));
        fireEvent.change(screen.getByPlaceholderText('Pesquisar produto...'), {
            target: { value: 'eletrico' },
        });

        fireEvent.click(screen.getByText('Elétrico'));
        expect(onValueChange).toHaveBeenCalledWith('1');
    });
});
