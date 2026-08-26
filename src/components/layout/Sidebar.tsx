import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Tags, ChartColumn, Users, FileText, Database } from 'lucide-react'
import { cn } from '@/lib/utils'

const routes = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/items', label: 'Itens', icon: <Package size={20} /> },
    { path: '/categories', label: 'Categorias', icon: <Tags size={20} /> },
    { path: '/reports', label: 'Relatórios', icon: <ChartColumn size={20} /> },
    { path: '/resellers', label: 'Revendedores', icon: <Users size={20} /> },
    { path: '/transactions', label: 'Lançamentos', icon: <FileText size={20} /> },
    { path: '/backup', label: 'Backup', icon: <Database size={20} /> },
]

export function Sidebar({ className, onItemClick }: { className?: string; onItemClick?: () => void }) {
    return (
        <aside className={cn("w-64 border-r bg-muted/40 min-h-screen flex flex-col", className)}>
            <div className="p-6 border-b flex items-center justify-between h-16">
                <h2 className="text-lg font-semibold tracking-tight">Easy</h2>
            </div>
            <nav className="flex-1 py-4 space-y-1">
                {routes.map((route) => (
                    <NavLink
                        key={route.path}
                        to={route.path}
                        onClick={onItemClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-2.5 hover:bg-muted transition-colors ${isActive ? 'bg-muted font-medium border-r-2 border-primary' : 'text-muted-foreground'
                            }`
                        }
                    >
                        {route.icon}
                        <span>{route.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}
