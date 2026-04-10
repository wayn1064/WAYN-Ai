// CAFEiN-Ai 프로그램의 일시적인 전역 상태 모사 (새로고침 시 초기화)
// 실제 환경에서는 React Query나 Redux, Zustand 등을 사용하거나 백엔드 DB에서 직접 조회합니다.

export interface CafeUser {
  id: string;
  businessNumber: string;
  cafeName: string;
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
    businessNumber: '123-45-67890',
    cafeName: '스타벅스 강남점',
    email: 'lee@cafeinai.kr',
    contact: '010-1111-2222',
    status: 'PENDING',
    requestDate: '2026.03.13',
    message: '신규 매장 계정 승인 요청합니다.',
  },
  {
    id: 'req_2',
    businessNumber: '987-65-43210',
    cafeName: '메가커피 홍대점',
    email: 'park@cafeinai.kr',
    contact: '010-3333-4444',
    status: 'PENDING',
    requestDate: '2026.03.12',
    message: '가맹점 승인 요청',
  },
];

// 초기 승인된 사용자 데이터
export const initialApprovedUsers: CafeUser[] = [
  {
    id: 'usr_1',
    businessNumber: '111-22-33333',
    cafeName: '투썸플레이스 신촌점',
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
