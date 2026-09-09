import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '../ui/ThemeToggle'
import { cn } from '@/lib/utils'

interface HeaderProps {
    onSearchClick: () => void
    className?: string
    actions?: ReactNode
}

export function Header({ onSearchClick, className, actions }: HeaderProps) {
    return (
        <header
            className={cn(
                "h-16 border-b flex items-center px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                className
            )}
        >
            <div className="flex-1 flex items-center">
                <Button
                    variant="outline"
                    className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
                    onClick={onSearchClick}
                >
                    <Search className="mr-2 h-4 w-4" />
                    <span className="hidden lg:inline-flex">Pesquisar...</span>
                    <span className="inline-flex lg:hidden">Pesquisar</span>
                    <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
            </div>
            <div className="flex items-center gap-2">
                {actions}
                <div className="visible desktop:hidden">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
