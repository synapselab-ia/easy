import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Reseller } from "../../db/database";
import { isResellerActive } from "../../db/database";
import { useArchiveReseller, useReactivateReseller } from "../../hooks/useResellers";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { ResponsiveDialog } from "../ui/ResponsiveDialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Card, CardContent } from "../ui/card";
import { Phone, Mail, ChevronRight } from "lucide-react";

interface ResellerTableProps {
    resellers: Reseller[];
    onEdit: (reseller: Reseller) => void;
}

function StatusLabel({ reseller }: { reseller: Reseller }) {
    const active = isResellerActive(reseller);
    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {active ? "Ativo" : "Inativo"}
        </span>
    );
}

export function ResellerTable({ resellers, onEdit }: ResellerTableProps) {
    const navigate = useNavigate();
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const archiveMutation = useArchiveReseller();
    const reactivateMutation = useReactivateReseller();
    const [resellerToArchive, setResellerToArchive] = useState<Reseller | null>(null);
    const isLifecyclePending = archiveMutation.isPending || reactivateMutation.isPending;

    const handleArchive = async () => {
        if (resellerToArchive?.id) {
            await archiveMutation.mutateAsync(resellerToArchive.id);
            setResellerToArchive(null);
        }
    };

    const handleReactivate = async (reseller: Reseller) => {
        if (reseller.id) {
            await reactivateMutation.mutateAsync(reseller.id);
        }
    };

    const renderLifecycleButton = (reseller: Reseller) => (
        isResellerActive(reseller) ? (
            <Button
                variant="outline"
                size="sm"
                onClick={() => setResellerToArchive(reseller)}
                disabled={isLifecyclePending}
            >
                Arquivar
            </Button>
        ) : (
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleReactivate(reseller)}
                disabled={isLifecyclePending}
            >
                {reactivateMutation.isPending ? "Reativando..." : "Reativar"}
            </Button>
        )
    );

    const archiveDialog = (
        <ResponsiveDialog
            open={!!resellerToArchive}
            onOpenChange={(open) => !open && setResellerToArchive(null)}
            title="Arquivar Revendedor"
            description={`Arquivar "${resellerToArchive?.name}" remove o revendedor dos novos lançamentos, mas preserva integralmente sua ficha e histórico financeiro.`}
            footer={
                <>
                    <Button
                        variant="outline"
                        onClick={() => setResellerToArchive(null)}
                        disabled={archiveMutation.isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleArchive}
                        disabled={archiveMutation.isPending}
                    >
                        {archiveMutation.isPending ? "Arquivando..." : "Confirmar Arquivamento"}
                    </Button>
                </>
            }
        >
            <div className="py-2 text-sm text-muted-foreground">
                O histórico permanece disponível e o revendedor pode ser reativado depois.
            </div>
        </ResponsiveDialog>
    );

    if (!isDesktop) {
        return (
            <div className="space-y-4">
                {resellers.length === 0 ? (
                    <div className="text-center py-10 bg-card rounded-lg border border-dashed text-muted-foreground">
                        Nenhum revendedor encontrado.
                    </div>
                ) : (
                    resellers.map((reseller) => (
                        <Card key={reseller.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="space-y-1 min-w-0">
                                        <div
                                            className="font-bold text-lg text-primary cursor-pointer hover:underline flex items-center gap-1"
                                            onClick={() => navigate(`/resellers/${reseller.id}`)}
                                        >
                                            <span className="truncate">{reseller.name}</span>
                                            <ChevronRight size={16} className="shrink-0" />
                                        </div>
                                        <StatusLabel reseller={reseller} />
                                    </div>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(reseller)}
                                        >
                                            Editar
                                        </Button>
                                        {renderLifecycleButton(reseller)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} />
                                        <span>{reseller.phone || "Sem telefone"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} />
                                        <span>{reseller.email || "Sem email"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}

                {archiveDialog}
            </div>
        );
    }

    return (
        <div>
            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resellers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    Nenhum revendedor encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            resellers.map((reseller) => (
                                <TableRow key={reseller.id}>
                                    <TableCell
                                        className="font-medium cursor-pointer text-primary hover:underline"
                                        onClick={() => navigate(`/resellers/${reseller.id}`)}
                                    >
                                        {reseller.name}
                                    </TableCell>
                                    <TableCell><StatusLabel reseller={reseller} /></TableCell>
                                    <TableCell>{reseller.phone || "-"}</TableCell>
                                    <TableCell>{reseller.email || "-"}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(reseller)}
                                        >
                                            Editar
                                        </Button>
                                        {renderLifecycleButton(reseller)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {archiveDialog}
        </div>
    );
}
