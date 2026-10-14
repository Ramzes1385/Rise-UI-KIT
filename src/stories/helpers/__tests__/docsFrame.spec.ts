import { resolveColor } from '../play'
import { docsFrame } from '../render/decorators/docsFrame'

describe('docsFrame', () => {
	it('рамка Docs: не inline, высота в пикселях', () => {
		expect(docsFrame(240)).toEqual({ story: { inline: false, height: '240px' } })
	})
})

describe('resolveColor', () => {
	it('возвращает цвет, который отдаёт getComputedStyle, и не оставляет пробу в DOM', () => {
		const result = resolveColor('rgb(1, 2, 3)')
		expect(result).toBe('rgb(1, 2, 3)')
		expect(document.body.querySelectorAll('span')).toHaveLength(0)
	})
})
