import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BackupPage from './BackupPage';

vi.mock('@/components/backup/ImportExport', () => ({
    default: () => <div data-testid="import-export" />,
}));

describe('P7-S4 Backup recovery copy', () => {
    it('describes the implemented validated checkpointed atomic restore flow', () => {
        render(<BackupPage />);

        expect(screen.getByRole('heading', { name: 'Backup & Restore' })).toBeInTheDocument();
        expect(screen.getByText(/selecione um arquivo para validar e revisar antes da restauração/i)).toBeInTheDocument();
        expect(screen.getByText(/após o preflight, o Easy exibe a prévia e só então libera a restauração/i)).toBeInTheDocument();
        expect(screen.getByText(/checkpoint v2 recuperável do banco atual/i)).toBeInTheDocument();
        expect(screen.getByText(/executa a restauração de forma atômica/i)).toBeInTheDocument();
        expect(screen.getByText(/preservando o banco anterior se a gravação ou verificação falhar/i)).toBeInTheDocument();
        expect(screen.queryByText(/futura restauração/i)).not.toBeInTheDocument();
        expect(screen.getByTestId('import-export')).toBeInTheDocument();
    });
});
