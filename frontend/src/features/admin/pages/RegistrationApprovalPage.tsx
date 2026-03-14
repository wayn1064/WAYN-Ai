import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Building2, User, Phone, Mail, XCircle } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';

// API 통신을 위한 인터페이스 정의
interface RegistrationRequest {
  id: string;
  hospitalName: string;
  ceoName: string;
  contactNumber: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

export const RegistrationApprovalPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);

  // 권한 Mocking: ADMIN 롤 체크
  const isAdmin = currentUser?.customClaims?.role === 'ADMIN';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/registrations');
      setRequests(response.data.data.filter((req: RegistrationRequest) => req.status === 'PENDING'));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch requests', err);
      setError('가입 요청 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, hospitalName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!isAdmin) {
      alert('접근 권한이 없습니다. 최고 관리자만 승인할 수 있습니다.');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/registrations/${id}/approve`);
      alert(`${hospitalName} 측의 가입이 승인되었습니다. 테넌트 및 관리자 계정이 생성되었습니다.`);
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
      
      fetchRequests(); // 목록 새로고침
    } catch (err) {
      console.error('Failed to approve registration', err);
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A365D] tracking-tight">가입 승인 관리</h1>
        <p className="text-slate-500 mt-2">DENTi-Ai 등 위성 솔루션의 신규 고객사(병원/가맹점) 도입 문의 및 가입 요청을 처리합니다.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc]">
          <h2 className="text-lg font-semibold text-[#1A365D] flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            대기 중인 요청 ({requests.length}건)
          </h2>
          <button 
            onClick={fetchRequests}
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm"
          >
            새로고침
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">데이터를 불러오는 중입니다...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              대기 중인 가입 요청이 없습니다.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">요청일시</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">고객사 (병원명)</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">대표자</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 text-center">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr 
                    key={req.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(req.requestedAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {req.hospitalName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <User className="w-4 h-4 text-slate-400" />
                        {req.ceoName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={(e) => handleApprove(req.id, req.hospitalName, e)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isAdmin 
                              ? 'bg-[#1A365D] text-white hover:bg-blue-900 shadow-sm' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 grayscale'
                          }`}
                          disabled={!isAdmin}
                        >
                          <CheckCircle className="w-4 h-4" />
                          승인
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Popup Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRequest(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-xl font-bold text-[#1A365D] flex items-center gap-2">
                가입 요청 상세 정보
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-[#1A365D]/5 rounded-xl flex items-center justify-center border border-[#1A365D]/10">
                  <Building2 className="w-8 h-8 text-[#1A365D]" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">{selectedRequest.hospitalName}</h4>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <User size={14} /> 대표: {selectedRequest.ceoName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 py-2">
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">연락처</p>
                    <span className="text-sm font-medium">{selectedRequest.contactNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">이메일</p>
                    <span className="text-sm font-medium">{selectedRequest.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">요청일시</p>
                    <span className="text-sm font-medium">{new Date(selectedRequest.requestedAt).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm"
              >
                닫기
              </button>
              <button 
                onClick={() => handleApprove(selectedRequest.id, selectedRequest.hospitalName)}
                className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm text-sm ${
                  isAdmin 
                    ? 'bg-[#1A365D] text-white hover:bg-blue-900' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 grayscale'
                }`}
                disabled={!isAdmin}
              >
                <CheckCircle size={16} /> 가입 승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
