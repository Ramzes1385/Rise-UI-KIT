import { createWebGLRenderer } from '../../model/scene/createRenderer'

const { WebGLRenderer } = vi.hoisted(() => ({
	WebGLRenderer: vi.fn(function (this: Record<string, unknown>, options: unknown) {
		this.options = options
	}),
}))

vi.mock('three', async importOriginal => ({ ...(await importOriginal<typeof import('three')>()), WebGLRenderer }))

describe('createWebGLRenderer', () => {
	it('создаёт WebGLRenderer на холсте карты со сглаживанием и прозрачным фоном', () => {
		const canvas = document.createElement('canvas')
		const renderer = createWebGLRenderer(canvas) as unknown as { options: unknown }
		expect(WebGLRenderer).toHaveBeenCalledOnce()
		expect(renderer.options).toEqual({ canvas, antialias: true, alpha: true })
	})
})
