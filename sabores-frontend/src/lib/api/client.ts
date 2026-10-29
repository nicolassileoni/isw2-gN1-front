import type { ErrorResponse } from './types';

const DEFAULT_API_URL = 'http://localhost:8080';
const REQUEST_TIMEOUT_MS = 12_000;

export const apiBaseUrl = (process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_URL).replace(/\/+$/, '');

export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly detalles: string[] = [],
    mensaje = 'No se pudo completar la solicitud.',
  ) {
    super(mensaje);
    this.name = 'ApiHttpError';
  }
}

export class ApiNetworkError extends Error {
  constructor(mensaje = 'No se pudo conectar con el servidor. Revisá la conexión e intentá nuevamente.') {
    super(mensaje);
    this.name = 'ApiNetworkError';
  }
}

export class ApiTimeoutError extends ApiNetworkError {
  constructor() {
    super('El servidor tardó demasiado en responder. Intentá nuevamente.');
    this.name = 'ApiTimeoutError';
  }
}

export class ApiAbortError extends Error {
  constructor() {
    super('La solicitud fue cancelada.');
    this.name = 'ApiAbortError';
  }
}

type RequestOptions = Omit<RequestInit, 'body' | 'headers' | 'signal'> & {
  body?: unknown;
  signal?: AbortSignal;
};

function isErrorResponse(value: unknown): value is ErrorResponse {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as { mensaje?: unknown; detalles?: unknown };
  return typeof candidate.mensaje === 'string' && Array.isArray(candidate.detalles);
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const cancelRequest = () => controller.abort();

  options.signal?.addEventListener('abort', cancelRequest, { once: true });

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const payload = await parseBody(response);

    if (!response.ok) {
      const error = isErrorResponse(payload) ? payload : null;
      throw new ApiHttpError(response.status, error?.detalles, error?.mensaje);
    }

    return payload as T;
  } catch (error: unknown) {
    if (error instanceof ApiHttpError) throw error;
    if (timedOut) throw new ApiTimeoutError();
    if (options.signal?.aborted) throw new ApiAbortError();
    if (error instanceof Error && error.name === 'AbortError') throw new ApiAbortError();
    throw new ApiNetworkError();
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', cancelRequest);
  }
}

export const apiClient = {
  get: <T>(path: string, signal?: AbortSignal) => apiRequest<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: 'POST', body, signal }),
  put: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: 'PUT', body, signal }),
  patch: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: 'PATCH', body, signal }),
};
