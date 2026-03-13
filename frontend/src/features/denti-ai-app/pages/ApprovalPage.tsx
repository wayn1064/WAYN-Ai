import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export const ApprovalPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-[#1A365D] tracking-tight">가입 승인 관리</h1>
        <p className="text-slate-500 mt-1">DENTi-Ai 시스템 접근을 요청한 신규 가입 대기자 목록입니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8fafc] border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">요청일</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">이름</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">직책/권한</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">요청 메시지</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">상태/액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Mock Data Row 1 */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm text-slate-500">2026.03.13</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-800">이실장</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">USER (데스크)</span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">신규 데스크 직원 계정 승인 요청합니다.</td>
              <td className="px-6 py-4 flex justify-end gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-[#1A365D] text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition-colors">
                  <CheckCircle size={14} /> 승인
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">
                  <XCircle size={14} /> 반려
                </button>
              </td>
            </tr>
            {/* Mock Data Row 2 */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm text-slate-500">2026.03.12</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-800">박원장</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded">ADMIN (원장)</span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">페이닥터 조인으로 인한 계정 발급</td >
              <td className="px-6 py-4 flex justify-end gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-[#1A365D] text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition-colors">
                  <CheckCircle size={14} /> 승인
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors">
                  <XCircle size={14} /> 반려
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
