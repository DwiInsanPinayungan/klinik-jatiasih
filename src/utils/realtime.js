// Realtime Manager Utility (SSE + BroadcastChannel + Smart Sync)

const CHANNEL_NAME = 'klinik_jatiasih_realtime';

class RealtimeManager {
  constructor() {
    this.listeners = new Set();
    this.lastTimestamp = Date.now();
    this.eventSource = null;
    this.channel = null;
    this.pollingInterval = null;

    this.initChannel();
    this.initEventSource();
    this.initSmartPolling();
  }

  // Multi-tab instant sync via BroadcastChannel
  initChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === 'DATA_CHANGED') {
            this.notifyListeners(event.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }
  }

  // Server-Sent Events (SSE) Stream
  initEventSource() {
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        this.eventSource = new EventSource('/api/realtime/stream');

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type === 'DATA_CHANGED') {
              this.notifyListeners(data);
            }
          } catch (err) {
            // Ignore parse errors
          }
        };

        this.eventSource.onerror = () => {
          // EventSource automatically retries on disconnect
        };
      } catch (err) {
        console.warn('EventSource error:', err);
      }
    }
  }

  // Smart polling fallback (Ideal for Vercel Serverless)
  initSmartPolling() {
    if (typeof window !== 'undefined') {
      this.pollingInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/realtime/status');
          const data = await res.json();
          if (data && data.success && data.lastUpdate > this.lastTimestamp) {
            this.lastTimestamp = data.lastUpdate;
            this.notifyListeners({ type: 'DATA_CHANGED', action: 'SMART_POLL' });
          }
        } catch (err) {
          // Ignore network errors during polling
        }
      }, 4000);
    }
  }

  // Broadcast data change locally and across tabs
  emitChange(action = 'MUTATION', payload = {}) {
    const eventData = { type: 'DATA_CHANGED', action, payload, timestamp: Date.now() };
    this.lastTimestamp = eventData.timestamp;

    if (this.channel) {
      this.channel.postMessage(eventData);
    }

    this.notifyListeners(eventData);
  }

  // Subscribe to changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error('Realtime listener error:', err);
      }
    });
  }
}

export const realtime = new RealtimeManager();
