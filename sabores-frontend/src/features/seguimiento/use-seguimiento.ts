import { useCallback, useEffect, useState } from 'react';

import { ApiAbortError, apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { SeguimientoResponse } from '@/lib/api/types';
import { normalizeTrackingCode } from '@/lib/format';

export const CODIGO_SEGUIMIENTO_LENGTH = 8;

/**
 * Consulta pública de un pedido por código. A diferencia de `useApi`, la petición
 * no sale al montar: espera a que la persona escriba un código y lo busque.
 */
export function useSeguimiento() {
  const [codigo, setCodigo] = useState('');
  const [version, setVersion] = useState(0);
  const [data, setData] = useState<SeguimientoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const buscar = useCallback((value: string) => {
    const normalizado = normalizeTrackingCode(value);
    if (!normalizado) return;

    setCodigo(normalizado);
    setData(null);
    setError(null);
    setLoading(true);
    setVersion((current) => current + 1);
  }, []);

  const reintentar = useCallback(() => {
    if (!codigo) return;

    setError(null);
    setLoading(true);
    setVersion((current) => current + 1);
  }, [codigo]);

  const limpiar = useCallback(() => {
    setCodigo('');
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!codigo) return;

    const controller = new AbortController();

    void Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) throw new ApiAbortError();
        setLoading(true);
        setError(null);
        setData(null);
        return apiClient.get<SeguimientoResponse>(
          apiRoutes.pedidos.seguimiento(codigo),
          controller.signal,
        );
      })
      .then((response) => {
        if (!controller.signal.aborted) setData(response);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof ApiAbortError || controller.signal.aborted) return;
        setError(
          requestError instanceof Error
            ? requestError
            : new Error('Ocurrió un error inesperado.'),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [codigo, version]);

  return { codigo, data, loading, error, buscar, reintentar, limpiar };
}
