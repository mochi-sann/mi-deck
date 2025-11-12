class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const createStorage = (): Storage => new MemoryStorage();

const ensureStorage = (property: "localStorage" | "sessionStorage") => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, property);

  if (!descriptor || (descriptor.configurable && descriptor.writable)) {
    Object.defineProperty(globalThis, property, {
      value: createStorage(),
      configurable: true,
      enumerable: false,
      writable: true,
    });
    return;
  }

  // Fallback: some environments expose a non-configurable getter.
  try {
    (globalThis as Record<typeof property, Storage>)[property] =
      createStorage();
  } catch {
    // Silent fallback so tests can proceed without crashing.
  }
};

ensureStorage("localStorage");
ensureStorage("sessionStorage");

export {}; // Treat as a module.
