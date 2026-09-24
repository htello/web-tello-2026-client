import { useCallback, useEffect, useState } from 'react'
import { api } from '@/services/api.js'

/**
 * Hook de estado público del portfolio.
 * Carga featured paintings, collections, exhibitions y biography en paralelo.
 * La biografía ausente (404) se trata como "sin biografía", no como error.
 *
 * @returns {{
 *   featuredPaintings: Array<object>,
 *   collections: Array<object>,
 *   exhibitions: Array<object>,
 *   biography: object | null,
 *   loading: boolean,
 *   error: Error | null,
 *   refresh: () => void,
 * }}
 */
export function usePortfolio() {
  const [featuredPaintings, setFeaturedPaintings] = useState([])
  const [collections, setCollections] = useState([])
  const [exhibitions, setExhibitions] = useState([])
  const [biography, setBiography] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      try {
        const [featuredRes, collectionsRes, exhibitionsRes, biographyRes] = await Promise.all([
          api.get('/paintings/featured', { signal }),
          api.get('/collections', { signal }),
          api.get('/exhibitions', { signal }),
          api.get('/biography', { signal }).catch((err) => {
            if (err.status === 404 || err.code === 'NOT_FOUND') return { data: null }
            throw err
          }),
        ])

        if (cancelled) return

        setFeaturedPaintings(featuredRes.data ?? [])
        setCollections(collectionsRes.data ?? [])
        setExhibitions(exhibitionsRes.data ?? [])
        setBiography(biographyRes.data ?? null)
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [reloadKey])

  const refresh = useCallback(() => {
    setLoading(true)
    setReloadKey((key) => key + 1)
  }, [])

  return { featuredPaintings, collections, exhibitions, biography, loading, error, refresh }
}
