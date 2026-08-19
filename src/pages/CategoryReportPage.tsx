import { CategoryReport } from '../components/categories/CategoryReport';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';

export default function CategoryReportPage() {
    const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
    const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactions();

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Análise por categoria</h1>
                <p className="text-muted-foreground">
                    Compare o desempenho bruto dos pedidos pela categoria histórica registrada em cada lançamento.
                </p>
            </div>

            <CategoryReport
                categories={categories}
                transactions={transactions}
                isLoading={isLoadingCategories || isLoadingTransactions}
            />
        </div>
    );
}
