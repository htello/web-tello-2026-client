import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { adminApi } from '@/services/adminApi.js'
import { useAdminResource } from './useAdminResource.js'

vi.mock('@/services/adminApi.js', () => ({
  adminApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('useAdminResource', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('carga el listado: loading → success con items', async () => {
    adminApi.list.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }] })
    const { result } = renderHook(() => useAdminResource('collections'))

    expect(result.current.loading).toBe(true)
    expect(result.current.items).toEqual([])

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.items).toEqual([{ id: 1 }, { id: 2 }])
    expect(result.current.error).toBeNull()
    expect(adminApi.list).toHaveBeenCalledWith('collections', expect.objectContaining({}))
  })

  it('expone meta cuando el listado la incluye (users)', async () => {
    const meta = { total: 1, page: 1, limit: 20, pages: 1 }
    adminApi.list.mockResolvedValue({ data: [{ id: 1 }], meta })
    const { result } = renderHook(() => useAdminResource('users'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.meta).toEqual(meta)
  })

  it('expone error cuando el listado falla', async () => {
    const error = Object.assign(new Error('falló'), { status: 500 })
    adminApi.list.mockRejectedValue(error)
    const { result } = renderHook(() => useAdminResource('collections'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe(error)
    expect(result.current.items).toEqual([])
  })

  it('create: isSaving durante la mutación, devuelve ok y recarga el listado', async () => {
    adminApi.list.mockResolvedValue({ data: [] })
    let resolveCreate
    adminApi.create.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve
      }),
    )
    const { result } = renderHook(() => useAdminResource('paintings'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    let mutation
    act(() => {
      mutation = result.current.create({ title: 'Obra' })
    })

    expect(result.current.isSaving).toBe(true)

    await act(async () => {
      resolveCreate({ data: { id: 9 } })
      await mutation
    })

    expect(adminApi.create).toHaveBeenCalledWith('paintings', { title: 'Obra' })
    expect(await mutation).toEqual({ ok: true, data: { id: 9 } })
    expect(result.current.isSaving).toBe(false)
    expect(result.current.saveError).toBeNull()
    await waitFor(() => expect(adminApi.list).toHaveBeenCalledTimes(2))
  })

  it('create: expone saveError y devuelve ok:false cuando falla; no recarga', async () => {
    adminApi.list.mockResolvedValue({ data: [] })
    const error = Object.assign(new Error('Duplicado'), { status: 400, code: 'DUPLICATE_ERROR' })
    adminApi.create.mockRejectedValue(error)
    const { result } = renderHook(() => useAdminResource('paintings'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.create({ title: 'X' })
    })

    expect(outcome).toEqual({ ok: false, error })
    expect(result.current.saveError).toBe(error)
    expect(result.current.isSaving).toBe(false)
    expect(adminApi.list).toHaveBeenCalledTimes(1)
  })

  it('update envía solo los campos modificados (parcial) y recarga', async () => {
    adminApi.list.mockResolvedValue({ data: [{ id: 5, title: 'Viejo' }] })
    adminApi.update.mockResolvedValue({ data: { id: 5, title: 'Nuevo' } })
    const { result } = renderHook(() => useAdminResource('paintings'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.update(5, { title: 'Nuevo' })
    })

    expect(adminApi.update).toHaveBeenCalledWith('paintings', 5, { title: 'Nuevo' })
    expect(outcome).toEqual({ ok: true, data: { id: 5, title: 'Nuevo' } })
    await waitFor(() => expect(adminApi.list).toHaveBeenCalledTimes(2))
  })

  it('remove borra y recarga el listado', async () => {
    adminApi.list.mockResolvedValue({ data: [{ id: 3 }] })
    adminApi.remove.mockResolvedValue(null)
    const { result } = renderHook(() => useAdminResource('collections'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.remove(3)
    })

    expect(adminApi.remove).toHaveBeenCalledWith('collections', 3)
    expect(outcome.ok).toBe(true)
    await waitFor(() => expect(adminApi.list).toHaveBeenCalledTimes(2))
  })

  it('remove expone saveError cuando falla', async () => {
    adminApi.list.mockResolvedValue({ data: [] })
    const error = Object.assign(new Error('No encontrado'), { status: 404, code: 'NOT_FOUND' })
    adminApi.remove.mockRejectedValue(error)
    const { result } = renderHook(() => useAdminResource('collections'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.remove(99)
    })

    expect(outcome).toEqual({ ok: false, error })
    expect(result.current.saveError).toBe(error)
  })

  it('reload vuelve a fetchear el listado', async () => {
    adminApi.list.mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useAdminResource('design'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.reload()
    })

    await waitFor(() => expect(adminApi.list).toHaveBeenCalledTimes(2))
  })
})
