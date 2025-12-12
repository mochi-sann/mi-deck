export const APIClient = class {
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
};
