import { describe, expect, it, vi } from 'vitest'
import { getImageProtectionProps } from './getImageProtectionProps.js'

describe('getImageProtectionProps', () => {
  it('devuelve draggable false y el alt recibido', () => {
    const props = getImageProtectionProps('Una obra')

    expect(props.draggable).toBe(false)
    expect(props.alt).toBe('Una obra')
  })

  it('onContextMenu previene el menú contextual', () => {
    const { onContextMenu } = getImageProtectionProps('Una obra')
    const event = { preventDefault: vi.fn() }

    onContextMenu(event)

    expect(event.preventDefault).toHaveBeenCalledTimes(1)
  })
})
