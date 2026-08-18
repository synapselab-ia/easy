import React, { useState, useEffect } from "react";
import { useCreateReseller, useUpdateReseller } from "../../hooks/useResellers";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { Reseller } from "../../db/database";
import { toast } from "sonner";

interface ResellerFormProps {
    initialData?: Reseller;
    onSubmitSuccess: () => void;
    onCancel: () => void;
}

export function ResellerForm({ initialData, onSubmitSuccess, onCancel }: ResellerFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [errors, setErrors] = useState<{ name?: string }>({});

    const createMutation = useCreateReseller();
    const updateMutation = useUpdateReseller();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPhone(initialData.phone || "");
            setEmail(initialData.email || "");
            setNotes(initialData.notes || "");
        }
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

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar"}
                </Button>
            </div>
        </form>
    );
}
