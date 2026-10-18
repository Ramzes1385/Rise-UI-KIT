import { mockWebGL } from '../imageMap3d.test-utils'
import { hasWebGL } from '@/scene3d/renderer/webglSupport'

describe('hasWebGL', () => {
	it('true, если холст даёт контекст webgl2, и сразу отпускает контекст', () => {
		const { loseContext } = mockWebGL(true)
		expect(hasWebGL()).toBe(true)
		expect(loseContext).toHaveBeenCalledOnce()
	})

	it('пробует webgl, когда webgl2 нет', () => {
		const getContext = vi
			.spyOn(HTMLCanvasElement.prototype, 'getContext')
			.mockImplementation(((type: string) => (type === 'webgl' ? { getExtension: () => null } : null)) as never)
		expect(hasWebGL(document)).toBe(true)
		expect(getContext.mock.calls.map(call => call[0])).toEqual(['webgl2', 'webgl'])
	})

	it('false без контекста и при ошибке getContext', () => {
		mockWebGL(false)
		expect(hasWebGL()).toBe(false)
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
			throw new Error('blocked')
		})
		expect(hasWebGL()).toBe(false)
	})

	it('false, когда getContext ничего не вернул (jsdom)', () => {
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(undefined as never)
		expect(hasWebGL()).toBe(false)
	})
})
