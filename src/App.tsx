import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Portfolio from '@/pages/portfolio'
import { AdminDashboard } from './pages/admin'
import { AuthProvider } from './context/auth-context'
import { AdminLogin } from './components/admin/admin-login'
import { ProtectedRoute } from './components/admin/protected-route'
import { NotFound } from './pages/404'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Portfolio />} />
          <Route path="/authentication" element={<AdminLogin />} />
            <Route path="/secure-admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
