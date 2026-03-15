import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Building2, User, Phone, Mail, XCircle, FileText, MapPin, Lock, Layers } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';

// API 통신을 위한 인터페이스 정의
interface RegistrationRequest {
  id: string;
  hospitalName: string;
  ceoName: string;
  contactNumber: string;
  email: string;
  password?: string;
  businessRegistrationNumber?: string;
  address?: string;
  accessibleMenus?: string[];
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
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${BASE_URL}/api/registrations`);
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

    const hospitalCode = window.prompt(`${hospitalName} 측에 부여할 고유 '회원병원 ID (예: WAYN-001)'를 입력해주세요.`);
    if (!hospitalCode) {
      alert('회원병원 ID 입력이 취소되어 승인이 중단되었습니다.');
      return;
    }

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${BASE_URL}/api/registrations/${id}/approve`, { hospitalCode });
      alert(`${hospitalName} 측의 가입이 승인되었으며, [${hospitalCode}] 회원병원 ID가 성공적으로 부여되었습니다.`);
      
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
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
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">요청일</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">병원이름</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">대표원장 이름</th>
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
            
            <div className="p-6 space-y-6">
              {/* 1. 병원 기본 정보 */}
              <section>
                <h4 className="text-sm font-bold text-[#1A365D] mb-3 flex items-center gap-2 border-b pb-2">
                  <Building2 className="w-4 h-4" />
                  병원 기본 정보
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold mb-0.5">사업자등록번호</p>
                      <span className="text-sm font-medium">{selectedRequest.businessRegistrationNumber || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold mb-0.5">병원 이름</p>
                      <span className="text-sm font-medium">{selectedRequest.hospitalName || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold mb-0.5">대표원장 이름</p>
                      <span className="text-sm font-medium">{selectedRequest.ceoName || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold mb-0.5">연락처 (핸드폰번호)</p>
                      <span className="text-sm font-medium">{selectedRequest.contactNumber || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold mb-0.5">주소</p>
                      <span className="text-sm font-medium">{selectedRequest.address || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold mb-0.5">요청일</p>
                      <span className="text-sm font-medium">{new Date(selectedRequest.requestedAt).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. 최고 관리자 계정 */}
              <section>
                <h4 className="text-sm font-bold text-[#1A365D] mb-3 flex items-center gap-2 border-b pb-2">
                  <User className="w-4 h-4" />
                  최고 관리자 계정
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold mb-0.5">관리자 아이디</p>
                      <span className="text-sm font-medium break-all">{selectedRequest.email || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold mb-0.5">관리자 비밀번호</p>
                      <span className="text-sm font-medium">{selectedRequest.password || '-'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. 사용할 솔루션 선택 */}
              <section>
                <h4 className="text-sm font-bold text-[#1A365D] mb-3 flex items-center gap-2 border-b pb-2">
                  <Layers className="w-4 h-4" />
                  사용할 솔루션
                </h4>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedRequest.accessibleMenus && selectedRequest.accessibleMenus.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.accessibleMenus.map((menuId, idx) => {
                        // 영문 ID를 홈페이지 폼과 같은 한글 메뉴명으로 매핑 (기존 방식인 한글 데이터도 그대로 호환됨)
                        const menuMap: Record<string, string> = {
                          director: '원장실',
                          management: '경영지원실',
                          clinic: '진료실',
                          desk: '데스크',
                          supply: '중앙공급실',
                          lab: '기공실',
                          counsel: '상담실',
                          myoffice: '마이오피스',
                        };
                        const displayName = menuMap[menuId] || menuId;
                        return (
                          <span key={idx} className="px-2.5 py-1 bg-blue-100 text-[#1A365D] text-xs font-bold rounded-full border border-blue-200 shadow-sm flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                            {displayName}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 block p-2 text-center font-medium">선택된 솔루션이 없습니다.</span>
                  )}
                </div>
              </section>
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
