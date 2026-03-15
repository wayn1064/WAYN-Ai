import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, User, Phone, Mail, CheckCircle, XCircle, FileText, MapPin, Lock, Clock, Save, Edit2, Plus } from 'lucide-react';


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

export const HospitalListPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<RegistrationRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<RegistrationRequest>>({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientData, setNewClientData] = useState<Partial<RegistrationRequest>>({
    status: 'APPROVED',
    accessibleMenus: ['원장실', '경영지원실', '데스크']
  });

  const MENU_OPTIONS = ['원장실', '경영지원실', '진료실', '기공실', '데스크', '중앙공급실', '상담실', '마이오피스'];

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

  const handleEditClick = (hospital: RegistrationRequest) => {
    setSelectedHospital(hospital);
    setFormData({
      hospitalName: hospital.hospitalName,
      ceoName: hospital.ceoName,
      contactNumber: hospital.contactNumber,
      email: hospital.email,
      password: hospital.password || '',
      businessRegistrationNumber: hospital.businessRegistrationNumber || '',
      address: hospital.address || '',
      accessibleMenus: hospital.accessibleMenus || []
    });
    setIsEditing(false);
  };

  const handleMenuToggle = (menu: string) => {
    setFormData(prev => {
      const menus = prev.accessibleMenus || [];
      if (menus.includes(menu)) {
        return { ...prev, accessibleMenus: menus.filter(m => m !== menu) };
      } else {
        return { ...prev, accessibleMenus: [...menus, menu] };
      }
    });
  };

  const handleSave = async () => {
    if (!selectedHospital) return;
    
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(`${BASE_URL}/api/registrations/${selectedHospital.id}`, formData);
      alert('회원병원 정보가 성공적으로 수정되었습니다.');
      setIsEditing(false);
      fetchApprovedHospitals(); // 목록 새로고침
      
      // Update selected hospital to reflect new data
      setSelectedHospital({
        ...selectedHospital,
        ...formData
      } as RegistrationRequest);
    } catch (err) {
      console.error('Failed to update hospital info', err);
      alert('세부 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCreateClient = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${BASE_URL}/api/registrations`, newClientData);
      alert('신규 거래처가 성공적으로 등록되었습니다.');
      setShowAddModal(false);
      setNewClientData({
        status: 'APPROVED',
        accessibleMenus: ['원장실', '경영지원실', '데스크']
      });
      fetchApprovedHospitals(); // 목록 새로고침
    } catch (err) {
      console.error('Failed to create new hospital', err);
      alert('신규 거래처 등록 중 오류가 발생했습니다.');
    }
  };

  const handleNewClientMenuToggle = (menu: string) => {
    setNewClientData(prev => {
      const menus = prev.accessibleMenus || [];
      if (menus.includes(menu)) {
        return { ...prev, accessibleMenus: menus.filter(m => m !== menu) };
      } else {
        return { ...prev, accessibleMenus: [...menus, menu] };
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up space-y-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#1A365D] tracking-tight">회원병원 목록</h1>
          <p className="text-slate-500 mt-2">DENTi-Ai 시스템 가입 승인이 완료되어 활성화된 회원병원 목록입니다.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          신규 거래처 추가
        </button>
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
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditClick(hospital); }}
                      className="px-3 py-1.5 flex items-center gap-1 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors text-xs font-bold rounded-lg shadow-sm"
                    >
                      <Edit2 size={14} /> 수정
                    </button>
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

      {/* Add New Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowAddModal(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transform transition-all my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc] sticky top-0 z-10">
              <h3 className="text-xl font-bold text-[#1A365D] flex items-center gap-2">
                신규 거래처 추가
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCreateClient}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  <Save size={16} /> 추가하기
                </button>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">병원명 (고객사명) *</label>
                  <input 
                    type="text" 
                    value={newClientData.hospitalName || ''} 
                    onChange={(e) => setNewClientData({...newClientData, hospitalName: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="예: 서울아산치과"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">대표자명 *</label>
                  <input 
                    type="text" 
                    value={newClientData.ceoName || ''} 
                    onChange={(e) => setNewClientData({...newClientData, ceoName: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">연락처 *</label>
                  <input 
                    type="text" 
                    value={newClientData.contactNumber || ''} 
                    onChange={(e) => setNewClientData({...newClientData, contactNumber: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="02-000-0000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">사업자등록번호</label>
                  <input 
                    type="text" 
                    value={newClientData.businessRegistrationNumber || ''} 
                    onChange={(e) => setNewClientData({...newClientData, businessRegistrationNumber: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">주소</label>
                  <input 
                    type="text" 
                    value={newClientData.address || ''} 
                    onChange={(e) => setNewClientData({...newClientData, address: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">마스터 이메일(아이디) *</label>
                  <input 
                    type="email" 
                    value={newClientData.email || ''} 
                    onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="admin@hospital.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">임시 비밀번호 *</label>
                  <input 
                    type="text" 
                    value={newClientData.password || ''} 
                    onChange={(e) => setNewClientData({...newClientData, password: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    기본 메뉴 권한 설정
                  </h4>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {MENU_OPTIONS.map(menu => {
                      const isChecked = (newClientData.accessibleMenus || []).includes(menu);
                      return (
                        <label 
                          key={menu} 
                          className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer hover:bg-white hover:border-blue-300 ${isChecked ? 'bg-white border-blue-500 shadow-sm' : 'border-slate-200 opacity-60'}`}
                        >
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            checked={isChecked}
                            onChange={() => handleNewClientMenuToggle(menu)}
                          />
                          <span className={`text-sm font-bold ${isChecked ? 'text-blue-900' : 'text-slate-500'}`}>
                            {menu}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2 bg-white border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm shadow-sm"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Popup Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedHospital(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transform transition-all my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc] sticky top-0 z-10">
              <h3 className="text-xl font-bold text-[#1A365D] flex items-center gap-2">
                회원병원 세부 정보 
                {isEditing && <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full border border-yellow-200">수정 모드</span>}
              </h3>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} /> 수정하기
                  </button>
                ) : (
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                  >
                    <Save size={16} /> 저장하기
                  </button>
                )}
                <button onClick={() => { setSelectedHospital(null); setIsEditing(false); }} className="text-slate-400 hover:text-slate-600 p-1">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Header Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 flex-shrink-0">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.hospitalName || ''} 
                      onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                      className="text-xl font-black text-slate-800 tracking-tight bg-white border border-blue-300 rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="병원명"
                    />
                  ) : (
                    <h4 className="text-xl font-black text-slate-800 tracking-tight">{selectedHospital.hospitalName}</h4>
                  )}
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-1 font-medium">
                    <User size={14} /> 대표: 
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.ceoName || ''} 
                        onChange={(e) => setFormData({...formData, ceoName: e.target.value})}
                        className="bg-white border border-blue-300 rounded md px-2 py-0.5 ml-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-32"
                      />
                    ) : (
                      selectedHospital.ceoName
                    )}
                  </p>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 sm:col-span-1 shadow-sm">
                  <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 w-full">
                    <p className="text-xs text-slate-400 font-bold mb-1">사업자등록번호</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.businessRegistrationNumber || ''} 
                        onChange={(e) => setFormData({...formData, businessRegistrationNumber: e.target.value})}
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                    ) : (
                      <span className="text-sm font-medium">{selectedHospital.businessRegistrationNumber || '-'}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 sm:col-span-1 shadow-sm">
                  <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 w-full">
                    <p className="text-xs text-slate-400 font-bold mb-1">연락처</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.contactNumber || ''} 
                        onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                    ) : (
                      <span className="text-sm font-medium">{selectedHospital.contactNumber}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 shadow-sm">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 w-full relative">
                    <p className="text-xs text-slate-400 font-bold mb-1">주소</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.address || ''} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                    ) : (
                      <span className="text-sm font-medium block pr-8">{selectedHospital.address || '-'}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 sm:col-span-1 shadow-sm">
                  <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 w-full">
                    <p className="text-xs text-slate-400 font-bold mb-1">마스터 이메일(아이디)</p>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={formData.email || ''} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                    ) : (
                      <span className="text-sm font-medium break-all">{selectedHospital.email}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 sm:col-span-1 shadow-sm">
                  <Lock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 w-full">
                    <p className="text-xs text-slate-400 font-bold mb-1">마스터 비밀번호</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.password || ''} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                      />
                    ) : (
                      <span className="text-sm font-medium">{selectedHospital.password || '-'}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-2 sm:col-span-1 shadow-sm">
                  <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold mb-1">가입 승인일시</p>
                    <span className="text-sm font-medium">{new Date(selectedHospital.requestedAt).toLocaleString('ko-KR')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-slate-600 bg-green-50 p-4 rounded-xl border border-green-100 col-span-2 sm:col-span-1 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-green-600 font-bold mb-1">현재 상태</p>
                    <span className="text-sm font-bold text-green-700">활성화됨</span>
                  </div>
                </div>
              </div>

              {/* Permissions (Accessible Menus) */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    메뉴 권한 설정
                  </h4>
                  <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded-md">
                    현재 {(isEditing ? formData.accessibleMenus?.length : selectedHospital.accessibleMenus?.length) || 0}개 메뉴 허용
                  </span>
                </div>
                
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {MENU_OPTIONS.map(menu => {
                      const isChecked = isEditing 
                        ? (formData.accessibleMenus || []).includes(menu)
                        : (selectedHospital.accessibleMenus || []).includes(menu);
                        
                      return (
                        <label 
                          key={menu} 
                          className={`flex items-center gap-2.5 p-3 rounded-lg border transition-all ${
                            isEditing ? 'cursor-pointer hover:bg-white hover:border-blue-300' : 'cursor-default'
                          } ${isChecked ? 'bg-white border-blue-500 shadow-sm' : 'border-slate-200 opacity-60'}`}
                        >
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            checked={isChecked}
                            onChange={() => isEditing && handleMenuToggle(menu)}
                            disabled={!isEditing}
                          />
                          <span className={`text-sm font-bold ${isChecked ? 'text-blue-900' : 'text-slate-500'}`}>
                            {menu}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {isEditing && (
                     <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
                       <CheckCircle size={12} className="text-blue-500" /> 
                       체크 해제된 메뉴는 해당 병원 접속 시 자동으로 숨겨지거나 접근이 차단됩니다.
                     </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => { setSelectedHospital(null); setIsEditing(false); }}
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
