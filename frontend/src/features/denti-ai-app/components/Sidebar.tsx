import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Settings, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { mockPubSub } from '../../../shared/utils/mockPubSub';

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    mockPubSub.publish('navigation', { from: 'denti', to: 'gateway' });
    navigate('/');
  };

  return (
    <aside className="w-64 bg-[#1A365D] text-white flex flex-col h-full shadow-2xl z-20">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-[#2a4a7f]">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3 shadow-sm">
          <span className="text-white font-black text-lg tracking-tighter">D</span>
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight leading-tight">DENTi-Ai</h2>
          <p className="text-[10px] text-blue-300 font-medium">Dental Auto System</p>
        </div>
      </div>

      {/* User Info (Mock) */}
      <div className="px-6 py-5 bg-[#152e50] border-b border-[#2a4a7f]">
        <p className="text-sm font-bold">{currentUser?.name} <span className="text-xs font-normal text-blue-300">님</span></p>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 bg-blue-600/50 text-blue-100 text-[10px] rounded font-bold tracking-wider">
            {currentUser?.customClaims.role}
          </span>
          <span className="text-xs text-blue-300">{currentUser?.customClaims.tenantId}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-2">
        <NavLink
          to="/denti-dashboard"
          end
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive 
                ? 'bg-blue-600/30 text-white font-bold' 
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <LayoutDashboard size={20} className="mr-3 opacity-80 group-hover:opacity-100 transition-opacity" />
          대시보드
        </NavLink>

        <NavLink
          to="/denti-dashboard/approvals"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive 
                ? 'bg-blue-600/30 text-white font-bold' 
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <CheckSquare size={20} className="mr-3 opacity-80 group-hover:opacity-100 transition-opacity" />
          <span className="flex-1">가입 승인 관리</span>
          {/* Notification Badge Mock */}
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
        </NavLink>

        <NavLink
          to="/admin/hospitals"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive 
                ? 'bg-blue-600/30 text-white font-bold' 
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <Building2 size={20} className="mr-3 opacity-80 group-hover:opacity-100 transition-opacity" />
          <span className="flex-1">회원병원 목록</span>
        </NavLink>
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-[#2a4a7f]">
        <button className="flex items-center w-full px-4 py-3 text-blue-200 hover:bg-white/10 hover:text-white rounded-xl transition-colors">
          <Settings size={20} className="mr-3 opacity-80" />
          설정
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-blue-200 hover:bg-white/10 hover:text-white rounded-xl transition-colors mt-1"
        >
          <LogOut size={20} className="mr-3 opacity-80" />
          게이트웨이로 나가기
        </button>
      </div>
    </aside>
  );
};
