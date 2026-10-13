import '@testing-library/jest-dom/vitest'
import BaseMap from '../../ui/BaseMap.vue'
import { render } from '@testing-library/vue'
import type { MapMarker } from '../../types/BaseMap.types'

const jsonLd = (container: Element) => container.querySelector('script[type="application/ld+json"]')

const readJsonLd = (container: Element) => JSON.parse(jsonLd(container)!.textContent!)

const OFFICE: MapMarker = { id: 1, title: 'Офис на Тверской', coordinates: { lat: 55.7648, lng: 37.6055 } }

const WAREHOUSE: MapMarker = { id: 2, coordinates: { lat: 55.6, lng: 37.5 } }

describe('BaseMap SEO', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => warnSpy.mockRestore())

	it('без seo разметки нет', () => {
		const { container } = render(BaseMap, { props: { markers: [OFFICE] } })
		expect(jsonLd(container)).toBeNull()
	})

	it('одна метка — Place с её названием и координатами, адрес из data', () => {
		const address = { '@type': 'PostalAddress', streetAddress: 'Тверская, 7', addressLocality: 'Москва' }
		const { container } = render(BaseMap, { props: { markers: [OFFICE], seo: { data: { address } } } })
		expect(readJsonLd(container)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'Place',
			name: 'Офис на Тверской',
			geo: { '@type': 'GeoCoordinates', latitude: 55.7648, longitude: 37.6055 },
			address,
		})
		expect(warnSpy).not.toHaveBeenCalled()
	})

	it('несколько меток — Place из центра и ariaLabel, метки в containsPlace', () => {
		const { container } = render(BaseMap, {
			props: { ariaLabel: 'Наши адреса', center: { lat: 55.7, lng: 37.6 }, markers: [OFFICE, WAREHOUSE], seo: true },
		})
		const data = readJsonLd(container)
		expect(data).toMatchObject({ '@type': 'Place', name: 'Наши адреса', geo: { latitude: 55.7, longitude: 37.6 } })
		expect(data.containsPlace).toHaveLength(2)
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('containsPlace[].name'))
	})

	it('без меток и центра — только название, без координат; без названия — предупреждение', () => {
		const { container } = render(BaseMap, { props: { seo: true } })
		expect(readJsonLd(container)).toEqual({ '@context': 'https://schema.org', '@type': 'Place' })
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('name'))
	})
})
