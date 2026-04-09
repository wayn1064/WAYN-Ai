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

import { CafeinLayout } from './features/cafein-ai-app/components/CafeinLayout';
import { CafeinDashboardPage } from './features/cafein-ai-app/pages/CafeinDashboardPage';
import { ApprovalPage as CafeinApprovalPage } from './features/cafein-ai-app/pages/ApprovalPage';
import { UserListPage as CafeinUserListPage } from './features/cafein-ai-app/pages/UserListPage';

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

            {/* CAFEiN-Ai App Layout & Nested Routes */}
            <Route path="/cafein-dashboard" element={<CafeinLayout />}>
              <Route index element={<CafeinDashboardPage />} />
              <Route path="approvals" element={<CafeinApprovalPage />} />
              <Route path="users" element={<CafeinUserListPage />} />
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
