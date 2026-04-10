import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, Shield, Phone, Mail } from 'lucide-react';
import { userStore, type CafeUser } from '../store/userStore';
import { mockPubSub } from '../../../shared/utils/mockPubSub';

export const ApprovalPage: React.FC = () => {
  const [requests, setRequests] = useState<CafeUser[]>(userStore.pendingUsers);
  const [selectedUser, setSelectedUser] = useState<CafeUser | null>(null);

  useEffect(() => {
    // 마운트 시 최신 데이터로 업데이트
    setRequests([...userStore.pendingUsers]);
  }, []);

  const handleApprove = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Store 업데이트
    const approvedUser = userStore.approveUser(id);
    if (approvedUser) {
      // 로컬 상태 업데이트
      setRequests([...userStore.pendingUsers]);
      
      // PubSub 이벤트 발행하여 UserListPage 등 다른 컴포넌트에 알림
      mockPubSub.publish('USER_APPROVED', approvedUser);
      
      // 혹시 해당 유저의 팝업이 떠있었다면 닫기
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
      
      alert(`${approvedUser.cafeName} 매장의 가입이 승인되었습니다.`);
    }
  };

  const handleReject = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    alert(`유저 ID ${id} 반려 처리는 아직 구현되지 않았습니다.`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-[#1A365D] tracking-tight">가입 승인 관리</h1>
        <p className="text-slate-500 mt-1">CAFEiN-Ai 시스템 접근을 요청한 신규 가입 대기자 목록입니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8fafc] border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">요청일</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">사업자등록번호</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">카페이름</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">요청 메시지</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">상태/액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <tr className="hover:bg-slate-50 transition-colors">
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  대기 중인 가입 요청이 없습니다.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr 
                  key={req.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedUser(req)}
                >
                  <td className="px-6 py-4 text-sm text-slate-500">{req.requestDate}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {req.businessNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 flex items-center gap-1 w-max text-xs font-bold rounded bg-blue-100 text-blue-700">
                      {req.cafeName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{req.message}</td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button 
                      onClick={(e) => handleApprove(req.id, e)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#1A365D] text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition-colors"
                    >
                      <CheckCircle size={14} /> 승인
                    </button>
                    <button 
                      onClick={(e) => handleReject(req.id, e)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <XCircle size={14} /> 반려
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Popup Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-xl font-bold text-[#1A365D] flex items-center gap-2">
                가입 요청 상세 정보
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold text-slate-800">{selectedUser.businessNumber}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700">
                      {selectedUser.cafeName}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">요청일: {selectedUser.requestDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 py-2">
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{selectedUser.contact}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{selectedUser.email}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h5 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">요청 메시지</h5>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedUser.message}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                닫기
              </button>
              <button 
                onClick={() => handleApprove(selectedUser.id)}
                className="px-4 py-2 bg-[#1A365D] text-white font-semibold rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2 shadow-sm"
              >
                <CheckCircle size={16} /> 이 사용자 승인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
