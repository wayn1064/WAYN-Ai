import React, { useEffect, useState } from 'react';
import { User, CheckCircle, Shield } from 'lucide-react';
import { userStore, type CafeUser } from '../store/userStore';
import { mockPubSub } from '../../../shared/utils/mockPubSub';

export const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<CafeUser[]>(userStore.approvedUsers);

  useEffect(() => {
    // 마운트 시 최신 데이터로 업데이트 (다른 페이지에서 승인 후 넘어왔을 때 반영)
    setUsers([...userStore.approvedUsers]);

    // 실시간 이벤트 구독 (승인된 유저가 추가되면 상태 업데이트)
    const unsubscribe = mockPubSub.subscribe('USER_APPROVED', (newUser: CafeUser) => {
      // 이미 목록에 있는지 확인 후 추가
      setUsers((prev) => {
        if (prev.find((u) => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-[#1A365D] tracking-tight">사용자 목록</h1>
        <p className="text-slate-500 mt-1">현재 CAFEiN-Ai 시스템에 가입되어 활성화된 직원 목록입니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8fafc] border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">등록일</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">사업자등록번호</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">카페이름</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">이메일 계정</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr className="hover:bg-slate-50 transition-colors">
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  등록된 사용자가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{user.requestDate}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {user.businessNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 flex items-center gap-1 w-max text-xs font-bold rounded bg-blue-100 text-blue-700">
                      {user.cafeName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
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
