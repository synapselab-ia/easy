import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useResellers } from "../hooks/useResellers";
import { ResellerTable } from "../components/resellers/ResellerTable";
import { ResellerForm } from "../components/resellers/ResellerForm";
import { isResellerActive, type Reseller } from "../db/database";
import { Button } from "../components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { ResponsiveDialog } from "../components/ui/ResponsiveDialog";

function normalizeFilterText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
        .trim();
}

export default function ResellersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: resellers = [], isLoading } = useResellers();
    const [searchQuery, setSearchQuery] = useState("");
    const [lifecycleFilter, setLifecycleFilter] = useState("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReseller, setEditingReseller] = useState<Reseller | undefined>();

    useEffect(() => {
        const nameParam = searchParams.get("name");
        if (nameParam) {
            // Pre-fill creation
            setEditingReseller({ name: nameParam } as Reseller);
            setIsDialogOpen(true);

            // Clear the param after using it
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("name");
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleCreateNew = () => {
        setEditingReseller(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (reseller: Reseller) => {
        setEditingReseller(reseller);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingReseller(undefined);
    };

    const filteredResellers = useMemo(() => {
        const normalizedQuery = normalizeFilterText(searchQuery);

        return resellers.filter(reseller => {
            if (normalizedQuery) {
                const searchableValues = [reseller.name, reseller.phone, reseller.email]
                    .filter((value): value is string => Boolean(value));
                const matchesQuery = searchableValues.some(value =>
                    normalizeFilterText(value).includes(normalizedQuery)
                );
                if (!matchesQuery) return false;
            }

            const active = isResellerActive(reseller);
            if (lifecycleFilter === "active" && !active) return false;
            if (lifecycleFilter === "inactive" && active) return false;

            return true;
        });
    }, [lifecycleFilter, resellers, searchQuery]);

    const hasActiveFilters = Boolean(searchQuery.trim() || lifecycleFilter !== "all");

    const clearFilters = () => {
        setSearchQuery("");
        setLifecycleFilter("all");
    };

    return (
        <div className="p-4 lg:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Revendedores</h1>
                    <p className="text-muted-foreground">
                        Gerencie sua rede de revendedores e acompanhe seus dados.
                    </p>
                </div>
                <Button onClick={handleCreateNew} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Revendedor
                </Button>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
                    <div className="space-y-2">
                        <Label htmlFor="resellerSearch">Buscar revendedor</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="resellerSearch"
                                type="search"
                                placeholder="Buscar por nome, telefone ou email..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="resellerLifecycleFilter">Status</Label>
                        <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
                            <SelectTrigger id="resellerLifecycleFilter">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Ativos</SelectItem>
                                <SelectItem value="inactive">Inativos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                            Limpar filtros
                        </Button>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8 text-muted-foreground">
                    Carregando revendedores...
                </div>
            ) : (
                <ResellerTable resellers={filteredResellers} onEdit={handleEdit} />
            )}

            <ResponsiveDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={editingReseller ? "Editar Revendedor" : "Novo Revendedor"}
            >
                <ResellerForm
                    initialData={editingReseller}
                    onSubmitSuccess={handleCloseDialog}
                    onCancel={handleCloseDialog}
                />
            </ResponsiveDialog>
        </div>
    );
}
