import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './shared/contexts/AuthContext';
import { LoginPage } from './features/gateway/pages/LoginPage';
import { ProtectedRoute } from './features/gateway/components/ProtectedRoute';
import { GatewayDashboard } from './features/gateway/pages/GatewayDashboard';
import { DentiLayout } from './features/denti-ai-app/components/DentiLayout';
import { DentiDashboardPage } from './features/denti-ai-app/pages/DentiDashboardPage';
import { ApprovalPage } from './features/denti-ai-app/pages/ApprovalPage';
import { UserListPage } from './features/denti-ai-app/pages/UserListPage';

import { AdminLayout } from './features/admin/components/AdminLayout';
import { RegistrationApprovalPage } from './features/admin/pages/RegistrationApprovalPage';
import { HospitalListPage } from './features/admin/pages/HospitalListPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes (Requires Login) */}
          <Route element={<ProtectedRoute />}>
            {/* Main WAYN-Ai Gateway */}
            <Route path="/" element={<GatewayDashboard />} />
            
            {/* DENTi-Ai App Layout & Nested Routes */}
            <Route path="/denti-dashboard" element={<DentiLayout />}>
              <Route index element={<DentiDashboardPage />} />
              <Route path="approvals" element={<ApprovalPage />} />
              <Route path="users" element={<UserListPage />} />
            </Route>
            
            {/* WAYN-Ai Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="registrations" element={<RegistrationApprovalPage />} />
              <Route path="hospitals" element={<HospitalListPage />} />
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
