import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import {
    OperatorDecorativeImage,
    OperatorVisualPersonalizationControl,
} from './OperatorVisualPersonalization'
import { CommandCenter } from '../search/CommandCenter'
import { RecoveryHealthBanner } from '../backup/RecoveryHealthBanner'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useOperatorVisualPersonalization } from '@/hooks/useOperatorVisualPersonalization'
import type { OperatorVisualPreference } from '@/services/operatorVisualPersonalization'

export function MainLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [visualPreview, setVisualPreview] = useState<OperatorVisualPreference | null>(null)
    const visualPersonalization = useOperatorVisualPersonalization()

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

    const visualControlProps = {
        preference: visualPersonalization.preference,
        isLoading: visualPersonalization.isLoading,
        isSaving: visualPersonalization.isSaving,
        isUploadingImage: visualPersonalization.isUploadingImage,
        error: visualPersonalization.error,
        onSave: visualPersonalization.savePreference,
        onUploadImage: visualPersonalization.uploadImage,
        onRemoveImage: visualPersonalization.removeImage,
        onPreviewChange: setVisualPreview,
    }

    return (
        <div className="relative isolate flex min-h-screen w-full overflow-hidden bg-background">
            <OperatorDecorativeImage
                preference={visualPreview ?? visualPersonalization.preference}
            />

            {/* Desktop Sidebar */}
            <Sidebar className="relative z-10 hidden lg:flex" />

            <div className="relative z-10 flex flex-1 flex-col h-screen overflow-hidden">
                {/* Desktop Header */}
                <Header
                    onSearchClick={() => setIsSearchOpen(true)}
                    className="hidden lg:flex"
                    actions={<OperatorVisualPersonalizationControl {...visualControlProps} />}
                />

                {/* Mobile Nav */}
                <header className="h-16 border-b flex items-center px-4 lg:hidden shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
                        <OperatorVisualPersonalizationControl {...visualControlProps} />
                        <div className="visible desktop:hidden">
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <RecoveryHealthBanner />

                <main className="relative flex-1 overflow-y-auto">
                    <div className="relative z-10">
                        <Outlet />
                    </div>
                </main>
            </div>

            <CommandCenter open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </div>
    )
}
