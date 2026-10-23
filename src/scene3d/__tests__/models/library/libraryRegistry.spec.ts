import { describe, expect, it } from 'vitest'
import { MODEL3D_LIBRARY } from '../../../models/library'
import { MODEL3D_PRESETS } from '../../../models/presets'
import { createTestRegistry, node, runFrames } from '../modelsTestKit'

const IDS = ['laptop', 'phone', 'gateway', 'lock', 'cart', 'rack', 'terminal', 'bank', 'bell', 'ram', 'db', 'conveyor'] as const

describe('модели части a в библиотеке и в реестре', () => {
	it('зарегистрированы под своими id', () => {
		IDS.forEach(id => expect(MODEL3D_LIBRARY[id], id).toBeTypeOf('function'))
	})

	it.each(IDS)('«%s» строится реестром своей фабрикой, а не запасной', id => {
		const { registry } = createTestRegistry()
		registry.add(id, { node: node(id, id), model3d: { model: id } })
		registry.commit()
		const handle = registry.getHandle(id)
		expect(handle?.preset).toBe(id)
		expect(handle?.object.children.length).toBeGreaterThan(0)
		registry.dispose()
	})

	it.each(IDS)('«%s»: анимация пресета проигрывается до конца', async id => {
		const { registry, loop } = createTestRegistry()
		registry.add(id, { node: node(id, id), model3d: { model: id } })
		registry.commit()
		const done = registry.getHandle(id)?.play(MODEL3D_PRESETS[id].animation, { duration: 300 })
		runFrames(loop, 8)
		await expect(done).resolves.toBeUndefined()
		expect(loop.tickers.size).toBe(0)
		registry.dispose()
	})
})
