import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../../shared/contexts/AuthContext';

export const AdminLayout: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (currentUser?.customClaims.role !== 'ADMIN') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-slate-500">
        최고 관리자만 접근할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans antialiased text-slate-800">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto relative bg-[#f1f5f9]">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
