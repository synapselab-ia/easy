import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
    User,
    Tag,
    Zap,
    History,
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { useSearch, type SearchResult } from "@/hooks/useSearch"

interface CommandCenterProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

function LifecycleBadge({ result }: { result: SearchResult }) {
    if (result.type !== 'reseller' || result.isActive !== false) return null

    return (
        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-semibold tracking-wider">
            Inativo
        </span>
    )
}

export function CommandCenter({ open, onOpenChange }: CommandCenterProps) {
    const [query, setQuery] = React.useState("")
    const { results, recent, isLoading } = useSearch(query)
    const navigate = useNavigate()

    const onSelect = (result: SearchResult) => {
        onOpenChange(false)
        if (result.type === 'reseller') {
            navigate(`/resellers/${result.id}`)
        } else {
            navigate('/items')
        }
    }

    const resellers = results.filter(r => r.type === 'reseller')
    const items = results.filter(r => r.type === 'item')

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput
                placeholder="Digite um comando ou pesquise..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span>Buscando...</span>
                        </div>
                    ) : (
                        <span>Nenhum resultado encontrado para "{query}".</span>
                    )}
                </CommandEmpty>

                {query === "" && recent.length > 0 && (
                    <CommandGroup heading="Recentes">
                        {recent.map((result) => (
                            <CommandItem
                                key={`recent-${result.type}-${result.id}`}
                                onSelect={() => onSelect(result)}
                                className="cursor-pointer"
                            >
                                <History className="mr-2 h-4 w-4 text-muted-foreground" />
                                <div className="flex-1 flex justify-between items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{result.title}</span>
                                        {result.subtitle && (
                                            <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <LifecycleBadge result={result} />
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-semibold tracking-wider">
                                            {result.type === 'reseller' ? 'Revendedor' : 'Item'}
                                        </span>
                                    </div>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {resellers.length > 0 && (
                    <CommandGroup heading="Revendedores">
                        {resellers.map((r) => (
                            <CommandItem
                                key={`reseller-${r.id}`}
                                onSelect={() => onSelect(r)}
                                className="cursor-pointer"
                            >
                                <User className="mr-2 h-4 w-4 text-blue-500" />
                                <div className="flex-1 flex justify-between items-center gap-2">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{r.title}</span>
                                        {r.subtitle && (
                                            <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                                        )}
                                    </div>
                                    <LifecycleBadge result={r} />
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {items.length > 0 && (
                    <CommandGroup heading="Itens">
                        {items.map((i) => (
                            <CommandItem
                                key={`item-${i.id}`}
                                onSelect={() => onSelect(i)}
                                className="cursor-pointer"
                            >
                                <Tag className="mr-2 h-4 w-4 text-green-500" />
                                <div className="flex flex-col">
                                    <span className="font-medium">{i.title}</span>
                                    {i.subtitle && (
                                        <span className="text-xs text-muted-foreground">{i.subtitle}</span>
                                    )}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {query !== "" && (
                    <CommandGroup heading="Sugestões">
                        <CommandItem
                            onSelect={() => {
                                onOpenChange(false);
                                navigate(`/resellers?name=${encodeURIComponent(query)}`);
                            }}
                            className="cursor-pointer"
                        >
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Cadastrar revendedor: <span className="font-medium text-foreground">"{query}"</span></span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => {
                                onOpenChange(false);
                                navigate(`/items?name=${encodeURIComponent(query)}`);
                            }}
                            className="cursor-pointer"
                        >
                            <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Cadastrar produto: <span className="font-medium text-foreground">"{query}"</span></span>
                        </CommandItem>
                    </CommandGroup>
                )}

                <CommandSeparator />
                <CommandGroup heading="Ações">
                    <CommandItem onSelect={() => { onOpenChange(false); navigate('/items') }} className="cursor-pointer text-primary">
                        <Zap className="mr-2 h-4 w-4 fill-primary/10" />
                        <span>Cadastrar Novo Item</span>
                    </CommandItem>
                    <CommandItem onSelect={() => { onOpenChange(false); navigate('/transactions?type=order') }} className="cursor-pointer">
                        <Zap className="mr-2 h-4 w-4" />
                        <span>Novo Lançamento: Pedido</span>
                    </CommandItem>
                    <CommandItem onSelect={() => { onOpenChange(false); navigate('/transactions?type=payment') }} className="cursor-pointer">
                        <Zap className="mr-2 h-4 w-4" />
                        <span>Novo Lançamento: Pagamento/Sinal</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
