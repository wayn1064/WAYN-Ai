import React from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { mockPubSub } from '../../../shared/utils/mockPubSub';
import { useNavigate } from 'react-router-dom';

interface SolutionCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  path: string;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  id,
  title,
  description,
  icon,
  isActive,
  path,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // License checking (mocked via AuthContext custom claims)
  const hasAccess = currentUser?.customClaims.accessibleModules.includes(id);

  // If the module is not active yet (Coming Soon) or user doesn't have access, disable it.
  const isClickable = isActive && hasAccess;

  const handleClick = () => {
    if (!isActive) {
      alert("해당 서비스는 준비 중입니다."); // In real app, we use a Toast
      mockPubSub.publish('toast', { type: 'info', message: '해당 서비스는 준비 중입니다.' });
      return;
    }

    if (!hasAccess) {
      alert("가입하신 요금제에서는 지원하지 않거나 접근 권한이 없습니다.");
      mockPubSub.publish('toast', { type: 'error', message: '접근 권한이 없습니다.' });
      return;
    }

    // Pub/Sub event emit simulation
    mockPubSub.publish('navigation', { from: 'gateway', to: path });
    navigate(path);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative group flex flex-col p-6 rounded-2xl border transition-all duration-300
        ${isClickable 
          ? 'bg-white border-transparent shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer' 
          : 'bg-slate-50 border-slate-200 opacity-60 grayscale cursor-not-allowed'}
      `}
    >
      <div className={`
        w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300
        ${isClickable ? 'bg-blue-50 text-[#1A365D] group-hover:bg-[#1A365D] group-hover:text-white' : 'bg-slate-200 text-slate-500'}
      `}>
        {icon}
      </div>
      <h3 className={`text-xl font-bold mb-2 ${isClickable ? 'text-[#1E293B]' : 'text-slate-600'}`}>
        {title}
      </h3>
      <p className={`text-sm flex-grow ${isClickable ? 'text-slate-500' : 'text-slate-400'}`}>
        {description}
      </p>

      {/* Decorative Gradient Line for Active Cards */}
      {isClickable && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#1A365D] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
      )}

      {/* Badges */}
      {!isActive && (
        <div className="absolute top-4 right-4 bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
          Coming Soon
        </div>
      )}
      {isActive && !hasAccess && (
        <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
          No License
        </div>
      )}
    </div>
  );
};
