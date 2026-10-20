import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/vue'
import { mapData, mountMap, stubFrame } from '../flowUi'

const details = vi.hoisted(() => ({ calls: 0 }))

vi.mock('../../../../model/scenario/useFlowScenario', () => {
	throw new Error('сеть недоступна')
})
vi.mock('../../../../ui/lazy/flowLazyLoaders', async importOriginal => {
	const original = await importOriginal<typeof import('../../../../ui/lazy/flowLazyLoaders')>()
	return {
		...original,
		loadDetails: () => (details.calls++ === 0 ? original.loadDetails() : Promise.reject(new Error('сеть недоступна'))),
	}
})

const idle = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

beforeEach(() => {
	stubFrame(1200)
	details.calls = 0
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
})
