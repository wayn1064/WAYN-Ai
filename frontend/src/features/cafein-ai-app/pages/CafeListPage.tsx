import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, CheckCircle } from 'lucide-react';
import { mockPubSub } from '../../../shared/utils/mockPubSub';

interface CafeUser {
  id: string;
  businessRegistrationNumber?: string;
  name: string; // cafe name
  createdAt: string;
}

export const CafeListPage: React.FC = () => {
  const [cafes, setCafes] = useState<CafeUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCafes = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://34.158.193.220/api/wayn-ai';
      const response = await axios.get(`${BASE_URL}/api/tenants?solutionType=CAFEiN-Ai`);
      if (response.data.success) {
        setCafes(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch cafes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();

    const unsubscribe = mockPubSub.subscribe('USER_APPROVED', () => {
      fetchCafes(); // 승인 완료 후 리프레시
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
              <th className="px-6 py-4 text-sm font-bold text-slate-600">회원매장 ID</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">사업자등록번호</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="p-12 text-center text-slate-400">데이터를 불러오는 중입니다...</td></tr>
            ) : cafes.length === 0 ? (
              <tr className="hover:bg-slate-50 transition-colors">
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  등록된 회원카페가 없습니다.
                </td>
              </tr>
            ) : (
              cafes.map((cafe) => (
                <tr key={cafe.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(cafe.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {cafe.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 flex items-center gap-2">
                    {cafe.businessRegistrationNumber || '-'}
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
