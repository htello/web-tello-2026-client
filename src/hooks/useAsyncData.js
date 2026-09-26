import { useCallback, useEffect, useState } from 'react'

/**
 * Hook genérico de carga asíncrona con cancelación y recarga.
 *
 * Ejecuta `fetcher` al montar, cada vez que cambia `deps` y al llamar a `reload`.
 * Cancela la petición al desmontar (AbortController) y no actualiza el estado
 * cuando la petición se cancela.
 *
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} fetcher
 * @param {Array<unknown>} [deps] dependencias que disparan una recarga
 * @returns {{ data: T | null, loading: boolean, error: Error | null, reload: () => void }}
 */
export function useAsyncData(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetcher(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setData(result)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(err)
        setLoading(false)
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` es la lista explícita de dependencias
  }, [...deps, reloadKey])

  const reload = useCallback(() => {
    setLoading(true)
    setReloadKey((key) => key + 1)
  }, [])

  return { data, loading, error, reload }
}
