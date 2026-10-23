import '@testing-library/jest-dom/vitest'
import BaseMap from '../ui/BaseMap.vue'
import { fakeYandex } from './providers/fakeYandex'
import { loadScript } from '@utils/dom/scriptUtils'
import { render, waitFor } from '@testing-library/vue'
import type { MapCoordinates } from '../types/BaseMap.types'

vi.mock('@utils/dom/scriptUtils', () => ({ loadScript: vi.fn() }))

const ROUTE: MapCoordinates[] = [
	{ lat: 55.75, lng: 37.61 },
	{ lat: 55.7, lng: 37.5 },
]

const ready = (emitted: (name: string) => unknown[] | undefined) => waitFor(() => expect(emitted('ready')).toHaveLength(1))

function mockCanvas(pixel: number[]) {
	const context = { clearRect: vi.fn(), fillRect: vi.fn(), getImageData: () => ({ data: Uint8ClampedArray.from(pixel) }), fillStyle: '' }
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
	return context
}

function mockTokenColor(read: () => string): void {
	const original = window.getComputedStyle
	vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
		const style = original(element)
		return { ...style, color: (element as HTMLElement).style.color.includes('var(') ? read() : style.color } as CSSStyleDeclaration
	})
}

const strokeOf = (maps: ReturnType<typeof fakeYandex>['maps']): unknown => maps[0].features()[0]!.props

describe('BaseMap: цвета фигур', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		document.documentElement.removeAttribute('data-rise-theme')
		document.documentElement.removeAttribute('data-theme')
		const target = window as unknown as { ymaps3?: unknown }
		delete target.ymaps3
		vi.mocked(loadScript).mockReset()
	})

	it('токен в oklch() приводится к hex до передачи поставщику', async () => {
		mockTokenColor(() => 'oklch(0.62 0.19 259)')
		mockCanvas([59, 130, 246, 255])
		const { maps } = fakeYandex()
		const { emitted } = render(BaseMap, {
			props: { apiKey: 'KEY', polylines: [{ id: 1, coordinates: ROUTE, color: 'var(--rise-primary)' }] },
		})
		await ready(emitted)

		expect(strokeOf(maps)).toMatchObject({ style: { stroke: [{ color: '#3b82f6' }] } })
	})

	it('цвет oklch() без токена тоже нормализуется, а обычный hex остаётся как есть', async () => {
		mockCanvas([1, 2, 3, 255])
		const { maps } = fakeYandex()
		const { emitted } = render(BaseMap, {
			props: {
				apiKey: 'KEY',
				polylines: [{ id: 1, coordinates: ROUTE, color: 'oklch(0.2 0.1 100)' }],
				polygons: [{ id: 2, coordinates: ROUTE, color: '#abcdef' }],
			},
		})
		await ready(emitted)

		expect(strokeOf(maps)).toMatchObject({ style: { stroke: [{ color: '#010203' }] } })
		expect(maps[0].features()[1]!.props).toMatchObject({ style: { stroke: [{ color: '#abcdef' }] } })
	})

	it('если canvas недоступен, остаётся исходная запись цвета', async () => {
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
		const { maps } = fakeYandex()
		const { emitted } = render(BaseMap, {
			props: { apiKey: 'KEY', polylines: [{ id: 1, coordinates: ROUTE, color: 'oklch(0.2 0.1 100)' }] },
		})
		await ready(emitted)

		expect(strokeOf(maps)).toMatchObject({ style: { stroke: [{ color: 'oklch(0.2 0.1 100)' }] } })
	})

	it('смена data-rise-theme при фиксированной scheme пересчитывает цвет токена', async () => {
		let color = 'rgb(1, 1, 1)'
		mockTokenColor(() => color)
		const { maps } = fakeYandex()
		const { emitted } = render(BaseMap, {
			props: { apiKey: 'KEY', scheme: 'light', polylines: [{ id: 1, coordinates: ROUTE, color: 'var(--rise-primary)' }] },
		})
		await ready(emitted)
		expect(strokeOf(maps)).toMatchObject({ style: { stroke: [{ color: 'rgb(1, 1, 1)' }] } })

		color = 'rgb(9, 9, 9)'
		document.documentElement.setAttribute('data-rise-theme', 'dark')
		await waitFor(() => expect(strokeOf(maps)).toMatchObject({ style: { stroke: [{ color: 'rgb(9, 9, 9)' }] } }))
	})

	it('смена системной темы тоже пересчитывает цвет, слушатели снимаются при размонтировании', async () => {
		let color = 'rgb(1, 1, 1)'
		mockTokenColor(() => color)
		const listeners = new Set<() => void>()
		window.matchMedia = vi.fn().mockImplementation(() => ({
			matches: false,
			addEventListener: (_name: string, handler: () => void) => listeners.add(handler),
			removeEventListener: (_name: string, handler: () => void) => listeners.delete(handler),
		}))
		const { maps } = fakeYandex()
		const { emitted, unmount } = render(BaseMap, {
			props: { apiKey: 'KEY', scheme: 'light', polylines: [{ id: 1, coordinates: ROUTE, color: 'var(--rise-primary)' }] },
		})
		await ready(emitted)

		color = 'rgb(7, 7, 7)'
		listeners.forEach(handler => handler())
		await waitFor(() => expect(strokeOf(maps)).toMatchObject({ style: { stroke: [{ color: 'rgb(7, 7, 7)' }] } }))

		unmount()
		expect(listeners.size).toBe(0)
	})
})
