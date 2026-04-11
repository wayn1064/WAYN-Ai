import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, User, Phone, Mail, Building, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { mockPubSub } from '../../../shared/utils/mockPubSub';

interface RegistrationRequest {
  id: string;
  hospitalName: string; // 맵핑된 카페(매장)명
  ceoName: string;
  contactNumber: string;
  email: string;
  businessRegistrationNumber?: string;
  address?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

export const ApprovalPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [allRequests, setAllRequests] = useState<RegistrationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'REJECTED'>('PENDING');
  const [selectedUser, setSelectedUser] = useState<RegistrationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requests = allRequests.filter(req => req.status === activeTab);

  // 권한 체크 (ADMIN)
  const isAdmin = currentUser?.customClaims?.role === 'ADMIN';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://34.158.193.220/api/wayn-ai';
      // solutionType 쿼리로 CAFEiN-Ai만 필터링해서 가져옴
      const response = await axios.get(`${BASE_URL}/api/registrations?solutionType=CAFEiN-Ai`);
      setAllRequests(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch cafein requests', err);
      setError('가입 요청 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, cafeName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!isAdmin) {
      alert('접근 권한이 없습니다. 관리자만 승인할 수 있습니다.');
      return;
    }

    const hospitalCode = window.prompt(`[${cafeName}] 측에 부여할 고유 '매장 코드 (예: CB-001)'를 입력해주세요.`);
    if (!hospitalCode) {
      alert('입력이 취소되어 승인이 중단되었습니다.');
      return;
    }

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://34.158.193.220/api/wayn-ai';
      // 백엔드는 hospitalCode 필드를 받아 tenant.name 등을 갱신함
      await axios.post(`${BASE_URL}/api/registrations/${id}/approve`, { hospitalCode });
      alert(`${cafeName} 매장의 가입이 승인되었습니다.`);
      
      mockPubSub.publish('USER_APPROVED', { id, cafeName });
      
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
      
      fetchRequests(); // 목록 새로고침
    } catch (err: any) {
      console.error('Failed to approve registration', err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert('승인 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleReject = async (id: string, cafeName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!isAdmin) {
      alert('접근 권한이 없습니다. 관리자만 반려할 수 있습니다.');
      return;
    }

    if (!window.confirm(`정말로 [${cafeName}] 매장의 가입을 반려하시겠습니까? 해당 매장은 시스템에 접속할 수 없게 됩니다.`)) {
      return;
    }

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://34.158.193.220/api/wayn-ai';
      await axios.post(`${BASE_URL}/api/registrations/${id}/reject`);
      alert(`${cafeName} 매장의 가입이 반려되었습니다.`);
      
      mockPubSub.publish('USER_APPROVED', { id, cafeName }); // To refresh Sidebar pending counts
      
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
      
      fetchRequests(); // 목록 새로고침
    } catch (err: any) {
      console.error('Failed to reject registration', err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert('반려 처리 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-[#1A365D] tracking-tight">가입 승인 관리</h1>
        <p className="text-slate-500 mt-1">CAFEiN-Ai 시스템 접근을 요청한 신규 가맹점(가입 대기자) 목록입니다.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex border-b border-slate-200 mb-6">
        <button 
          className={`px-6 py-3 font-bold text-sm transition-colors ${activeTab === 'PENDING' ? 'border-b-2 border-[#1A365D] text-[#1A365D]' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('PENDING')}
        >
          대기 중인 요청
        </button>
        <button 
          className={`px-6 py-3 font-bold text-sm transition-colors ${activeTab === 'REJECTED' ? 'border-b-2 border-red-600 text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('REJECTED')}
        >
          반려된 요청
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-end bg-[#f8fafc]">
          <button 
            onClick={fetchRequests}
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm"
          >
            새로고침
          </button>
        </div>
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
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400">데이터를 불러오는 중입니다...</td></tr>
            ) : requests.length === 0 ? (
              <tr className="hover:bg-slate-50 transition-colors">
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <CheckCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  {activeTab === 'PENDING' ? '대기 중인 가입 요청이 없습니다.' : '반려된 가입 요청이 없습니다.'}
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr 
                  key={req.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedUser(req)}
                >
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(req.requestedAt).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {req.businessRegistrationNumber || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 flex items-center gap-1 w-max text-xs font-bold rounded bg-blue-100 text-blue-700">
                      {req.hospitalName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                    신규 매장 계정 등록을 요청합니다.
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    {activeTab === 'PENDING' ? (
                      <>
                        <button 
                          onClick={(e) => handleApprove(req.id, req.hospitalName, e)}
                          className={`flex items-center gap-1 px-3 py-1.5 font-bold rounded-lg transition-all text-xs ${
                            isAdmin 
                              ? 'bg-[#1A365D] text-white hover:bg-blue-900 shadow-sm' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                          }`}
                          disabled={!isAdmin}
                        >
                          <CheckCircle size={14} /> 승인
                        </button>
                        <button 
                          onClick={(e) => handleReject(req.id, req.hospitalName, e)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <XCircle size={14} /> 반려
                        </button>
                      </>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-lg">
                        <XCircle size={14} /> 반려됨
                      </span>
                    )}
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
                가맹점 가입 요청 상세
              </h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <Building className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold text-slate-800">{selectedUser.businessRegistrationNumber || '-'}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700">
                      {selectedUser.hospitalName}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={12} /> {new Date(selectedUser.requestedAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 py-2">
                <div className="flex items-center gap-3 text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">대표자: {selectedUser.ceoName}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{selectedUser.contactNumber}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{selectedUser.address}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm"
              >
                닫기
              </button>
              {activeTab === 'PENDING' && (
                <button 
                  onClick={(e) => handleApprove(selectedUser.id, selectedUser.hospitalName, e)}
                  className={`px-4 py-2 font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm text-sm ${
                    isAdmin ? 'bg-[#1A365D] text-white hover:bg-blue-900' : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                  disabled={!isAdmin}
                >
                  <CheckCircle size={16} /> 이 사용자 승인하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
