import { useSearchParams } from "react-router-dom";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { TransactionHistory } from "../components/transactions/TransactionHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useTransactions } from "../hooks/useTransactions";
import { useResellers } from "../hooks/useResellers";
import { toast } from "sonner";
import type { TransactionType } from "../db/database";

function parsePositiveInteger(value: string | null) {
    if (!value) return undefined;

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default function TransactionsPage() {
    const [searchParams] = useSearchParams();
    const initialType = (searchParams.get("type") as TransactionType) || "order";
    const initialResellerId = parsePositiveInteger(searchParams.get("resellerId"));
    const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
    const { data: resellers = [], isLoading: resellersLoading } = useResellers();

    const handleSuccess = () => {
        toast.success("Lançamento salvo com sucesso!");
    };

    return (
        <div className="p-4 lg:p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Lançamentos</h1>
                <p className="text-muted-foreground">
                    Registre movimentações e consulte o histórico financeiro completo.
                </p>
            </div>

            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle>Nova Movimentação</CardTitle>
                    <CardDescription>
                        Registre um pedido, pagamento ou sinal para um revendedor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionForm
                        onSubmitSuccess={handleSuccess}
                        initialType={initialType}
                        initialResellerId={initialResellerId}
                        key={`${initialType}:${initialResellerId ?? "standalone"}`}
                    />
                </CardContent>
            </Card>

            <TransactionHistory
                transactions={transactions}
                resellers={resellers}
                isLoading={transactionsLoading || resellersLoading}
            />
        </div>
    );
}
