import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 짧은 지연으로 실제 인증 요청처럼 보이게 Mocking
      await new Promise(resolve => setTimeout(resolve, 600));

      const masterId = import.meta.env.VITE_MASTER_ID;
      const masterPassword = import.meta.env.VITE_MASTER_PASSWORD;

      if (userId === masterId && password === masterPassword) {
        // 성공 시 AuthContext 에 최고 관리자 정보 세팅
        login({
          id: 'admin_1',
          name: 'SYSTEM MASTER',
          customClaims: {
            role: 'ADMIN',
            accessibleModules: ['ALL'], // 모든 시스템 접근 가능
            tenantId: 'WAYN-HQ',
          },
        });
        
        // 로그인 성공 후 /gateway 로 이동 (우리는 / 가 메인 대시보드)
        navigate('/');
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[#1A365D] rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
            <span className="text-white font-black text-3xl tracking-tighter">W</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-[#1A365D] tracking-tight">
          WAYN-Ai Gateway
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          시스템 진입을 위해 마스터 계정으로 로그인해 주세요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 animate-shake">
                <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-sm font-bold text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="userId" className="block text-sm font-bold text-slate-700">
                아이디
              </label>
              <div className="mt-2 relative">
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A365D] focus:border-transparent transition-shadow font-medium"
                  placeholder="마스터 아이디를 입력하세요"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                비밀번호
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A365D] focus:border-transparent transition-shadow font-medium tracking-widest"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#1A365D] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A365D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    시스템 안전 로그인
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-400 font-medium">B2B Enterprise Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
