import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import "vitest";

declare module "vitest" {
  // biome-ignore lint/suspicious/noExplicitAny: Required for Vitest type definitions
  interface Assertion<T = any>
    extends jest.Matchers<void>,
      TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining
    extends jest.Matchers<void>,
      // biome-ignore lint/suspicious/noExplicitAny: Required for TestingLibrary type definitions
      TestingLibraryMatchers<any, void> {}
}
