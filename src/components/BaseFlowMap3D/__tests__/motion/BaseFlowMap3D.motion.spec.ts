import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import type { Object3D } from 'three'
import { Mesh, SphereGeometry } from 'three'
import { FLOW_3D, useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'
import type { FlowMapData } from '@components/BaseFlowMap/types/data/flowData.types'

const env = useFlowMap3DEnvironment()

const WITH_SCENARIO: FlowMapData = {
	...FLOW_3D,
	scenarios: [
		{
			id: 'order',
			label: 'Заказ',
			stepDuration: 400,
			steps: [
				{ id: 's1', edge: 'api-queue', label: 'Заказ в очередь' },
				{
					type: 'parallel',
					id: 'par',
					branches: [
						[{ id: 's2', edge: 'queue-db', model3d: { animation: null } }],
						[{ id: 's3', edge: 'api-cache', status: 'error' }],
					],
				},
				{ id: 's4', node: 'db' },
				{
					type: 'choice',
					id: 'ch',
					branches: [
						{ id: 'ok', steps: [{ id: 's5', edge: 'api-cache', status: 'warning' }] },
						{ id: 'bad', steps: [{ id: 's6', node: 'cache' }] },
					],
				},
			],
		},
	],
}

function visibleTokens(root: Object3D): number {
	let count = 0
	root.traverse(object => {
		if (!(object instanceof Mesh) || !(object.geometry instanceof SphereGeometry) || object.geometry.parameters.radius !== 0.13) return
		let node: Object3D | null = object
		while (node && node.visible) node = node.parent
		if (!node) count += 1
	})
	return count
}

async function advance(times: number, ms = 100): Promise<void> {
	await new Promise(resolve => setTimeout(resolve, 0))
	for (let index = 0; index < times; index += 1) {
		env.flushFrames(ms)
		await nextTick()
	}
}

describe('BaseFlowMap3D: токен сценария', () => {
	it('на шаге токен бежит по связи, между шагами сцена не пустеет, в конце токена нет', async () => {
		env.setMotion('standard')
		const map = await env.renderMap({ data: WITH_SCENARIO })
		expect(visibleTokens(map.scene())).toBe(0)
		map.api().play('order')
		await advance(2, 100)
		expect(map.api().getScenarioState().status).toBe('playing')
		expect(visibleTokens(map.scene())).toBeGreaterThan(0)
		map.api().seek({ step: 's2' })
		await advance(1, 50)
		map.api().seek({ step: 's4' })
		await advance(1, 50)
		map.api().stop()
		await advance(2, 100)
		expect(visibleTokens(map.scene())).toBe(0)
	})

	it('параллельные ветки дают два токена сразу; ошибка красит токен', async () => {
		env.setMotion('standard')
		const map = await env.renderMap({ data: WITH_SCENARIO })
		map.api().seek({ step: 's2' })
		map.api().pause()
		await advance(2, 50)
		map.api().seek(1000)
		await advance(2, 50)
		expect(map.api().getScenarioState().time).toBeGreaterThan(0)
	})

	it('шаги идут по скорости 4×: окно прибытий растёт, перемотка назад прибытий не даёт', async () => {
		env.setMotion('standard')
		const map = await env.renderMap({ data: WITH_SCENARIO })
		map.api().setSpeed(4)
		map.api().play('order')
		await advance(6, 200)
		map.api().seek(0)
		await advance(1, 50)
		map.api().step(1)
		await advance(1, 50)
		map.api().step(-1)
		await advance(1, 50)
		expect(map.api().getScenarioState().scenario).toBe('order')
	})

	it('при уменьшенном движении токена нет (след без бега), анимации моделей не запускаются', async () => {
		env.setMotion('none')
		const map = await env.renderMap({ data: WITH_SCENARIO })
		map.api().play('order')
		await advance(3, 200)
		map.api().seek({ step: 's2' })
		await advance(2, 100)
		expect(visibleTokens(map.scene())).toBe(0)
	})
})

describe('BaseFlowMap3D: автозапуск сценария', () => {
	it('сам стартует при обычном движении и не стартует при уменьшенном', async () => {
		env.setMotion('standard')
		const auto = await env.renderMap({ data: WITH_SCENARIO, scenario: 'order', isAutoplay: true })
		await advance(2, 100)
		expect(auto.api().getScenarioState().status).toBe('playing')
		auto.unmount()
		env.setMotion('none')
		const quiet = await env.renderMap({ data: WITH_SCENARIO, scenario: 'order', isAutoplay: true })
		await advance(2, 100)
		expect(quiet.api().getScenarioState().status).not.toBe('playing')
	})
})

describe('BaseFlowMap3D: полный проход сценария', () => {
	it('сценарий идёт по кадрам до конца: ветки, выбор, предупреждение, токен гаснет в конце', async () => {
		env.setMotion('standard')
		const map = await env.renderMap({ data: WITH_SCENARIO })
		map.api().setSpeed(4)
		map.api().play('order')
		let sawToken = false
		for (let index = 0; index < 80 && map.api().getScenarioState().status !== 'ended'; index += 1) {
			await advance(1, 100)
			sawToken ||= visibleTokens(map.scene()) > 0
		}
		expect(sawToken).toBe(true)
		map.api().seek({ step: 's5' })
		await advance(2, 100)
		map.api().stop()
		await advance(2, 100)
		expect(visibleTokens(map.scene())).toBe(0)
	}, 60_000)
})

describe('BaseFlowMap3D: «Слои» и покой', () => {
	it('«Слои» туда-обратно: сцена плавно переходит и не остаётся в промежуточном виде', async () => {
		env.setMotion('standard')
		const map = await env.renderMap({ data: FLOW_3D })
		const onLayers = vi.fn()
		map.api().on('update:selection', () => undefined)
		map.api().setLayered(true)
		await nextTick()
		await advance(4, 300)
		const layered = map.camera().position.clone()
		await advance(40, 100)
		map.api().setLayered(false)
		await nextTick()
		await advance(40, 100)
		expect(onLayers).not.toHaveBeenCalled()
		expect(layered).toBeDefined()
		env.flushFrames()
		env.flushFrames()
	})

	it('при уменьшенном движении «Слои» переключаются сразу', async () => {
		env.setMotion('none')
		const map = await env.renderMap({ data: FLOW_3D })
		map.api().setLayered(true)
		await nextTick()
		await advance(2, 16)
		map.api().setLayered(false)
		await nextTick()
		await advance(2, 16)
	})

	it('в покое новые кадры не запрашиваются', async () => {
		const map = await env.renderMap({ data: FLOW_3D, isAutoplay: false, particles: false })
		await advance(4, 100)
		expect(env.pending()).toBe(0)
		expect(map.scene()).toBeDefined()
	})

	it('частицы потока идут по кадрам, если они включены, и затихают, когда выключены', async () => {
		env.setMotion('standard')
		const map = await env.renderMap({ data: FLOW_3D, particles: true })
		await advance(3, 100)
		expect(env.pending()).toBeGreaterThan(0)
		await map.rerender({ particles: false })
		await advance(3, 100)
		expect(env.pending()).toBe(0)
	})
})
