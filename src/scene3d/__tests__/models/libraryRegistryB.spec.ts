import type { Object3D } from 'three'
import { describe, expect, it, vi } from 'vitest'
import { MODEL3D_LIBRARY } from '../../models/library'
import { MODEL3D_PRESETS } from '../../models/presets'
import { countTriangles } from '../../models/library/parts'
import type { Model3DPresetId } from '../../types/model3d.types'
import { createTestContext, createTestRegistry, node, runFrames } from './modelsTestKit'

const IDS = [
	'user',
	'globe',
	'scales',
	'cloud',
	'bucket',
	'scroll',
	'search',
	'analytics',
	'monitor',
	'clock',
	'mailbox',
	'ai',
	'window',
	'code',
	'gear',
	'layers',
	'flask',
	'book',
	'rocket',
	'shield',
	'flag',
] as const satisfies readonly Model3DPresetId[]

function matrices(object: Object3D): number[] {
	const values: number[] = []
	object.traverse(child => values.push(...child.matrix.elements))
	return values
}

describe('библиотека: регистрация моделей части b', () => {
	it.each(IDS)('«%s» зарегистрирована и строится реестром без запасной модели', async id => {
		const warn = vi.fn()
		const { registry, loop } = createTestRegistry({ warn })
		registry.add(id, { node: node(id, id), model3d: { model: id } })
		registry.commit()
		const handle = registry.getHandle(id)
		expect(MODEL3D_LIBRARY[id]).toBeTypeOf('function')
		expect(handle?.preset).toBe(id)
		const direct = MODEL3D_LIBRARY[id]?.(node(id, id), createTestContext())
		expect(countTriangles(handle?.object as Object3D)).toBe(countTriangles(direct?.object as Object3D))
		const rest = matrices(handle?.object as Object3D)
		const done = handle?.play(MODEL3D_PRESETS[id].animation)
		runFrames(loop, 60)
		await done
		expect(matrices(handle?.object as Object3D)).toEqual(rest)
		registry.dispose()
		expect(warn).not.toHaveBeenCalled()
	})

	it('21 модель части отличается от запасной', () => {
		expect(IDS.every(id => MODEL3D_LIBRARY[id] !== MODEL3D_LIBRARY.server)).toBe(true)
		expect(IDS).toHaveLength(21)
	})
})
