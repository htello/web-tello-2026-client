import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { useAsyncData } from './useAsyncData.js'

describe('useAsyncData', () => {
  afterEach(() => {
    cleanup()
  })

  it('carga los datos y gestiona el estado loading', async () => {
    const fetcher = vi.fn(() => Promise.resolve('datos'))
    const { result } = renderHook(() => useAsyncData(fetcher))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBe('datos')
    expect(result.current.error).toBeNull()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('expone error cuando el fetcher falla', async () => {
    const error = new Error('fallo')
    const fetcher = vi.fn(() => Promise.reject(error))
    const { result } = renderHook(() => useAsyncData(fetcher))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe(error)
  })

  it('recarga al llamar a reload', async () => {
    const fetcher = vi.fn(() => Promise.resolve('datos'))
    const { result } = renderHook(() => useAsyncData(fetcher))

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.reload()
    })

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  })

  it('vuelve a ejecutar cuando cambian las dependencias', async () => {
    const fetcher = vi.fn(() => Promise.resolve('datos'))
    const { result, rerender } = renderHook(({ id }) => useAsyncData(fetcher, [id]), {
      initialProps: { id: 1 },
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetcher).toHaveBeenCalledTimes(1)

    rerender({ id: 2 })

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
  })

  it('no actualiza el estado si se desmonta antes de resolver', async () => {
    let resolveFn
    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        }),
    )
    const { unmount } = renderHook(() => useAsyncData(fetcher))

    unmount()
    resolveFn('tarde')
    await Promise.resolve()

    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
