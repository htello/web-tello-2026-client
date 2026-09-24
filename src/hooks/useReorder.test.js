import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { adminApi } from '@/services/adminApi.js'
import { useReorder } from './useReorder.js'

vi.mock('@/services/adminApi.js', () => ({
  adminApi: {
    reorder: vi.fn(),
  },
}))

const INITIAL = [
  { id: 1, title: 'A' },
  { id: 2, title: 'B' },
  { id: 3, title: 'C' },
]

describe('useReorder', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('expone los items iniciales y los sincroniza cuando cambian las props', async () => {
    const { result, rerender } = renderHook(({ items }) => useReorder('collections', items), {
      initialProps: { items: INITIAL },
    })

    expect(result.current.items).toEqual(INITIAL)

    const next = [{ id: 4, title: 'D' }]
    rerender({ items: next })

    expect(result.current.items).toEqual(next)
  })

  it('moveUp intercambia con el anterior y persiste SOLO orderedIds', async () => {
    adminApi.reorder.mockResolvedValue({ data: null })
    const { result } = renderHook(() => useReorder('paintings', INITIAL))

    await act(async () => {
      result.current.moveUp(1)
    })

    expect(result.current.items.map((item) => item.id)).toEqual([2, 1, 3])
    expect(adminApi.reorder).toHaveBeenCalledWith('paintings', [2, 1, 3])
  })

  it('moveDown intercambia con el siguiente y persiste', async () => {
    adminApi.reorder.mockResolvedValue({ data: null })
    const { result } = renderHook(() => useReorder('illustrations', INITIAL))

    await act(async () => {
      result.current.moveDown(0)
    })

    expect(result.current.items.map((item) => item.id)).toEqual([2, 1, 3])
    expect(adminApi.reorder).toHaveBeenCalledWith('illustrations', [2, 1, 3])
  })

  it('moveUp en la primera posición no hace nada', async () => {
    const { result } = renderHook(() => useReorder('collections', INITIAL))

    await act(async () => {
      result.current.moveUp(0)
    })

    expect(result.current.items).toEqual(INITIAL)
    expect(adminApi.reorder).not.toHaveBeenCalled()
  })

  it('moveDown en la última posición no hace nada', async () => {
    const { result } = renderHook(() => useReorder('collections', INITIAL))

    await act(async () => {
      result.current.moveDown(2)
    })

    expect(result.current.items).toEqual(INITIAL)
    expect(adminApi.reorder).not.toHaveBeenCalled()
  })

  it('ignora índices fuera de rango', async () => {
    const { result } = renderHook(() => useReorder('collections', INITIAL))

    await act(async () => {
      result.current.moveUp(-1)
      result.current.moveUp(5)
      result.current.moveDown(-1)
      result.current.moveDown(5)
    })

    expect(result.current.items).toEqual(INITIAL)
    expect(adminApi.reorder).not.toHaveBeenCalled()
  })

  it('marca isSaving mientras persiste el reorder', async () => {
    let resolveReorder
    adminApi.reorder.mockReturnValue(
      new Promise((resolve) => {
        resolveReorder = resolve
      }),
    )
    const { result } = renderHook(() => useReorder('collections', INITIAL))

    act(() => {
      result.current.moveUp(1)
    })

    expect(result.current.isSaving).toBe(true)

    await act(async () => {
      resolveReorder({ data: null })
    })

    expect(result.current.isSaving).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('en error 400 (IDs inexistentes) expone el error y revierte el orden local', async () => {
    const error = Object.assign(new Error('Algunos IDs no existen'), {
      status: 400,
      code: 'VALIDATION_ERROR',
    })
    adminApi.reorder.mockRejectedValue(error)
    const { result } = renderHook(() => useReorder('collections', INITIAL))

    await act(async () => {
      result.current.moveUp(1)
    })

    expect(result.current.error).toBe(error)
    expect(result.current.items).toEqual(INITIAL)
    expect(result.current.isSaving).toBe(false)
  })

  it('limpia el error al reintentar un movimiento', async () => {
    const error = Object.assign(new Error('boom'), { status: 400 })
    adminApi.reorder.mockRejectedValueOnce(error)
    const { result } = renderHook(() => useReorder('collections', INITIAL))

    await act(async () => {
      result.current.moveUp(1)
    })
    expect(result.current.error).toBe(error)

    adminApi.reorder.mockResolvedValueOnce({ data: null })
    await act(async () => {
      result.current.moveDown(1)
    })

    expect(result.current.error).toBeNull()
  })

  it('no falla al desmontar mientras persiste', async () => {
    let resolveReorder
    adminApi.reorder.mockReturnValue(
      new Promise((resolve) => {
        resolveReorder = resolve
      }),
    )
    const { result, unmount } = renderHook(() => useReorder('collections', INITIAL))

    act(() => {
      result.current.moveUp(1)
    })

    unmount()

    await act(async () => {
      resolveReorder({ data: null })
      await Promise.resolve()
    })

    await waitFor(() => expect(adminApi.reorder).toHaveBeenCalledTimes(1))
  })
})
