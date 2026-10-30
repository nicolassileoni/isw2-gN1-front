type UnauthorizedListener = () => void;

let authToken: string | null = null;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function setAuthToken(token: string | null | undefined): void {
  authToken = token?.trim() || null;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function clearAuthToken(): void {
  authToken = null;
}

export function subscribeToUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);

  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export function emitUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => listener());
}
