export const api = {
  // biome-ignore lint/style/useNamingConvention: ignore
  APIClient: class MisskeyApiClient {
    origin: string;
    credential?: string;
    constructor(opts: { origin: string; credential?: string }) {
      this.origin = opts.origin;
      this.credential = opts.credential;
    }
    async request(
      _endpoint: string,
      _body?: unknown,
    ): Promise<Record<string, unknown>> {
      return {};
    }
  },
};

// Provide a stable permissions array for tests
export const permissions = [
  "read:account",
  "write:notes",
  "read:notifications",
];

// Minimal Stream mock (not used by all tests, but available)
export class Stream {
  origin: string;
  token?: string;
  private listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  constructor(origin: string, opts?: { token?: string }) {
    this.origin = origin;
    this.token = opts?.token;
  }
  useChannel(_name: string) {
    return {
      on: (event: string, cb: (...args: unknown[]) => void) => {
        this.on(event, cb);
      },
      dispose: () => {},
    };
  }
  on(event: string, cb: (...args: unknown[]) => void) {
    this.listeners[event] ||= [];
    this.listeners[event].push(cb);
  }
  emit(event: string, ...args: unknown[]) {
    (this.listeners[event] || []).forEach((cb) => cb(...args));
  }
  close() {
    this.listeners = {};
  }
}
