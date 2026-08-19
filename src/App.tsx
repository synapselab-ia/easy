import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { MainLayout } from './components/layout/MainLayout'
import DashboardPage from './pages/DashboardPage'
import ItemsPage from './pages/ItemsPage'
import CategoriesPage from './pages/CategoriesPage'
import ResellersPage from './pages/ResellersPage'
import ResellerDetailPage from './pages/ResellerDetailPage'
import TransactionsPage from './pages/TransactionsPage'
import BackupPage from './pages/BackupPage'
import { Toaster } from './components/ui/sonner'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/resellers" element={<ResellersPage />} />
            <Route path="/resellers/:id" element={<ResellerDetailPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/backup" element={<BackupPage />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
