import { describe, expect, it, vi } from 'vitest'

const created = vi.hoisted(() => ({ args: [] as unknown[] }))

vi.mock('three', async importOriginal => {
	const actual = await importOriginal<typeof import('three')>()
	class FakeRenderer {
		constructor(options: unknown) {
			created.args.push(options)
		}
		dispose = vi.fn()
		forceContextLoss = vi.fn()
	}
	return { ...actual, WebGLRenderer: FakeRenderer }
})

const { createModelThumbnails } = await import('../../../models/modelThumbnails')

describe('миниатюры: рендерер по умолчанию', () => {
	it('без createRenderer создаётся WebGLRenderer на холсте с прозрачностью и сглаживанием', () => {
		const canvas = document.createElement('canvas')
		const thumbs = createModelThumbnails({ canvas })
		expect(created.args[0]).toMatchObject({ canvas, alpha: true, antialias: true })
		thumbs.dispose()
	})
})
