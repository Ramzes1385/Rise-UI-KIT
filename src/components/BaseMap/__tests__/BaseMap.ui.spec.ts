import '@testing-library/jest-dom/vitest'
import BaseMap from '../ui/BaseMap.vue'
import { createUiKitPlugin } from '@/plugin'
import { MAP_PARTS } from '../types/BaseMap.types'
import { fakeYandex } from './providers/fakeYandex'
import { loadScript } from '@utils/dom/scriptUtils'
import { render, waitFor } from '@testing-library/vue'

vi.mock('@utils/dom/scriptUtils', () => ({ loadScript: vi.fn() }))

const motionGlobal = { stubs: { transition: false } }

describe('BaseMap: проп ui', () => {
	afterEach(() => {
		delete (window as unknown as { ymaps3?: unknown }).ymaps3
		vi.mocked(loadScript).mockReset()
	})

	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries(['root', ...MAP_PARTS].map(part => [part, `u-${part}`]))
		const { container } = render(BaseMap, { props: { ui, customClass: { placeholder: 'own-placeholder' } } })
		const root = container.querySelector('.base-map')!
		expect(root).toHaveClass('base-map', 'u-root', 'base-map--no-key')
		for (const part of MAP_PARTS) expect(root.querySelector(`.base-map__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-map__placeholder')).toHaveClass('own-placeholder')
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', () => {
		const { container } = render(BaseMap, {
			props: { ui: { placeholder: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseMap: { ui: { placeholder: 'app', root: 'app-root' } } } })] },
		})
		expect(container.querySelector('.base-map')).toHaveClass('app-root')
		expect(container.querySelector('.base-map__placeholder')).toHaveAttribute('class', 'base-map__placeholder app own')
		expect(container.querySelector('.base-map__canvas')).toHaveAttribute('class', 'base-map__canvas')
	})
})

describe('BaseMap: движение', () => {
	afterEach(() => {
		delete (window as unknown as { ymaps3?: unknown }).ymaps3
		vi.mocked(loadScript).mockReset()
	})

	it('индикатор загрузки уходит переходом base-map-loader, когда карта готова', async () => {
		let resolve!: () => void
		const ready = new Promise<void>(done => (resolve = done))
		vi.mocked(loadScript).mockImplementation(async () => void fakeYandex(ready))
		const { container, emitted } = render(BaseMap, { props: { apiKey: 'KEY' }, global: motionGlobal })
		await waitFor(() => expect(container.querySelector('.base-loader')).toBeInTheDocument())
		const loader = container.querySelector('.base-loader')!
		resolve()
		await waitFor(() => expect(emitted('ready')).toHaveLength(1))
		expect(loader).toHaveClass('base-map-loader-leave-active')
		await waitFor(() => expect(loader).not.toBeInTheDocument())
	})

	it('заглушка ошибки появляется переходом base-map-placeholder', async () => {
		vi.mocked(loadScript).mockRejectedValue(new Error('сеть'))
		const { container, emitted } = render(BaseMap, { props: { apiKey: 'KEY' }, global: motionGlobal })
		await waitFor(() => expect(emitted('error')).toHaveLength(1))
		expect(container.querySelector('.base-map__placeholder')).toHaveClass('base-map-placeholder-enter-active')
	})
})
