import { useSearchParams } from "react-router-dom";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import type { TransactionType } from "../db/database";

export default function TransactionsPage() {
    const [searchParams] = useSearchParams();
    const initialType = (searchParams.get("type") as TransactionType) || "order";

    const handleSuccess = () => {
        toast.success("Lançamento salvo com sucesso!");
    };

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Lançamento de Demanda</h1>
                <p className="text-muted-foreground">
                    Faça lançamentos de pedidos, pagamentos ou sinais dos revendedores.
                </p>
            </div>

            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle>Nova Movimentação</CardTitle>
                    <CardDescription>
                        Preencha os dados abaixo para registrar a movimentação.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TransactionForm
                        onSubmitSuccess={handleSuccess}
                        initialType={initialType}
                        key={initialType}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
