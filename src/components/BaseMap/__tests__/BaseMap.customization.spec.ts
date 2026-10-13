import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import BaseMap from '../ui/BaseMap.vue'
import { fakeGoogle } from './providers/fakeGoogle'
import { fakeYandex } from './providers/fakeYandex'
import { loadScript } from '@utils/dom/scriptUtils'
import type { MapMarker } from '../types/BaseMap.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

vi.mock('@utils/dom/scriptUtils', () => ({ loadScript: vi.fn() }))

const MARKERS: MapMarker[] = [
	{ id: 1, coordinates: { lat: 55.75, lng: 37.61 }, title: 'Офис', icon: 'star', size: 40 },
	{ id: 2, coordinates: { lat: 55.7, lng: 37.5 }, title: 'Склад' },
]

const ready = (emitted: (name: string) => unknown[] | undefined) => waitFor(() => expect(emitted('ready')).toHaveLength(1))

function mockDark(initial: boolean) {
	let isDark = initial
	const listeners = new Set<() => void>()
	window.matchMedia = vi.fn().mockImplementation(() => ({
		get matches() {
			return isDark
		},
		addEventListener: (_name: string, handler: () => void) => listeners.add(handler),
		removeEventListener: (_name: string, handler: () => void) => listeners.delete(handler),
	}))
	return (next: boolean) => {
		isDark = next
		listeners.forEach(handler => handler())
	}
}

function cleanWindow(): void {
	const target = window as unknown as { ymaps3?: unknown; google?: unknown }
	delete target.ymaps3
	delete target.google
	document.documentElement.removeAttribute('data-theme')
	vi.mocked(loadScript).mockReset()
}

describe('BaseMap: схема', () => {
	afterEach(cleanWindow)

	it('Яндекс: auto берёт data-theme и переключает слой на месте', async () => {
		document.documentElement.setAttribute('data-theme', 'dark')
		const { maps } = fakeYandex()
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'KEY' } })
		await ready(emitted)
		const layer = maps[0].schemeLayer()
		expect(layer.props).toEqual({ theme: 'dark' })

		document.documentElement.setAttribute('data-theme', 'light')
		await waitFor(() => expect(layer.update).toHaveBeenLastCalledWith({ theme: 'light', customization: [] }))
		await rerender({ scheme: 'dark' })
		expect(layer.update).toHaveBeenLastCalledWith({ theme: 'dark', customization: [] })
		expect(maps).toHaveLength(1)
	})

	it('data-theme="system": схема по prefers-color-scheme и его смене', async () => {
		const change = mockDark(true)
		document.documentElement.setAttribute('data-theme', 'system')
		const { maps } = fakeYandex()
		const { emitted, unmount } = render(BaseMap, { props: { apiKey: 'KEY' } })
		await ready(emitted)
		const layer = maps[0].schemeLayer()
		expect(layer.props).toEqual({ theme: 'dark' })
		change(false)
		await waitFor(() => expect(layer.update).toHaveBeenLastCalledWith({ theme: 'light', customization: [] }))
		unmount()
	})

	it('без matchMedia и data-theme — светлая схема', async () => {
		const original = window.matchMedia
		Object.assign(window, { matchMedia: undefined })
		const { maps } = fakeYandex()
		const { emitted } = render(BaseMap, { props: { apiKey: 'KEY' } })
		await ready(emitted)
		expect(maps[0].schemeLayer().props).toEqual({ theme: 'light' })
		window.matchMedia = original
	})

	it('Google: colorScheme задаётся при создании, смена схемы пересоздаёт карту, пока её нет — ничего', async () => {
		const google = fakeGoogle()
		google.install()
		const { emitted, rerender } = render(BaseMap, { props: { provider: 'google', mapId: 'id', scheme: 'dark' } })
		await rerender({ scheme: 'light' })
		expect(google.api.Map).not.toHaveBeenCalled()
		await rerender({ apiKey: 'KEY' })
		await ready(emitted)
		expect(google.api.Map.mock.calls[0][1]).toMatchObject({ colorScheme: 'LIGHT' })
		await rerender({ scheme: 'dark' })
		await waitFor(() => expect(google.api.Map).toHaveBeenCalledTimes(2))
		expect(google.api.Map.mock.calls[1][1]).toMatchObject({ colorScheme: 'DARK' })
	})
})

