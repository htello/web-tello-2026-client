export function json(data, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  }
}

export const collections = [
  { id: 1, title: 'Serie Azul', description: 'Obras en azul', coverImage: 'https://example.com/azul.jpg', position: 1, isPublished: true, paintingsCount: 1 },
  { id: 2, title: 'Serie Roja', coverImage: 'https://example.com/roja.jpg', position: 2, isPublished: true, paintingsCount: 1 },
]

const paintingsByCollection = {
  1: [{ id: 10, title: 'Atardecer azul', imageUrl: 'https://example.com/p10.jpg', isFeatured: true }],
  2: [{ id: 20, title: 'Rojo apagado', imageUrl: 'https://example.com/p20.jpg', isFeatured: false }],
}

export const exhibitions = [
  { id: 1, title: 'Expo 2023', date: '2023-03-05', location: 'Valencia', description: 'Retrospectiva', position: 1, isPublished: true },
]

export const biography = { id: 1, content: 'Nací en 1970', imageUrl: 'https://example.com/foto.jpg' }

export const designProjects = {
  'imagen-corporativa': [{ id: 1, title: 'Logo', imageUrl: 'https://example.com/logo.jpg', isFeatured: true }],
  'packaging-expositores': [{ id: 2, title: 'Caja', imageUrl: 'https://example.com/caja.jpg', isFeatured: false }],
  carteleria: [],
  editorial: [],
}

export const illustrations = [
  { id: 1, title: 'Ilustración 1', imageUrl: 'https://example.com/i1.jpg', position: 1 },
]

export async function mockApi(page, { biographyStatus = 200, contactStatus = 201 } = {}) {
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    if (url.endsWith('/collections')) {
      return route.fulfill(json({ data: collections }))
    }

    const collectionMatch = url.match(/\/collections\/(\d+)$/)
    if (collectionMatch) {
      const id = Number(collectionMatch[1])
      const collection = collections.find((c) => c.id === id)
      return route.fulfill(json({ data: { ...collection, paintings: paintingsByCollection[id] ?? [] } }))
    }

    if (url.endsWith('/paintings/featured')) {
      return route.fulfill(json({ data: [{ id: 10, title: 'Atardecer azul', imageUrl: 'https://example.com/p10.jpg', isFeatured: true }] }))
    }

    if (url.endsWith('/exhibitions')) {
      return route.fulfill(json({ data: exhibitions }))
    }

    if (url.endsWith('/illustrations')) {
      return route.fulfill(json({ data: illustrations }))
    }

    if (url.endsWith('/biography')) {
      if (biographyStatus === 404) {
        return route.fulfill(json({ error: 'No existe', code: 'NOT_FOUND' }, 404))
      }
      return route.fulfill(json({ data: biography }))
    }

    if (url.includes('/design')) {
      const subcategory = new URL(url).searchParams.get('subcategory')
      return route.fulfill(json({ data: designProjects[subcategory] ?? [] }))
    }

    if (url.endsWith('/contact') && method === 'POST') {
      if (contactStatus === 502) {
        return route.fulfill(json({ error: 'Error de email', code: 'EMAIL_ERROR' }, 502))
      }
      return route.fulfill(json({ data: { ok: true } }, 201))
    }

    return route.fulfill(json({ error: 'No esperado', code: 'INTERNAL_ERROR' }, 500))
  })
}
