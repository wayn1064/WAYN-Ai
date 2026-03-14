import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, User, Phone, Mail, CheckCircle, XCircle, FileText, MapPin, Lock, Clock } from 'lucide-react';


interface RegistrationRequest {
  id: string;
  hospitalName: string;
  ceoName: string;
  contactNumber: string;
  email: string;
  password?: string;
  businessRegistrationNumber?: string;
  address?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

export const HospitalListPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<RegistrationRequest | null>(null);

  useEffect(() => {
    fetchApprovedHospitals();
  }, []);

  const fetchApprovedHospitals = async () => {
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${BASE_URL}/api/registrations`);
      setHospitals(response.data.data.filter((req: RegistrationRequest) => req.status === 'APPROVED'));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch hospitals', err);
      setError('회원병원 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A365D] tracking-tight">회원병원 목록</h1>
        <p className="text-slate-500 mt-2">DENTi-Ai 시스템 가입 승인이 완료되어 활성화된 회원병원 목록입니다.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8fafc] border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">등록일</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">고객사 (병원명)</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">대표자</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">연락처 및 이메일</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr className="hover:bg-slate-50 transition-colors">
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">데이터를 불러오는 중입니다...</td>
              </tr>
            ) : hospitals.length === 0 ? (
              <tr className="hover:bg-slate-50 transition-colors">
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  등록된 회원병원이 없습니다.
                </td>
              </tr>
            ) : (
              hospitals.map((hospital) => (
                <tr 
                  key={hospital.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedHospital(hospital)}
                >
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(hospital.requestedAt).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {hospital.hospitalName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 text-sm">
                      <User className="w-4 h-4 text-slate-400" />
                      {hospital.ceoName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      <span className="flex items-center gap-2"><Phone className="w-3 h-3 text-slate-400" /> {hospital.contactNumber}</span>
                      <span className="flex items-center gap-2"><Mail className="w-3 h-3 text-slate-400" /> {hospital.email}</span>
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

      {/* Detail Popup Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedHospital(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-xl font-bold text-[#1A365D] flex items-center gap-2">
                회원병원 세부 정보
              </h3>
              <button onClick={() => setSelectedHospital(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">{selectedHospital.hospitalName}</h4>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <User size={14} /> 대표: {selectedHospital.ceoName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">사업자등록번호</p>
                    <span className="text-sm font-medium">{selectedHospital.businessRegistrationNumber || '-'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">연락처</p>
                    <span className="text-sm font-medium">{selectedHospital.contactNumber}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">주소</p>
                    <span className="text-sm font-medium">{selectedHospital.address || '-'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">마스터 이메일(아이디)</p>
                    <span className="text-sm font-medium break-all">{selectedHospital.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">마스터 비밀번호</p>
                    <span className="text-sm font-medium">{selectedHospital.password || '-'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-0.5">가입 승인일시</p>
                    <span className="text-sm font-medium">{new Date(selectedHospital.requestedAt).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-slate-600 bg-green-50 p-3 rounded-lg border border-green-100 col-span-2 sm:col-span-1">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-xs text-green-600 font-bold mb-0.5">현재 상태</p>
                    <span className="text-sm font-bold text-green-700">활성화됨</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedHospital(null)}
                className="px-6 py-2 bg-white border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm shadow-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
