// CAFEiN-Ai 프로그램의 일시적인 전역 상태 모사 (새로고침 시 초기화)
// 실제 환경에서는 React Query나 Redux, Zustand 등을 사용하거나 백엔드 DB에서 직접 조회합니다.

export interface CafeUser {
  id: string;
  name: string;
  role: string;
  email: string;
  contact: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  message?: string;
}

// 초기 대기자 데이터 모사
export const initialPendingUsers: CafeUser[] = [
  {
    id: 'req_1',
    name: '이실장',
    role: 'USER',
    email: 'lee@cafeinai.kr',
    contact: '010-1111-2222',
    status: 'PENDING',
    requestDate: '2026.03.13',
    message: '신규 매장 직원 계정 승인 요청합니다.',
  },
  {
    id: 'req_2',
    name: '박점주',
    role: 'ADMIN',
    email: 'park@cafeinai.kr',
    contact: '010-3333-4444',
    status: 'PENDING',
    requestDate: '2026.03.12',
    message: '바리스타 조인으로 인한 계정 발급',
  },
];

// 초기 승인된 사용자 데이터
export const initialApprovedUsers: CafeUser[] = [
  {
    id: 'usr_1',
    name: '김점주',
    role: 'ADMIN',
    email: 'kim@cafeinai.kr',
    contact: '010-0000-0000',
    status: 'APPROVED',
    requestDate: '2025.01.01',
  }
];

// 간단한 인메모리 스토어 객체
class MockUserStore {
  pendingUsers: CafeUser[] = [...initialPendingUsers];
  approvedUsers: CafeUser[] = [...initialApprovedUsers];

  approveUser(id: string) {
    const userIndex = this.pendingUsers.findIndex((u) => u.id === id);
    if (userIndex > -1) {
      const user = this.pendingUsers[userIndex];
      user.status = 'APPROVED';
      this.approvedUsers.push(user);
      this.pendingUsers.splice(userIndex, 1);
      return user;
    }
    return null;
  }
}

export const userStore = new MockUserStore();
