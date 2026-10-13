import '@testing-library/jest-dom/vitest'
import { fakeGoogle } from './fakeGoogle'
import BaseMap from '../../ui/BaseMap.vue'
import { loadScript } from '@utils/dom/scriptUtils'
import type { MapMarker } from '../../types/BaseMap.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

vi.mock('@utils/dom/scriptUtils', () => ({ loadScript: vi.fn() }))

const MARKERS: MapMarker[] = [{ id: 'a', coordinates: { lat: 55.75, lng: 37.61 }, title: 'Офис' }]

describe('BaseMap · Google', () => {
	afterEach(() => {
		delete (window as unknown as { google?: unknown }).google
		vi.mocked(loadScript).mockReset()
	})

	it('заглушка называет поставщика', () => {
		render(BaseMap, { props: { provider: 'google' } })
		expect(screen.getByRole('region')).toHaveTextContent('Для карты (Google Maps) нужен ключ')
	})

	it('Map ID обязателен: без него — заглушка, скрипт не загружается', async () => {
		const { rerender } = render(BaseMap, { props: { provider: 'google', apiKey: 'KEY' } })
		const region = screen.getByRole('region')
		await waitFor(() => expect(region).toHaveClass('base-map--no-map-id'))
		expect(region).toHaveTextContent('Нужен Map ID')
		expect(region).toHaveTextContent('Метки Google Maps работают только со стилем карты')
		expect(loadScript).not.toHaveBeenCalled()

		await rerender({ provider: 'yandex' })
		expect(region).not.toHaveClass('base-map--no-map-id')
	})

	it('загрузка с callback и языком кита, Map ID, метки и события', async () => {
		const google = fakeGoogle()
		vi.mocked(loadScript).mockImplementation(async () => void google.install())
		const { emitted, rerender, unmount } = render(BaseMap, {
			props: { provider: 'google', apiKey: 'G K', mapId: 'style-1', markers: MARKERS, zoom: 11 },
		})
		await waitFor(() => expect(emitted('ready')).toHaveLength(1))

		expect(loadScript).toHaveBeenCalledWith(
			'https://maps.googleapis.com/maps/api/js?key=G%20K&language=ru&libraries=marker&loading=async&callback=__riseGoogleMapsReady',
			{ callbackName: '__riseGoogleMapsReady' },
		)
		expect(google.api.Map.mock.calls[0][1]).toEqual({
			center: { lat: 55.751244, lng: 37.618423 },
			zoom: 11,
			mapId: 'style-1',
			colorScheme: 'LIGHT',
		})
		const office = screen.getByRole('button', { name: 'Офис' })
		expect(office.parentElement).toHaveClass('base-map__anchor', 'base-map__anchor--anchored')
		await fireEvent.click(office)
		expect(emitted('marker-click')).toEqual([[MARKERS[0]]])

		google.emit('idle')
		expect(emitted('update:center')).toBeUndefined()
		google.state.center = { lat: 59.9, lng: 30.3 }
		google.state.zoom = undefined
		google.emit('idle')
		expect(emitted('update:center')).toEqual([[{ lat: 59.9, lng: 30.3 }]])
		expect(emitted('update:zoom')).toBeUndefined()
		google.state.center = undefined
		google.emit('idle')
		google.emit('click', { latLng: { lat: () => 1, lng: () => 2 } })
		google.emit('click', { latLng: null })
		expect(emitted('click')).toEqual([[{ lat: 1, lng: 2 }]])

		await rerender({ zoom: 4 })
		expect(google.map.setZoom).toHaveBeenCalledWith(4)
		expect(google.map.setCenter).toHaveBeenCalledWith({ lat: 55.751244, lng: 37.618423 })
		await rerender({ markers: [] })
		expect(google.markers[0].map).toBeNull()
		unmount()
		expect(google.clearInstanceListeners).toHaveBeenCalledWith(google.map)
	})

	it('API уже загружено: скрипт не грузится, свой Map ID и язык', async () => {
		const google = fakeGoogle()
		google.install()
		const { emitted } = render(BaseMap, { props: { provider: 'google', apiKey: 'KEY', mapId: 'my-style', language: 'en' } })
		await waitFor(() => expect(emitted('ready')).toHaveLength(1))
		expect(loadScript).not.toHaveBeenCalled()
		expect(google.api.Map.mock.calls[0][1]).toMatchObject({ mapId: 'my-style' })
	})
})
