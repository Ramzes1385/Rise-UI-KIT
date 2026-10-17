import { afterEach, describe, expect, it } from 'vitest'
import { inlineDelta, inlineEnd, inlineKey, inlineStart } from '../play'

describe('inlineKey', () => {
	afterEach(() => document.documentElement.removeAttribute('dir'))

	it('в LTR оставляет клавишу', () => {
		expect(inlineKey('{ArrowRight}')).toBe('{ArrowRight}')
		expect(inlineKey('{ArrowLeft}')).toBe('{ArrowLeft}')
	})

	it('в RTL меняет ← и → местами', () => {
		document.documentElement.setAttribute('dir', 'rtl')

		expect(inlineKey('{ArrowRight}')).toBe('{ArrowLeft}')
		expect(inlineKey('{ArrowLeft}')).toBe('{ArrowRight}')
	})
})

describe('inlineStart и inlineEnd', () => {
	const rect = { left: 10, right: 50 } as DOMRect

	afterEach(() => document.documentElement.removeAttribute('dir'))

	it('в LTR — left и right', () => {
		expect(inlineStart(rect)).toBe(10)
		expect(inlineEnd(rect)).toBe(50)
	})

	it('в RTL — расстояние от правого края', () => {
		document.documentElement.setAttribute('dir', 'rtl')

		expect(inlineStart(rect)).toBe(-50)
		expect(inlineEnd(rect)).toBe(-10)
	})
})

describe('inlineDelta', () => {
	afterEach(() => document.documentElement.removeAttribute('dir'))

	it('в LTR оставляет знак, в RTL меняет его', () => {
		expect(inlineDelta(60)).toBe(60)
		document.documentElement.setAttribute('dir', 'rtl')
		expect(inlineDelta(60)).toBe(-60)
	})
})
