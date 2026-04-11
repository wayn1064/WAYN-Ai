import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, CheckCircle, Trash2, Save, X, Phone, Mail, MapPin, User, KeyRound } from 'lucide-react';
import { mockPubSub } from '../../../shared/utils/mockPubSub';

interface CafeUser {
  id: string;
  name: string; // cafe name
  createdAt: string;
  approvals?: { id: string; contentData?: any }[];
}

export const CafeListPage: React.FC = () => {
  const [cafes, setCafes] = useState<CafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCafe, setSelectedCafe] = useState<CafeUser | null>(null);
  
  // 팝업 폼 데이터
  const [formData, setFormData] = useState({
    businessRegistrationNumber: '',
    hospitalName: '',
    ceoName: '',
    contactNumber: '',
    address: '',
    email: '',
    password: ''
  });

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

  const handleRowClick = (cafe: CafeUser) => {
    const approvalData = cafe.approvals?.[0]?.contentData || {};
    setFormData({
      businessRegistrationNumber: approvalData.businessRegistrationNumber || '',
      hospitalName: approvalData.hospitalName || cafe.name || '',
      ceoName: approvalData.ceoName || '',
      contactNumber: approvalData.contactNumber || '',
      address: approvalData.address || '',
      email: approvalData.email || '',
      password: approvalData.password || ''
    });
    setSelectedCafe(cafe);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!selectedCafe || !selectedCafe.approvals || selectedCafe.approvals.length === 0) {
      alert('승인 기록을 찾을 수 없어 수정할 수 없습니다.');
      return;
    }

    if (!window.confirm('입력한 정보로 매장 정보를 수정하시겠습니까?')) return;

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://34.158.193.220/api/wayn-ai';
      const approvalId = selectedCafe.approvals[0].id;
      // 백엔드 updateRegistration 엔드포인트 기대 구조: { hospitalName, ceoName, contactNumber, address, businessRegistrationNumber, email, password }
      await axios.put(`${BASE_URL}/api/registrations/${approvalId}`, formData);
      alert('매장 정보가 성공적으로 수정되었습니다.');
      setSelectedCafe(null);
      fetchCafes();
    } catch (err) {
      console.error('Failed to update cafe info', err);
      alert('수정 중 서버 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!selectedCafe || !selectedCafe.approvals || selectedCafe.approvals.length === 0) {
      alert('승인 기록을 찾을 수 없어 삭제할 수 없습니다.');
      return;
    }

    if (!window.confirm(`정말로 해당 매장을 삭제하시겠습니까?\n매장과 연관된 모든 접근 권한이 서버에서 영구적으로 삭제됩니다.`)) return;

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://34.158.193.220/api/wayn-ai';
      const approvalId = selectedCafe.approvals[0].id; // deleteRegistration API gets approvalId then deletes Tenant
      await axios.delete(`${BASE_URL}/api/registrations/${approvalId}`);
      alert('매장 정보가 삭제되었습니다.');
      setSelectedCafe(null);
      fetchCafes();
    } catch (err) {
      console.error('Failed to delete cafe', err);
      alert('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-black text-[#1A365D] tracking-tight">회원카페 목록</h1>
        <p className="text-slate-500 mt-1">현재 CAFEiN-Ai 시스템에 가입 승인되어 활성화된 가맹점 카페 목록입니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap min-w-max">
          <thead className="bg-[#f8fafc] border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">등록일</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">카페 ID</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">카페이름</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600">카페주소</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-400">데이터를 불러오는 중입니다...</td></tr>
            ) : cafes.length === 0 ? (
              <tr className="hover:bg-slate-50 transition-colors">
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  등록된 회원카페가 없습니다.
                </td>
              </tr>
            ) : (
              cafes.map((cafe) => {
                const cafeName = cafe.approvals?.[0]?.contentData?.hospitalName || cafe.name;
                const address = cafe.approvals?.[0]?.contentData?.address || '-';
                return (
                  <tr 
                    key={cafe.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(cafe)}
                  >
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(cafe.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-700">
                      {cafe.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      {cafeName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">
                      {address}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full">
                        <CheckCircle size={14} /> 활성
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Detail & Edit Modal */}
      {selectedCafe && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in-up">
            <div className="sticky top-0 bg-[#1A365D] px-6 py-5 text-white flex justify-between items-center z-10 border-b border-blue-900">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {selectedCafe.name} 상세 관리
              </h3>
              <button onClick={() => setSelectedCafe(null)} className="text-blue-200 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* 기본 정보 */}
              <section>
                <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-400" /> 매장 기본 정보
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">사업자등록번호</label>
                    <input 
                      type="text" name="businessRegistrationNumber" value={formData.businessRegistrationNumber} onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">카페 이름</label>
                    <div className="relative">
                      <input 
                        type="text" name="hospitalName" value={formData.hospitalName} onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] outline-none text-sm font-medium"
                      />
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">대표자 이름</label>
                    <div className="relative">
                      <input 
                        type="text" name="ceoName" value={formData.ceoName} onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] outline-none text-sm font-medium"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">연락처 (핸드폰번호)</label>
                    <div className="relative">
                      <input 
                        type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] outline-none text-sm font-medium"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">카페 주소</label>
                    <div className="relative">
                      <input 
                        type="text" name="address" value={formData.address} onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] outline-none text-sm font-medium"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>
              </section>

              {/* 관리자 계정 정보 */}
              <section>
                <h4 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-slate-400" /> 최고 관리자 계정
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">관리자 아이디 (이메일)</label>
                    <div className="relative">
                      <input 
                        type="text" name="email" value={formData.email} onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] outline-none text-sm font-medium"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">비밀번호</label>
                    <input 
                      type="text" name="password" value={formData.password} onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1A365D] outline-none text-sm font-medium"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center z-10">
              <button 
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold rounded-lg transition-colors border border-red-200 shadow-sm text-sm"
              >
                <Trash2 size={16} /> 매장 영구 삭제
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedCafe(null)}
                  className="px-4 py-2 bg-white text-slate-600 hover:bg-slate-100 border border-slate-300 font-bold rounded-lg transition-colors text-sm shadow-sm"
                >
                  닫기
                </button>
                <button 
                  onClick={handleUpdate}
                  className="flex items-center gap-1.5 px-6 py-2 bg-[#1A365D] text-white hover:bg-blue-900 font-bold rounded-lg transition-colors shadow-sm text-sm"
                >
                  <Save size={16} /> 정보 저장(수정)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
