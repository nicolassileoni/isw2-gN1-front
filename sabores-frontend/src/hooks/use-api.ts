import { useCallback, useEffect, useState } from 'react';

import { ApiAbortError } from '@/lib/api/client';

export type ApiRequest<T> = (signal: AbortSignal) => Promise<T>;

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

/**
 * `request` must be memoized with `useCallback`, including every value it uses
 * in its dependency list. This keeps fetches explicit and avoids stale data.
 */
export function useApi<T>(request: ApiRequest<T>): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const refetch = useCallback(() => setRequestVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) throw new ApiAbortError();
        setLoading(true);
        setError(null);
        return request(controller.signal);
      })
      .then((response) => setData(response))
      .catch((requestError: unknown) => {
        if (requestError instanceof ApiAbortError || controller.signal.aborted) return;
        setError(requestError instanceof Error ? requestError : new Error('Ocurrió un error inesperado.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [request, requestVersion]);

  return { data, loading, error, refetch };
}
