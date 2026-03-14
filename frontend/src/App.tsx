import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './shared/contexts/AuthContext';
import { GatewayDashboard } from './features/gateway/pages/GatewayDashboard';
import { DentiLayout } from './features/denti-ai-app/components/DentiLayout';
import { DentiDashboardPage } from './features/denti-ai-app/pages/DentiDashboardPage';
import { ApprovalPage } from './features/denti-ai-app/pages/ApprovalPage';
import { RegistrationApprovalPage } from './features/admin/pages/RegistrationApprovalPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main WAYN-Ai Gateway */}
          <Route path="/" element={<GatewayDashboard />} />
          
          {/* DENTi-Ai App Layout & Nested Routes */}
          <Route path="/denti-dashboard" element={<DentiLayout />}>
            <Route index element={<DentiDashboardPage />} />
            <Route path="approvals" element={<ApprovalPage />} />
          </Route>
          
          {/* WAYN-Ai Admin Registration Route */}
          <Route path="/admin/registrations" element={<RegistrationApprovalPage />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
