import '@testing-library/jest-dom/vitest'
import { UI_FLOW_MAP } from '@/locales/messages'
import { mapData, mountMap, stubFrame } from '../flowUi'
import { fireEvent, screen, waitFor } from '@testing-library/vue'

const details = vi.hoisted(() => ({ calls: 0 }))
const fail = vi.hoisted(() => ({ kernel: false, review: false, ui: false }))
const broken = () => Promise.reject(new Error('сеть недоступна'))

vi.mock('../../../../model/scenario/useFlowScenario', () => {
	throw new Error('сеть недоступна')
})
vi.mock('../../../../ui/lazy/flowLazyLoaders', async importOriginal => {
	const original = await importOriginal<typeof import('../../../../ui/lazy/flowLazyLoaders')>()
	return {
		...original,
		loadEditKernel: () => (fail.kernel ? broken() : original.loadEditKernel()),
		loadEditUi: () => (fail.ui ? broken() : original.loadEditUi()),
		loadReviewUi: () => (fail.review ? broken() : original.loadReviewUi()),
		loadDetails: () => (details.calls++ === 0 ? original.loadDetails() : Promise.reject(new Error('сеть недоступна'))),
	}
})

const idle = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

beforeEach(() => {
	stubFrame(1200)
	details.calls = 0
	fail.kernel = fail.review = fail.ui = false
})

describe('карта: сбой загрузки частей не ломает просмотр', () => {
	it('код сценария не загрузился: карта на месте, частицы и команды сценария молча остаются в покое', async () => {
		const scenario = { id: 's', label: 'Заказ', steps: [{ id: 'x', edge: 'e1' }] }
		const result = mountMap({ data: mapData({ scenarios: [scenario] }), particles: 400 })
		await idle()
		expect(screen.getByRole('graphics-object', { name: /^Alpha/ })).toBeInTheDocument()
		const controller = (result.emitted() as Record<string, unknown[][]>).ready[0][0] as {
			play: () => void
			getScenarioState: () => { status: string }
		}
		expect(() => controller.play()).not.toThrow()
		await idle(100)
		expect(controller.getScenarioState().status).toBe('idle')
		expect(result.container.querySelector('.base-flow-map__scenario-layer')).toBeNull()
	})

	it('код подробностей не загрузился в простое: карта на месте, ошибки наружу не идут', async () => {
		mountMap({ panels: ['details'] })
		await idle()
		expect(screen.getByRole('graphics-object', { name: /^Alpha/ })).toBeInTheDocument()
		expect(details.calls).toBeGreaterThan(1)
	})

	const PALETTE = '.base-flow-map__edit-palette'
	const PANEL = '.base-flow-map__review-panel'
	const LOAD = { timeout: 15000 }
	const retry = () => screen.getByRole('button', { name: UI_FLOW_MAP.LOAD_RETRY })

	it.each([
		['модель «Правки»', { kernel: true, ui: false }],
		['код интерфейса правки', { kernel: false, ui: true }],
	])('сбой: %s — сообщение с «Повторить», успешный повтор включает «Правку»', async (_name, broke) => {
		Object.assign(fail, broke)
		const { container } = mountMap({ mode: 'edit' })
		const alert = await screen.findByRole('alert', {}, LOAD)
		expect(alert).toHaveTextContent(UI_FLOW_MAP.LOAD_ERROR)
		expect(container.querySelector(PALETTE)).toBeNull()
		fail.kernel = fail.ui = false
		await fireEvent.click(retry())
		await waitFor(() => expect(container.querySelector(PALETTE)).not.toBeNull(), LOAD)
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('сбой «Правок» — сообщение, повтор убирает его и включает панель', async () => {
		fail.review = true
		const { container } = mountMap({ mode: 'review', currentUser: { name: 'Анна' } })
		expect(await screen.findByRole('alert', {}, LOAD)).toHaveTextContent(UI_FLOW_MAP.LOAD_ERROR)
		expect(container.querySelector(PANEL)).toBeNull()
		fail.review = false
		await fireEvent.click(retry())
		await waitFor(() => expect(container.querySelector(PANEL)).not.toBeNull(), LOAD)
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('повторный сбой оставляет сообщение, а в просмотре без сбоев его нет', async () => {
		fail.kernel = true
		mountMap({ mode: 'edit' })
		await screen.findByRole('alert', {}, LOAD)
		await fireEvent.click(retry())
		expect(await screen.findByRole('alert', {}, LOAD)).toBeInTheDocument()
	})

	it('в просмотре сообщения о сбое нет', async () => {
		mountMap()
		await idle(200)
		expect(screen.queryByRole('alert')).toBeNull()
	})
})
