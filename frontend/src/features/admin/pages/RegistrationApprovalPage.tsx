import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Building2, User, Phone, Mail } from 'lucide-react';
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

  const handleApprove = async (id: string, hospitalName: string) => {
    if (!isAdmin) {
      alert('접근 권한이 없습니다. 최고 관리자만 승인할 수 있습니다.');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/registrations/${id}/approve`);
      alert(`${hospitalName} 측의 가입이 승인되었습니다. 테넌트 및 관리자 계정이 생성되었습니다.`);
      fetchRequests(); // 목록 새로고침
    } catch (err) {
      console.error('Failed to approve registration', err);
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A365D]">위성 시스템 가입 승인</h1>
          <p className="text-gray-500 mt-2">DENTi-Ai 등 위성 솔루션의 신규 고객사(병원/가맹점) 도입 문의 및 가입 요청을 처리합니다.</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1A365D]/5">
            <h2 className="text-lg font-semibold text-[#1A365D] flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              대기 중인 요청 ({requests.length}건)
            </h2>
            <button 
              onClick={fetchRequests}
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              새로고침
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-gray-400">데이터를 불러오는 중입니다...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                대기 중인 가입 요청이 없습니다.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-4 font-medium border-b border-gray-100">요청일시</th>
                    <th className="p-4 font-medium border-b border-gray-100">고객사 (병원명)</th>
                    <th className="p-4 font-medium border-b border-gray-100">대표자</th>
                    <th className="p-4 font-medium border-b border-gray-100">연락처 및 이메일</th>
                    <th className="p-4 font-medium border-b border-gray-100 text-center">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(req.requestedAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {req.hospitalName}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-gray-400" />
                          {req.ceoName}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                          <span className="flex items-center gap-2"><Phone className="w-3 h-3 text-gray-400" /> {req.contactNumber}</span>
                          <span className="flex items-center gap-2"><Mail className="w-3 h-3 text-gray-400" /> {req.email}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleApprove(req.id, req.hospitalName)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                              isAdmin 
                                ? 'bg-[#1A365D] text-white hover:bg-blue-900 shadow-sm' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 grayscale'
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
      </div>
    </div>
  );
};
