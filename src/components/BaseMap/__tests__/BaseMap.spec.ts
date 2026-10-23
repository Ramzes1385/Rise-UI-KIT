import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import BaseMap from '../ui/BaseMap.vue'
import { fakeYandex } from './providers/fakeYandex'
import { loadScript } from '@utils/dom/scriptUtils'
import type { MapMarker } from '../types/BaseMap.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

vi.mock('@utils/dom/scriptUtils', () => ({ loadScript: vi.fn() }))

const MARKERS: MapMarker[] = [
	{ id: 1, coordinates: { lat: 55.75, lng: 37.61 }, title: 'Офис', color: 'red' },
	{ id: 2, coordinates: { lat: 55.7, lng: 37.5 } },
]

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('BaseMap', () => {
	afterEach(() => {
		delete (window as unknown as { ymaps3?: unknown }).ymaps3
		vi.mocked(loadScript).mockReset()
	})

	it('без ключа — заглушка, скрипт не загружается', () => {
		render(BaseMap)
		const region = screen.getByRole('region', { name: 'Карта' })
		expect(region).toHaveTextContent('Нужен ключ API')
		expect(region).toHaveTextContent('Яндекс Карты')
		expect(region).toHaveStyle({ height: '400px' })
		expect(loadScript).not.toHaveBeenCalled()
	})

	it('своя заглушка в слоте и своё имя области', () => {
		render(BaseMap, {
			props: { ariaLabel: 'Офисы', height: '200px' },
			slots: { placeholder: ({ status }: { status: string }) => h('p', `нет карты: ${status}`) },
		})
		expect(screen.getByRole('region', { name: 'Офисы' })).toHaveTextContent('нет карты: no-key')
	})

	it('с ключом: загрузка скрипта с языком кита, метки-кнопки, события', async () => {
		vi.mocked(loadScript).mockImplementation(async () => void fakeYandex())
		const { emitted } = render(BaseMap, { props: { apiKey: 'K&Y', markers: MARKERS, center: { lat: 55, lng: 37 }, zoom: 9 } })
		await waitFor(() => expect(emitted('ready')).toHaveLength(1))

		expect(loadScript).toHaveBeenCalledWith('https://api-maps.yandex.ru/v3/?apikey=K%26Y&lang=ru_RU')
		const office = screen.getByRole('button', { name: 'Офис' })
		expect(office.style.getPropertyValue('--base-map-marker-color')).toBe('red')
		expect(screen.getByRole('button', { name: 'Метка 2' })).toHaveAttribute('data-label', 'Метка 2')
		await fireEvent.click(office)
		expect(emitted('marker-click')).toEqual([[MARKERS[0]]])
		expect(emitted('click')).toBeUndefined()
	})

	it('перемещение пользователем — update:center и update:zoom; тот же вид не отправляется обратно', async () => {
		const { maps } = fakeYandex()
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'KEY', language: 'en_US' } })
		await waitFor(() => expect(emitted('ready')).toHaveLength(1))
		const [map] = maps
		expect(map.location).toEqual({ center: [37.618423, 55.751244], zoom: 10 })
		expect(loadScript).not.toHaveBeenCalled()

		map.listener().onActionEnd({ location: { center: [30.3, 59.9], zoom: 11 } })
		map.listener().onActionEnd({ location: { center: [30.3, 59.9], zoom: 12 } })
		map.listener().onClick(null, { coordinates: [30, 60] })
		expect(emitted('update:center')).toEqual([[{ lat: 59.9, lng: 30.3 }]])
		expect(emitted('update:zoom')).toEqual([[11], [12]])
		expect(emitted('click')).toEqual([[{ lat: 60, lng: 30 }]])

		await rerender({ center: { lat: 59.9, lng: 30.3 }, zoom: 12 })
		expect(map.setLocation).not.toHaveBeenCalled()
		await rerender({ zoom: 5 })
		expect(map.setLocation).toHaveBeenCalledWith({ center: [30.3, 59.9], zoom: 5 })
	})

	it('новые метки заменяют прежние; размонтирование удаляет карту', async () => {
		const { maps } = fakeYandex()
		const { emitted, rerender, unmount } = render(BaseMap, { props: { apiKey: 'KEY', markers: MARKERS } })
		await waitFor(() => expect(emitted('ready')).toHaveLength(1))
		await rerender({ markers: [MARKERS[1]] })
		expect(maps[0].markers()).toHaveLength(1)
		expect(screen.getAllByRole('button')).toHaveLength(1)
		await rerender({ markers: undefined })
		expect(maps[0].markers()).toHaveLength(0)
		unmount()
		expect(maps[0].destroy).toHaveBeenCalled()
	})

	it('ошибка загрузки — событие error и заглушка ошибки; не Error — приводится к Error', async () => {
		vi.mocked(loadScript).mockRejectedValueOnce(new Error('403')).mockRejectedValueOnce('сеть')
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'BAD' } })
		await waitFor(() => expect(emitted('error')).toHaveLength(1))
		expect((emitted('error')[0] as [Error])[0].message).toBe('403')
		expect(screen.getByRole('region')).toHaveTextContent('Карта не загрузилась')
		expect(screen.getByRole('region')).toHaveTextContent('Проверьте ключ API и доступ к сервису Яндекс Карты')

		await rerender({ apiKey: 'BAD2' })
		await waitFor(() => expect(emitted('error')).toHaveLength(2))
		expect((emitted('error')[1] as [Error])[0].message).toBe('сеть')
	})

	it('пока идёт загрузка — индикатор; смена ключа отбрасывает прежнюю загрузку', async () => {
		let resolveFirst: () => void = () => undefined
		let rejectSecond: (reason: unknown) => void = () => undefined
		vi.mocked(loadScript)
			.mockImplementationOnce(() => new Promise<void>(resolve => (resolveFirst = resolve)))
			.mockImplementationOnce(() => new Promise<void>((_resolve, reject) => (rejectSecond = reject)))
			.mockImplementationOnce(async () => undefined)
		const { maps } = { maps: [] as ReturnType<typeof fakeYandex>['maps'] }
		const { emitted, rerender } = render(BaseMap, { props: { apiKey: 'ONE' } })
		await flush()
		expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true')
		expect(screen.getByRole('status')).toHaveTextContent('Загрузка карты')

		await rerender({ apiKey: 'TWO' })
		const fake = fakeYandex()
		maps.push(...fake.maps)
		resolveFirst()
		await flush()
		expect(fake.maps[0].destroy).toHaveBeenCalled()
		expect(emitted('ready')).toBeUndefined()

		await rerender({ apiKey: 'THREE' })
		rejectSecond(new Error('поздно'))
		await waitFor(() => expect(emitted('ready')).toHaveLength(1))
		expect(emitted('error')).toBeUndefined()
		expect(maps).toHaveLength(0)
	})

	it('варианты и масштаб', () => {
		const { container } = render(BaseMap, { props: { variant: 'ghost', sizeScale: 125, customClass: { root: 'my-map' } } })
		const root = container.querySelector('.base-map') as HTMLElement
		expect(root).toHaveClass('base-map--ghost', 'base-map--no-key', 'my-map')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
	})
})
