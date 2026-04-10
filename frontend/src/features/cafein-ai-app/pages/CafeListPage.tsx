import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle, Lock } from 'lucide-react';
import { userStore, type CafeUser } from '../store/userStore';
import { mockPubSub } from '../../../shared/utils/mockPubSub';

export const CafeListPage: React.FC = () => {
  const [cafes, setCafes] = useState<CafeUser[]>(userStore.approvedUsers);

  useEffect(() => {
    // 마운트 시 최신 데이터로 업데이트 
    setCafes([...userStore.approvedUsers]);

    // 실시간 이벤트 구독 (승인된 유저가 추가되면 상태 업데이트)
    const unsubscribe = mockPubSub.subscribe('USER_APPROVED', (newUser: CafeUser) => {
      setCafes((prev) => {
        if (prev.find((u) => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-[#1A365D] tracking-tight">회원카페 목록</h1>
        <p className="text-slate-500 mt-1">현재 CAFEiN-Ai 시스템에 가입 승인되어 활성화된 가맹점 카페 목록입니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8fafc] border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">등록일</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">사업자등록번호</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">카페이름</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">권한 현황 (메뉴 접근)</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cafes.length === 0 ? (
              <tr className="hover:bg-slate-50 transition-colors">
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  등록된 회원카페가 없습니다.
                </td>
              </tr>
            ) : (
              cafes.map((cafe) => (
                <tr key={cafe.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{cafe.requestDate}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">
                    {cafe.businessNumber}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {cafe.cafeName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(cafe.accessibleMenus || []).map((menu, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold rounded flex items-center gap-1">
                          <Lock size={10} /> {menu === 'dashboard' ? '대시보드' : menu === 'approvals' ? '승인관리' : menu === 'cafes' ? '카페목록' : '설정'}
                        </span>
                      ))}
                      {(!cafe.accessibleMenus || cafe.accessibleMenus.length === 0) && (
                        <span className="text-xs text-slate-400">권한 없음</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full">
                      <CheckCircle size={14} /> 활성
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
