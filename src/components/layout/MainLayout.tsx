import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CommandCenter } from '../search/CommandCenter'
import { RecoveryHealthBanner } from '../backup/RecoveryHealthBanner'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '../ui/ThemeToggle'

export function MainLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsSearchOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <div className="flex min-h-screen w-full bg-background">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden lg:flex" />

            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                {/* Desktop Header */}
                <Header onSearchClick={() => setIsSearchOpen(true)} className="hidden lg:flex" />

                {/* Mobile Nav */}
                <header className="h-16 border-b flex items-center px-4 lg:hidden shrink-0">
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                            <Menu size={20} />
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <Sidebar className="w-full border-r-0" onItemClick={() => setIsMenuOpen(false)} />
                        </SheetContent>
                    </Sheet>
                    <div className="ml-4 font-semibold text-lg">Easy</div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                            <Search size={20} />
                        </Button>
                        <div className="visible desktop:hidden">
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <RecoveryHealthBanner />

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            <CommandCenter open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </div>
    )
}
