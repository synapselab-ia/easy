import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"

interface ResponsiveDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
}

export function ResponsiveDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
}: ResponsiveDialogProps) {
    const isDesktop = useMediaQuery("(min-width: 1024px)")

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && (
                            <DialogDescription>{description}</DialogDescription>
                        )}
                    </DialogHeader>
                    <div className="min-h-0 overflow-y-auto py-4 pr-1">{children}</div>
                    {footer && <DialogFooter>{footer}</DialogFooter>}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[calc(100dvh-1rem)] overflow-hidden">
                <DrawerHeader className="text-left">
                    <DrawerTitle>{title}</DrawerTitle>
                    {description && (
                        <DrawerDescription>{description}</DrawerDescription>
                    )}
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pr-5">{children}</div>
                {footer && <DrawerFooter className="pt-2">{footer}</DrawerFooter>}
            </DrawerContent>
        </Drawer>
    )
}
