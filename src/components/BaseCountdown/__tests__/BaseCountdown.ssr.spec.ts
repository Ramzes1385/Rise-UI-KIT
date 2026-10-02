import { createSSRApp, h, nextTick } from 'vue'
import BaseCountdown from '../ui/BaseCountdown.vue'
import { renderToString } from 'vue/server-renderer'

const NOW = new Date('2026-10-02T12:00:00Z').getTime()
const TO = NOW + 2 * 60 * 60 * 1000 + 5000

const app = () => createSSRApp({ render: () => h(BaseCountdown, { to: TO, label: 'До старта' }) })

describe('BaseCountdown SSR', () => {
	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('HTML сервера не зависит от часов сервера и рендерится без window и document', async () => {
		vi.stubGlobal('window', undefined)
		vi.stubGlobal('document', undefined)
		vi.useFakeTimers()
		vi.setSystemTime(NOW)
		const first = await renderToString(app())
		vi.setSystemTime(NOW + 1500)
		const second = await renderToString(app())
		expect(second).toBe(first)
		expect(first).toContain('До старта')
		expect(first).toContain('--')
		expect(first).not.toContain('base-countdown--finished')
	})

	it('гидратация без расхождений, после монтирования — настоящее время', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(NOW)
		vi.stubGlobal('window', undefined)
		const html = await renderToString(app())
		vi.unstubAllGlobals()
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		vi.setSystemTime(NOW + 1500)
		const container = document.createElement('div')
		container.innerHTML = html
		document.body.append(container)
		const client = app()
		client.mount(container)
		await nextTick()
		expect(warn.mock.calls.flat().join(' ')).not.toMatch(/[Hh]ydration/)
		expect(error.mock.calls.flat().join(' ')).not.toMatch(/[Hh]ydration/)
		expect(container.querySelector('.base-countdown__spoken')?.textContent).toBe('До старта: 2 часа')
		expect(container.querySelector('.base-countdown__value')?.textContent).toBe('0')
		client.unmount()
		container.remove()
	})
})
