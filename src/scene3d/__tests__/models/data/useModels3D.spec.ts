import { createApp } from 'vue'
import { describe, expect, it } from 'vitest'
import { SCENE3D_MODELS_KEY, createScene3DModels, defineModel3D, useScene3DModels } from '../../../models/useModels3D'

describe('useModels3D', () => {
	it('createScene3DModels кладёт модели приложения через provide', () => {
		const models = { pay: defineModel3D({ preset: 'terminal', words: ['pay'] }) }
		const app = createApp({})
		app.use(createScene3DModels(models))
		expect(app.runWithContext(() => useScene3DModels())).toBe(models)
		expect(app._context.provides[SCENE3D_MODELS_KEY as symbol]).toBe(models)
	})

	it('без плагина — пустой набор', () => {
		const app = createApp({})
		expect(app.runWithContext(() => useScene3DModels())).toEqual({})
	})

	it('у каждого приложения свои модели', () => {
		const first = createApp({})
		const second = createApp({})
		first.use(createScene3DModels({ a: { preset: 'db' } }))
		second.use(createScene3DModels({ b: { preset: 'bank' } }))
		expect(Object.keys(first.runWithContext(() => useScene3DModels()))).toEqual(['a'])
		expect(Object.keys(second.runWithContext(() => useScene3DModels()))).toEqual(['b'])
	})

	it('defineModel3D возвращает то же определение', () => {
		const definition = { url: 'a.glb' }
		expect(defineModel3D(definition)).toBe(definition)
	})
})
