// Authentication feature exports
export { AuthProvider } from "./components/AuthProvider";
export { useAuth } from "./hooks/useAuth";
export { clientAuthManager } from "./api/clientAuth";

// Types
export type {
  MiAuthOptions,
  MiAuthResult,
  PeendingAuthType,
} from "./api/clientAuth";
