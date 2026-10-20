import { InstancedMesh } from 'three'
import { describe, expect, it } from 'vitest'
import { buildShape } from '../../models/library/shape'
import { MODEL3D_PRESET_IDS } from '../../types/model3d.types'
import { buildServer } from '../../models/library/services/server'
import { MODEL3D_SHAPES } from '../../types/internal/model3dInternal.types'
import { createTestContext, createTestRegistry, node } from './modelsTestKit'
import { MODEL3D_TRIANGLE_BUDGET, countTriangles } from '../../models/library/parts'

describe('бюджет детализации запасных моделей', () => {
	it('server укладывается в 1200 треугольников', () => {
		expect(countTriangles(buildServer(node('a', 'Сервис'), createTestContext()).object)).toBeLessThanOrEqual(
			MODEL3D_TRIANGLE_BUDGET.server,
		)
	})

	it.each(MODEL3D_SHAPES)('shape «%s» укладывается в 2500 треугольников', name => {
		const instance = buildShape({ ...node('a', 'Задача'), source: { shape: name } }, createTestContext())
		expect(countTriangles(instance.object)).toBeLessThanOrEqual(MODEL3D_TRIANGLE_BUDGET.model)
	})
})

describe('реестр строит любой узел без библиотеки', () => {
	it('запасные модели на месте каждого id таблицы', () => {
		const { registry } = createTestRegistry()
		MODEL3D_PRESET_IDS.forEach(id => registry.add(id, { node: node(id, id), model3d: { model: id } }))
		registry.commit()
		expect(registry.getHandles()).toHaveLength(MODEL3D_PRESET_IDS.length)
		registry.getHandles().forEach(handle => expect(handle.object.children[0].children.length).toBeGreaterThan(0))
		registry.dispose()
	})

	it('восемь узлов одной модели рисуются инстансингом, семь — отдельными мешами', () => {
		const eight = createTestRegistry()
		const seven = createTestRegistry()
		for (let index = 0; index < 8; index += 1) eight.registry.add(`n${index}`, { node: node(`n${index}`, 'x'), kindModel: 'server' })
		for (let index = 0; index < 7; index += 1) seven.registry.add(`n${index}`, { node: node(`n${index}`, 'x'), kindModel: 'server' })
		eight.registry.commit()
		seven.registry.commit()
		expect(eight.registry.object.children.every(child => child instanceof InstancedMesh)).toBe(true)
		expect(eight.registry.object.children.length).toBeGreaterThan(0)
		expect(seven.registry.object.children).toHaveLength(0)
	})
})
