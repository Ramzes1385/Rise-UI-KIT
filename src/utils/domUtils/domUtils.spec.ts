/**
 * Unit-тесты для domUtils.
 * Покрывают: toHTMLElement, toHTMLInputElement, toHTMLTextAreaElement, getActiveElement.
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import {
	getActiveElement,
	toHTMLElement,
	toHTMLInputElement,
	toHTMLTextAreaElement,
} from './domUtils'

describe('domUtils', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('toHTMLElement', () => {
		it('возвращает HTMLElement если target является HTMLElement', () => {
			const div = document.createElement('div')
			expect(toHTMLElement(div)).toBe(div)
		})

		it('возвращает null для null', () => {
			expect(toHTMLElement(null)).toBeNull()
		})

		it('возвращает null для объекта, не являющегося HTMLElement', () => {
			expect(toHTMLElement(new EventTarget())).toBeNull()
		})
	})

	describe('toHTMLInputElement', () => {
		it('возвращает HTMLInputElement если target является HTMLInputElement', () => {
			const input = document.createElement('input')
			expect(toHTMLInputElement(input)).toBe(input)
		})

		it('возвращает null для null', () => {
			expect(toHTMLInputElement(null)).toBeNull()
		})

		it('возвращает null для HTMLElement (не Input)', () => {
			const div = document.createElement('div')
			expect(toHTMLInputElement(div)).toBeNull()
		})
	})

	describe('toHTMLTextAreaElement', () => {
		it('возвращает HTMLTextAreaElement если target является HTMLTextAreaElement', () => {
			const textarea = document.createElement('textarea')
			expect(toHTMLTextAreaElement(textarea)).toBe(textarea)
		})

		it('возвращает null для null', () => {
			expect(toHTMLTextAreaElement(null)).toBeNull()
		})

		it('возвращает null для HTMLElement (не Textarea)', () => {
			const div = document.createElement('div')
			expect(toHTMLTextAreaElement(div)).toBeNull()
		})
	})

	describe('getActiveElement', () => {
		it('возвращает HTMLElement если activeElement является HTMLElement', () => {
			const div = document.createElement('div')
			document.body.appendChild(div)
			div.focus()
			const result = getActiveElement()
			expect(result).toBeInstanceOf(HTMLElement)
			document.body.removeChild(div)
		})

		it('возвращает body как activeElement по умолчанию', () => {
			document.body.focus()
			const result = getActiveElement()
			expect(result).toBe(document.body)
		})

		it('возвращает null если activeElement не является HTMLElement', () => {
			vi.spyOn(document, 'activeElement', 'get').mockReturnValue(null as unknown as Element)
			expect(getActiveElement()).toBeNull()
		})
	})
})