describe('BaseMap: метки и балун', () => {
	afterEach(cleanWindow)

	it('значок и размер метки', async () => {
		fakeYandex()
		const { emitted, container, rerender } = render(BaseMap, { props: { apiKey: 'KEY', markers: MARKERS } })
		await ready(emitted)
		const office = screen.getByRole('button', { name: 'Офис' })
		expect(office).toHaveClass('base-map__marker--icon')
		expect(office.querySelector('.base-icon')).toBeInTheDocument()
		expect(office.parentElement?.style.getPropertyValue('--base-map-marker-size')).toBe('40px')
		expect(screen.getByRole('button', { name: 'Склад' }).querySelector('.base-icon')).toBeNull()
		expect(container.querySelectorAll('[aria-haspopup]')).toHaveLength(0)

		await rerender({ markers: [{ ...MARKERS[1] }] })
		expect(screen.getAllByRole('button')).toHaveLength(1)
	})

	it('слот marker получает метку и заменяет пин', async () => {
		fakeYandex()
		const { emitted } = render(BaseMap, {
			props: { apiKey: 'KEY', markers: MARKERS },
			slots: { marker: ({ marker }: { marker: MapMarker }) => h('b', `№${marker.id}`) },
		})
		await ready(emitted)
		const office = screen.getByRole('button', { name: 'Офис' })
		expect(office).toHaveClass('base-map__marker--custom')
		expect(office).not.toHaveClass('base-map__marker--icon')
		expect(office).toHaveTextContent('№1')
		expect(office.querySelector('.base-icon')).toBeNull()
	})

	it('балун: клик открывает, повторный клик и клик по карте закрывают, v-model:selected', async () => {
		const { maps } = fakeYandex()
		const { emitted, rerender } = render(BaseMap, {
			props: { apiKey: 'KEY', markers: MARKERS },
			slots: { balloon: ({ marker }: { marker: MapMarker }) => h('p', `Балун ${marker.title}`) },
		})
		await ready(emitted)
		const office = screen.getByRole('button', { name: 'Офис' })
		expect(office).toHaveAttribute('aria-expanded', 'false')
		expect(office).toHaveAttribute('aria-haspopup', 'dialog')
		expect(office).not.toHaveAttribute('aria-controls')

		await fireEvent.click(office)
		expect(emitted('update:selected')).toEqual([[1]])
		const dialog = await screen.findByRole('dialog', { name: 'Офис' })
		expect(dialog).toHaveTextContent('Балун Офис')
		expect(office).toHaveAttribute('aria-expanded', 'true')
		expect(office).toHaveAttribute('aria-controls', dialog.id)
		expect(office).toHaveClass('base-map__marker--selected')

		await fireEvent.click(dialog)
		expect(screen.getByRole('dialog')).toBeInTheDocument()

		await fireEvent.click(screen.getByRole('button', { name: 'Склад' }))
		await waitFor(() => expect(screen.getByRole('dialog')).toHaveTextContent('Балун Склад'))
		expect(emitted('update:selected')).toEqual([[1], [2]])
		expect(emitted('marker-click')).toHaveLength(2)

		maps[0].listener().onClick(null, { coordinates: [30, 60] })
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		expect(emitted('update:selected')).toEqual([[1], [2], [null]])

		await rerender({ selected: 1 })
		expect(await screen.findByRole('dialog')).toBeInTheDocument()
		await rerender({ selected: undefined })
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await fireEvent.click(office)
		await fireEvent.click(office)
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	})

	it('Esc закрывает балун и возвращает фокус на метку; кнопка close из слота — то же', async () => {
		fakeYandex()
		const { emitted } = render(BaseMap, {
			props: { apiKey: 'KEY', markers: MARKERS, selected: 2 },
			slots: {
				balloon: ({ close }: { close: () => void }) => h('button', { type: 'button', onClick: close }, 'Закрыть'),
			},
		})
		await ready(emitted)
		const warehouse = screen.getByRole('button', { name: 'Склад' })
		expect(await screen.findByRole('dialog', { name: 'Склад' })).toBeInTheDocument()

		await fireEvent.keyDown(screen.getByRole('button', { name: 'Закрыть' }), { key: 'Escape' })
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		expect(warehouse).toHaveFocus()
		expect(emitted('update:selected')).toEqual([[null]])

		await fireEvent.keyDown(warehouse, { key: 'Escape' })
		expect(emitted('update:selected')).toHaveLength(1)

		await fireEvent.click(warehouse)
		await fireEvent.click(await screen.findByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		expect(warehouse).toHaveFocus()
	})

	it('без слота balloon выбор лишь отмечает метку (Google)', async () => {
		const google = fakeGoogle()
		google.install()
		const { emitted, container } = render(BaseMap, {
			props: { provider: 'google', apiKey: 'KEY', mapId: 'id', markers: MARKERS },
		})
		await ready(emitted)
		const office = screen.getByRole('button', { name: 'Офис' })
		await fireEvent.click(office)
		expect(office).toHaveClass('base-map__marker--selected')
		expect(office).not.toHaveAttribute('aria-expanded')
		expect(container.querySelector('[role="dialog"]')).toBeNull()
	})

	it('ui.balloon добавляется к классу балуна', async () => {
		fakeYandex()
		const { emitted } = render(BaseMap, {
			props: { apiKey: 'KEY', markers: MARKERS, selected: 1, ui: { balloon: 'u-balloon' } },
			slots: { balloon: () => h('i', 'текст') },
		})
		await ready(emitted)
		expect(await screen.findByRole('dialog')).toHaveClass('base-map__balloon', 'u-balloon')
	})
})

describe('BaseMap: доступность балуна и групп', () => {
	afterEach(cleanWindow)

	const BALLOON = { balloon: ({ marker }: { marker: MapMarker }) => h('p', `Балун ${marker.title}`) }
	const CLUSTERED: MapMarker[] = [
		{ id: 'a', coordinates: { lat: 55.75, lng: 37.61 }, title: 'А' },
		{ id: 'b', coordinates: { lat: 55.7501, lng: 37.6101 }, title: 'Б' },
		{ id: 'far', coordinates: { lat: 59.93, lng: 30.33 }, title: 'Питер' },
	]

	it('кнопка группы без балуна: без aria-haspopup и aria-expanded, у обычной метки они есть', async () => {
		fakeYandex()
		const { emitted } = render(BaseMap, {
			props: { apiKey: 'KEY', markers: CLUSTERED, isClustered: true, zoom: 10 },
			slots: BALLOON,
		})
		await ready(emitted)
		const group = screen.getByRole('button', { name: 'Группа меток, всего 2' })
		expect(group).not.toHaveAttribute('aria-haspopup')
		expect(group).not.toHaveAttribute('aria-expanded')
		expect(screen.getByRole('button', { name: 'Питер' })).toHaveAttribute('aria-haspopup', 'dialog')
	})

	it('Esc внутри балуна закрывает только его: событие не всплывает дальше (окно-родитель остаётся)', async () => {
		fakeYandex()
		const outer = vi.fn()
		document.addEventListener('keydown', outer)
		const { emitted } = render(BaseMap, { props: { apiKey: 'KEY', markers: MARKERS, selected: 2 }, slots: BALLOON })
		await ready(emitted)
		await screen.findByRole('dialog', { name: 'Склад' })

		await fireEvent.keyDown(screen.getByRole('button', { name: 'Склад' }), { key: 'Escape' })
		expect(emitted('update:selected')).toEqual([[null]])
		expect(outer).not.toHaveBeenCalled()

		await fireEvent.keyDown(screen.getByRole('button', { name: 'Склад' }), { key: 'Escape' })
		expect(outer).toHaveBeenCalledTimes(1)
		document.removeEventListener('keydown', outer)
	})

	it('выбранная метка, исчезнувшая из набора (кластеризация, смена markers), сбрасывает выбор', async () => {
		fakeYandex()
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'KEY', markers: MARKERS, selected: 1 }, slots: BALLOON })
		await ready(emitted)
		await screen.findByRole('dialog', { name: 'Офис' })

		await rerender({ markers: [MARKERS[1]] })
		await waitFor(() => expect(emitted('update:selected')).toEqual([[null]]))
	})

	it('Google: метка не получает title — имя даёт только кнопка внутри (без двойной озвучки)', async () => {
		const google = fakeGoogle()
		google.install()
		const { emitted } = render(BaseMap, { props: { provider: 'google', apiKey: 'KEY', mapId: 'id', markers: MARKERS } })
		await ready(emitted)
		expect(google.markers).toHaveLength(2)
		expect(google.markers.every(marker => marker.title === undefined)).toBe(true)
	})
})
