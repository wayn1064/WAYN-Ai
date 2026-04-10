import React from 'react';
import { Building2 } from 'lucide-react';

export const CafeListPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-[#1A365D] tracking-tight">회원카페 목록</h1>
          <p className="text-slate-500 mt-1">현재 CAFEiN-Ai 시스템에 등록된 가맹점 카페 목록입니다.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
        <Building2 className="w-16 h-16 text-slate-200 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">컨텐츠 준비 중</h2>
        <p className="text-slate-500 mt-2">가맹점 목록 및 상세 관리 기능이 곧 추가될 예정입니다.</p>
      </div>
    </div>
  );
};
