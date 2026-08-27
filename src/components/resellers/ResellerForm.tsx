import React, { useState, useEffect, useMemo } from "react";
import {
    useCreateReseller,
    useResellers,
    useUpdateReseller,
} from "../../hooks/useResellers";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { isResellerActive, type Reseller } from "../../db/database";
import { toast } from "sonner";

interface ResellerFormProps {
    initialData?: Reseller;
    onSubmitSuccess: () => void;
    onCancel: () => void;
}

function normalizeDuplicateName(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR")
        .replace(/[^a-z0-9]/g, "");
}

function normalizePhone(value: string) {
    return value.replace(/\D/g, "");
}

function normalizeEmail(value: string) {
    return value.trim().toLocaleLowerCase("pt-BR");
}

export function ResellerForm({ initialData, onSubmitSuccess, onCancel }: ResellerFormProps) {
    const isExistingReseller = typeof initialData?.id === "number";
    const [name, setName] = useState(initialData?.name || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [errors, setErrors] = useState<{ name?: string }>({});

    const { data: existingResellers = [] } = useResellers();
    const createMutation = useCreateReseller();
    const updateMutation = useUpdateReseller();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const duplicateResellers = useMemo(() => {
        if (isExistingReseller) return [];

        const normalizedName = normalizeDuplicateName(name);
        const normalizedPhone = normalizePhone(phone);
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedName && normalizedPhone.length < 8 && !normalizedEmail) return [];

        return existingResellers.flatMap(reseller => {
            const reasons: string[] = [];

            if (normalizedName && normalizeDuplicateName(reseller.name) === normalizedName) {
                reasons.push("nome");
            }
            if (
                normalizedPhone.length >= 8
                && normalizePhone(reseller.phone || "") === normalizedPhone
            ) {
                reasons.push("telefone");
            }
            if (
                normalizedEmail
                && normalizeEmail(reseller.email || "") === normalizedEmail
            ) {
                reasons.push("e-mail");
            }

            return reasons.length > 0 ? [{ reseller, reasons }] : [];
        });
    }, [email, existingResellers, isExistingReseller, name, phone]);

    useEffect(() => {
        setName(initialData?.name || "");
        setPhone(initialData?.phone || "");
        setEmail(initialData?.email || "");
        setNotes(initialData?.notes || "");
        setErrors({});
    }, [initialData]);

    const validate = () => {
        const newErrors: { name?: string } = {};
        if (!name.trim()) newErrors.name = "Nome é obrigatório";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const data = {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            notes: notes.trim(),
            updatedAt: new Date()
        };

        try {
            if (initialData && initialData.id) {
                await updateMutation.mutateAsync({ id: initialData.id, ...data });
            } else {
                await createMutation.mutateAsync({ ...data, createdAt: new Date() });
            }
            onSubmitSuccess();
            setName("");
            setPhone("");
            setEmail("");
            setNotes("");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Falha ao salvar revendedor.";
            toast.error(message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Revendedor</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Ana Silva"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: ana@email.com"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informações adicionais"
                />
            </div>

            {duplicateResellers.length > 0 && (
                <div role="alert" className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm space-y-2">
                    <p className="font-medium">Possível revendedor duplicado</p>
                    <p className="text-muted-foreground">
                        Encontramos cadastro existente com dados iguais aos informados.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        {duplicateResellers.slice(0, 3).map(({ reseller, reasons }) => (
                            <li key={reseller.id ?? `${reseller.name}-${reseller.createdAt.toString()}`}>
                                <span className="font-medium">{reseller.name}</span>
                                {reseller.phone ? ` — ${reseller.phone}` : ""}
                                {reseller.email ? ` — ${reseller.email}` : ""}
                                {` — ${isResellerActive(reseller) ? "ativo" : "arquivado"}`}
                                <span className="block text-muted-foreground">
                                    Coincidência em: {reasons.join(", ")}.
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-muted-foreground">
                        Se for realmente outra pessoa/empresa, confirme em “Cadastrar mesmo assim”.
                    </p>
                </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Salvando..." : duplicateResellers.length > 0 ? "Cadastrar mesmo assim" : "Salvar"}
                </Button>
            </div>
        </form>
    );
}
