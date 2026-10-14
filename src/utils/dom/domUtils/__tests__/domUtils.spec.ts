import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
	getAccessibleName,
	getActiveElement,
	getBoundsRect,
	getFixedOrigin,
	toHTMLElement,
	toHTMLInputElement,
	toHTMLTextAreaElement,
} from '../domUtils'

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

	describe('getFixedOrigin', () => {
		function tree(): { outer: HTMLElement; inner: HTMLElement } {
			const outer = document.createElement('div')
			const inner = document.createElement('div')
			outer.append(inner)
			document.body.append(outer)
			vi.spyOn(outer, 'getBoundingClientRect').mockReturnValue(new DOMRect(40, 300, 500, 200))
			return { outer, inner }
		}

		afterEach(() => {
			document.body.replaceChildren()
		})

		it('без предков с трансформацией — начало окна', () => {
			const { inner } = tree()
			expect(getFixedOrigin(inner)).toEqual({ x: 0, y: 0 })
			expect(getFixedOrigin(null)).toEqual({ x: 0, y: 0 })
			expect(getFixedOrigin(document.documentElement)).toEqual({ x: 0, y: 0 })
		})

		it('предок в другом документе: стиль берётся из окна его документа, полноэкранность — из его document', () => {
			const foreign = document.implementation.createHTMLDocument('')
			const outer = foreign.createElement('div')
			const inner = foreign.createElement('div')
			outer.style.transform = 'translateZ(0)'
			outer.append(inner)
			foreign.body.append(outer)
			vi.spyOn(outer, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 20, 50, 50))

			expect(foreign.defaultView).toBeNull()
			expect(getFixedOrigin(inner)).toEqual({ x: 10, y: 20 })
		})

		it('окно документа предка даёт стиль через собственный getComputedStyle', () => {
			const { outer, inner } = tree()
			const view = outer.ownerDocument.defaultView!
			const spy = vi.spyOn(view, 'getComputedStyle')

			getFixedOrigin(inner)

			expect(spy).toHaveBeenCalledWith(inner)
		})

		it('значение none не создаёт систему координат', () => {
			const { outer, inner } = tree()
			outer.style.transform = 'none'
			expect(getFixedOrigin(inner)).toEqual({ x: 0, y: 0 })
		})

		it.each([
			['transform', 'translateZ(0)'],
			['filter', 'blur(2px)'],
			['contain', 'paint'],
			['container-type', 'inline-size'],
			['will-change', 'transform'],
		])('%s: %s — угол предка с учётом рамки и прокрутки', (property, value) => {
			const { outer, inner } = tree()
			outer.style.setProperty(property, value)
			vi.spyOn(outer, 'clientLeft', 'get').mockReturnValue(2)
			vi.spyOn(outer, 'clientTop', 'get').mockReturnValue(3)
			outer.scrollTop = 0
			vi.spyOn(outer, 'scrollTop', 'get').mockReturnValue(100)
			expect(getFixedOrigin(inner)).toEqual({ x: 42, y: 203 })
		})

		it('сам контейнер тоже учитывается', () => {
			const { outer } = tree()
			outer.style.transform = 'translateX(0)'
			expect(getFixedOrigin(outer)).toEqual({ x: 40, y: 300 })
		})

		it('элемент во весь экран отсекает трансформированных предков', () => {
			const { outer, inner } = tree()
			outer.style.transform = 'translateX(0)'
			Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => inner })
			expect(getFixedOrigin(inner)).toEqual({ x: 0, y: 0 })
			Reflect.deleteProperty(document, 'fullscreenElement')
		})
	})

	describe('getAccessibleName', () => {
		afterEach(() => {
			document.body.innerHTML = ''
		})

		it('без элемента — пустая строка', () => {
			expect(getAccessibleName(null)).toBe('')
		})

		it('aria-labelledby важнее aria-label и текста', () => {
			document.body.innerHTML =
				'<span id="a">Первое</span><span id="b"> Второе </span><button id="t" aria-labelledby="a b" aria-label="Метка">Текст</button>'
			expect(getAccessibleName(document.getElementById('t'))).toBe('Первое Второе')
		})

		it('aria-labelledby на отсутствующий элемент — берётся aria-label', () => {
			document.body.innerHTML = '<button id="t" aria-labelledby="none" aria-label="  Метка  ">Текст</button>'
			expect(getAccessibleName(document.getElementById('t'))).toBe('Метка')
		})

		it('без атрибутов — видимый текст с одиночными пробелами', () => {
			document.body.innerHTML = '<button id="t">Один   два</button>'
			expect(getAccessibleName(document.getElementById('t'))).toBe('Один два')
		})

		it('пустой элемент — пустая строка', () => {
			document.body.innerHTML = '<button id="t"></button>'
			expect(getAccessibleName(document.getElementById('t'))).toBe('')
		})
	})
	describe('getBoundsRect', () => {
		afterEach(() => {
			document.body.replaceChildren()
		})

		it('нет предка с data-rise-bounds — null', () => {
			const inner = document.createElement('div')
			document.body.append(inner)
			expect(getBoundsRect(inner)).toBeNull()
			expect(getBoundsRect(null)).toBeNull()
		})

		it('рамка ближайшего предка с data-rise-bounds без рамок и полос прокрутки', () => {
			const outer = document.createElement('div')
			const inner = document.createElement('div')
			outer.setAttribute('data-rise-bounds', '')
			outer.append(inner)
			document.body.append(outer)
			vi.spyOn(outer, 'getBoundingClientRect').mockReturnValue(new DOMRect(40, 300, 500, 200))
			vi.spyOn(outer, 'clientLeft', 'get').mockReturnValue(2)
			vi.spyOn(outer, 'clientTop', 'get').mockReturnValue(3)
			vi.spyOn(outer, 'clientWidth', 'get').mockReturnValue(496)
			vi.spyOn(outer, 'clientHeight', 'get').mockReturnValue(194)
			expect(getBoundsRect(inner)).toEqual({ x: 42, y: 303, width: 496, height: 194 })
		})
	})
})
