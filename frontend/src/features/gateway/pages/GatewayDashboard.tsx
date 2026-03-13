import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { SolutionCard } from '../components/SolutionCard';
import { 
  Stethoscope, 
  Warehouse, 
  Coffee, 
  Factory, 
  BriefcaseMedical, 
  Gift, 
  Image as ImageIcon, 
  Truck 
} from 'lucide-react';
import { mockPubSub } from '../../../shared/utils/mockPubSub';

const SOLUTIONS = [
  {
    id: 'DENTi-Ai',
    title: 'DENTi-Ai',
    description: '치과 병의원 전용 스마트 무인 자동화 ERP',
    icon: <Stethoscope size={28} />,
    isActive: true,
    path: '/denti-dashboard',
  },
  {
    id: 'LOGiS-Ai',
    title: 'LOGiS-Ai',
    description: '유통 및 물류 기업을 위한 지능형 관리 시스템',
    icon: <Warehouse size={28} />,
    isActive: false,
    path: '/logis-dashboard',
  },
  {
    id: 'CAFEiN-Ai',
    title: 'CAFEiN-Ai',
    description: '프랜차이즈 카페 통합 본사/가맹점 관리 솔루션',
    icon: <Coffee size={28} />,
    isActive: false,
    path: '/cafein-dashboard',
  },
  {
    id: 'iNDUSTRY-Ai',
    title: 'iNDUSTRY-Ai',
    description: '제조공정 및 스마트 팩토리 제어/모니터링',
    icon: <Factory size={28} />,
    isActive: false,
    path: '/industry-dashboard',
  },
  {
    id: 'MEDiJOB-Ai',
    title: 'MEDiJOB-Ai',
    description: '의료계 전문 AI 인재 추천 및 구인구직 플랫폼',
    icon: <BriefcaseMedical size={28} />,
    isActive: false,
    path: '/medijob-dashboard',
  },
  {
    id: 'GiFT-Ai',
    title: 'GiFT-Ai',
    description: '기업용 맞춤형 판촉물 큐레이션 및 발주',
    icon: <Gift size={28} />,
    isActive: false,
    path: '/gift-dashboard',
  },
  {
    id: 'MEDiART-Ai',
    title: 'MEDiART-Ai',
    description: '병원 전용 고품질 디지털 에셋 및 컨텐츠 샵',
    icon: <ImageIcon size={28} />,
    isActive: false,
    path: '/mediart-dashboard',
  },
  {
    id: 'MEDiLOGiS-Ai',
    title: 'MEDiLOGiS-Ai',
    description: '의료/일반 하이브리드 유통망 B2B 스토어',
    icon: <Truck size={28} />,
    isActive: false,
    path: '/medilogis-dashboard',
  },
];

export const GatewayDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Toast Alert Mock Subscriber
    const unsubscribe = mockPubSub.subscribe('toast', (payload: any) => {
      setToastMessage(payload.message);
      setTimeout(() => setToastMessage(null), 3000);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      {/* Toast Mock UI */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A365D] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl tracking-tighter">W</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1A365D] tracking-tight">WAYN-Ai</h1>
              <p className="text-xs text-slate-500 font-medium">Enterprise Gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-[#1E293B]">{currentUser?.name}</p>
              <p className="text-xs text-slate-500">{currentUser?.customClaims.tenantId} ({currentUser?.customClaims.role})</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-[#1A365D] font-bold">
              {currentUser?.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center animate-fade-in-up">
          <h2 className="text-4xl font-black text-[#1A365D] mb-4">Welcome to WAYN Ecosystem</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            원하는 솔루션을 선택하여 업무를 시작하세요. 모든 서비스는 중앙 허브를 통해 완벽히 통합되고 관리됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SOLUTIONS.map((solution) => (
            <SolutionCard key={solution.id} {...solution} />
          ))}
        </div>
      </main>
    </div>
  );
};
