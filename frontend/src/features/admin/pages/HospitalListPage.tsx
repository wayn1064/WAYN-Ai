import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, User, Phone, Mail, CheckCircle } from 'lucide-react';


interface RegistrationRequest {
  id: string;
  hospitalName: string;
  ceoName: string;
  contactNumber: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

export const HospitalListPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                <tr key={hospital.id} className="hover:bg-slate-50 transition-colors">
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
    </div>
  );
};
