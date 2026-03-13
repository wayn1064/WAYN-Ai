type EventCallback = (payload?: any) => void;

class MockPubSub {
  private events: Record<string, EventCallback[]> = {};

  subscribe(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // 반환 함수: 구독 취소용
    return () => {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    };
  }

  publish(event: string, payload?: any) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(payload));
    }
  }
}

export const mockPubSub = new MockPubSub();
