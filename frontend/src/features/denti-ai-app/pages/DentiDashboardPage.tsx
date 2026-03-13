import React from 'react';
import { Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export const DentiDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-[#1A365D] tracking-tight">DENTi-Ai 요약 대시보드</h1>
          <p className="text-slate-500 mt-1">오늘의 주요 병원 운영 지표를 확인하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Mock Summary Cards */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">신규 환자</p>
            <p className="text-2xl font-bold text-slate-800">12명</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">일일 매출</p>
            <p className="text-2xl font-bold text-slate-800">2.4M</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">금일 예약</p>
            <p className="text-2xl font-bold text-slate-800">45건</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">미처리 승인</p>
            <p className="text-2xl font-bold text-slate-800">3건</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center">
        <p className="text-slate-400">차트 영역 (준비 중)</p>
      </div>
    </div>
  );
};
