import '@testing-library/jest-dom/vitest'

import {
	ALIGN_MAP,
	FORMAT_CONFIG,
	INLINE_FORMAT_TAGS,
	findAncestorByTags,
	getBlockAlign,
	getBlockParent,
	getFormatBlock,
	isInsideList,
	isInsideTags,
	toHTMLElement,
} from './editorDomInspect'

describe('editorDomInspect', () => {
	describe('toHTMLElement', () => {
		it('возвращает null для null', () => {
			expect(toHTMLElement(null)).toBeNull()
		})

		it('возвращает parentElement для Text-узла', () => {
			const div = document.createElement('div')
			const text = document.createTextNode('hello')
			div.appendChild(text)
			expect(toHTMLElement(text)).toBe(div)
		})

		it('возвращает сам узел для HTMLElement', () => {
			const div = document.createElement('div')
			expect(toHTMLElement(div)).toBe(div)
		})

		it('возвращает null для Text-узла без родителя', () => {
			const text = document.createTextNode('hello')
			expect(toHTMLElement(text)).toBeNull()
		})
	})

	describe('isInsideTags', () => {
		it('возвращает true если узел внутри тега', () => {
			const root = document.createElement('div')
			const bold = document.createElement('b')
			const text = document.createTextNode('text')
			bold.appendChild(text)
			root.appendChild(bold)
			expect(isInsideTags(text, ['B', 'STRONG'], root)).toBe(true)
		})

		it('возвращает true если HTMLElement напрямую совпадает с тегом', () => {
			const root = document.createElement('div')
			const bold = document.createElement('b')
			root.appendChild(bold)
			expect(isInsideTags(bold, ['B'], root)).toBe(true)
		})

		it('возвращает false если узел не внутри тега', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			root.appendChild(span)
			expect(isInsideTags(text, ['B', 'STRONG'], root)).toBe(false)
		})

		it('возвращает false если узел null', () => {
			const root = document.createElement('div')
			expect(isInsideTags(null, ['B'], root)).toBe(false)
		})

		it('не поднимается выше root', () => {
			const outer = document.createElement('div')
			const root = document.createElement('div')
			const text = document.createTextNode('text')
			root.appendChild(text)
			outer.appendChild(root)
			expect(isInsideTags(text, ['DIV'], root)).toBe(false)
		})

		it('останавливается при null parentElement', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			expect(isInsideTags(text, ['DIV'], root)).toBe(false)
		})

		it('проходит через несовпадающий элемент и находит целевой выше', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const bold = document.createElement('b')
			const text = document.createTextNode('text')
			bold.appendChild(text)
			span.appendChild(bold)
			root.appendChild(span)
			expect(isInsideTags(text, ['SPAN'], root)).toBe(true)
		})
	})

	describe('findAncestorByTags', () => {
		it('находит предка с указанным тегом', () => {
			const root = document.createElement('div')
			const bold = document.createElement('b')
			const text = document.createTextNode('text')
			bold.appendChild(text)
			root.appendChild(bold)
			expect(findAncestorByTags(text, root, ['B'])).toBe(bold)
		})

		it('находит ближайшего предка при вложенных совпадениях', () => {
			const root = document.createElement('div')
			const outer = document.createElement('b')
			const inner = document.createElement('b')
			const text = document.createTextNode('text')
			inner.appendChild(text)
			outer.appendChild(inner)
			root.appendChild(outer)
			expect(findAncestorByTags(text, root, ['B'])).toBe(inner)
		})

		it('возвращает null если предок не найден', () => {
			const root = document.createElement('div')
			const text = document.createTextNode('text')
			root.appendChild(text)
			expect(findAncestorByTags(text, root, ['B'])).toBeNull()
		})

		it('возвращает null для null-узла', () => {
			const root = document.createElement('div')
			expect(findAncestorByTags(null, root, ['B'])).toBeNull()
		})

		it('проходит через несовпадающий элемент и находит предка выше', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const bold = document.createElement('b')
			const text = document.createTextNode('text')
			bold.appendChild(text)
			span.appendChild(bold)
			root.appendChild(span)
			expect(findAncestorByTags(text, root, ['SPAN'])).toBe(span)
		})

		it('останавливается при null parentElement', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			expect(findAncestorByTags(text, root, ['DIV'])).toBeNull()
		})
	})

	describe('getBlockParent', () => {
		it('находит блочного родителя', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			const text = document.createTextNode('text')
			p.appendChild(text)
			root.appendChild(p)
			expect(getBlockParent(text, root)).toBe(p)
		})

		it('возвращает сам элемент если HTMLElement является блочным тегом', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			root.appendChild(p)
			expect(getBlockParent(p, root)).toBe(p)
		})

		it('находит DIV как блочного родителя', () => {
			const root = document.createElement('div')
			const innerDiv = document.createElement('div')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			innerDiv.appendChild(span)
			root.appendChild(innerDiv)
			expect(getBlockParent(text, root)).toBe(innerDiv)
		})

		it('возвращает root если блочного родителя нет', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			root.appendChild(span)
			expect(getBlockParent(text, root)).toBe(root)
		})

		it('проходит через inline-элементы и находит блочный родитель', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			const span = document.createElement('span')
			const em = document.createElement('em')
			const text = document.createTextNode('text')
			em.appendChild(text)
			span.appendChild(em)
			p.appendChild(span)
			root.appendChild(p)
			expect(getBlockParent(text, root)).toBe(p)
		})

		it('останавливается при null parentElement', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			expect(getBlockParent(text, root)).toBe(root)
		})

		it('возвращает root для null-узла', () => {
			const root = document.createElement('div')
			expect(getBlockParent(null, root)).toBe(root)
		})
	})

	describe('getFormatBlock', () => {
		it('возвращает тег блока форматирования', () => {
			const root = document.createElement('div')
			const h1 = document.createElement('h1')
			const text = document.createTextNode('text')
			h1.appendChild(text)
			root.appendChild(h1)
			expect(getFormatBlock(text, root)).toBe('h1')
		})

		it('возвращает h2 для H2', () => {
			const root = document.createElement('div')
			const h2 = document.createElement('h2')
			const text = document.createTextNode('text')
			h2.appendChild(text)
			root.appendChild(h2)
			expect(getFormatBlock(text, root)).toBe('h2')
		})

		it('возвращает blockquote для BLOCKQUOTE', () => {
			const root = document.createElement('div')
			const bq = document.createElement('blockquote')
			const text = document.createTextNode('text')
			bq.appendChild(text)
			root.appendChild(bq)
			expect(getFormatBlock(text, root)).toBe('blockquote')
		})

		it('возвращает pre для PRE', () => {
			const root = document.createElement('div')
			const pre = document.createElement('pre')
			const text = document.createTextNode('text')
			pre.appendChild(text)
			root.appendChild(pre)
			expect(getFormatBlock(text, root)).toBe('pre')
		})

		it('возвращает address для ADDRESS', () => {
			const root = document.createElement('div')
			const addr = document.createElement('address')
			const text = document.createTextNode('text')
			addr.appendChild(text)
			root.appendChild(addr)
			expect(getFormatBlock(text, root)).toBe('address')
		})

		it('возвращает пустую строку если блок не найден', () => {
			const root = document.createElement('div')
			const text = document.createTextNode('text')
			root.appendChild(text)
			expect(getFormatBlock(text, root)).toBe('')
		})

		it('не считает LI блоком форматирования', () => {
			const root = document.createElement('div')
			const li = document.createElement('li')
			const text = document.createTextNode('text')
			li.appendChild(text)
			root.appendChild(li)
			expect(getFormatBlock(text, root)).toBe('')
		})

		it('проходит через inline-элемент и находит блок форматирования', () => {
			const root = document.createElement('div')
			const bq = document.createElement('blockquote')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			bq.appendChild(span)
			root.appendChild(bq)
			expect(getFormatBlock(text, root)).toBe('blockquote')
		})

		it('останавливается при null parentElement', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			expect(getFormatBlock(text, root)).toBe('')
		})
	})

	describe('getBlockAlign', () => {
		it('возвращает left по умолчанию', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			const text = document.createTextNode('text')
			p.appendChild(text)
			root.appendChild(p)
			expect(getBlockAlign(text, root)).toBe('left')
		})

		it('возвращает left при пустом textAlign', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			p.style.textAlign = ''
			const text = document.createTextNode('text')
			p.appendChild(text)
			root.appendChild(p)
			expect(getBlockAlign(text, root)).toBe('left')
		})

		it('возвращает выравнивание из style', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			p.style.textAlign = 'center'
			const text = document.createTextNode('text')
			p.appendChild(text)
			root.appendChild(p)
			expect(getBlockAlign(text, root)).toBe('center')
		})

		it('возвращает justify напрямую', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			p.style.textAlign = 'justify'
			const text = document.createTextNode('text')
			p.appendChild(text)
			root.appendChild(p)
			expect(getBlockAlign(text, root)).toBe('justify')
		})

		it('возвращает right напрямую', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			p.style.textAlign = 'right'
			const text = document.createTextNode('text')
			p.appendChild(text)
			root.appendChild(p)
			expect(getBlockAlign(text, root)).toBe('right')
		})

		it('заменяет start на left', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			p.style.textAlign = 'start'
			const text = document.createTextNode('text')
			p.appendChild(text)
			root.appendChild(p)
			expect(getBlockAlign(text, root)).toBe('left')
		})

		it('заменяет end на right', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			p.style.textAlign = 'end'
			const text = document.createTextNode('text')
			p.appendChild(text)
			root.appendChild(p)
			expect(getBlockAlign(text, root)).toBe('right')
		})

		it('возвращает right когда textAlign задан и не start', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			p.style.textAlign = 'right'
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			p.appendChild(span)
			root.appendChild(p)
			expect(getBlockAlign(text, root)).toBe('right')
		})

		it('возвращает center через else-ветку при inline-обёртке', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			p.style.textAlign = 'center'
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			p.appendChild(span)
			root.appendChild(p)
			expect(getBlockAlign(text, root)).toBe('center')
		})
	})

	describe('isInsideList', () => {
		it('возвращает true если внутри UL', () => {
			const root = document.createElement('div')
			const ul = document.createElement('ul')
			const li = document.createElement('li')
			const text = document.createTextNode('text')
			li.appendChild(text)
			ul.appendChild(li)
			root.appendChild(ul)
			expect(isInsideList(text, root, 'UL')).toBe(true)
		})

		it('возвращает true для HTMLElement напрямую внутри UL', () => {
			const root = document.createElement('div')
			const ul = document.createElement('ul')
			const li = document.createElement('li')
			ul.appendChild(li)
			root.appendChild(ul)
			expect(isInsideList(li, root, 'UL')).toBe(true)
		})

		it('работает с lowercase listTag', () => {
			const root = document.createElement('div')
			const ul = document.createElement('ul')
			const li = document.createElement('li')
			const text = document.createTextNode('text')
			li.appendChild(text)
			ul.appendChild(li)
			root.appendChild(ul)
			expect(isInsideList(text, root, 'ul')).toBe(true)
		})

		it('возвращает false если не внутри списка', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			const text = document.createTextNode('text')
			p.appendChild(text)
			root.appendChild(p)
			expect(isInsideList(text, root, 'UL')).toBe(false)
		})

		it('различает UL и OL', () => {
			const root = document.createElement('div')
			const ul = document.createElement('ul')
			const li = document.createElement('li')
			const text = document.createTextNode('text')
			li.appendChild(text)
			ul.appendChild(li)
			root.appendChild(ul)
			expect(isInsideList(text, root, 'OL')).toBe(false)
		})

		it('проходит через inline-элементы и находит список', () => {
			const root = document.createElement('div')
			const ul = document.createElement('ul')
			const li = document.createElement('li')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			li.appendChild(span)
			ul.appendChild(li)
			root.appendChild(ul)
			expect(isInsideList(text, root, 'UL')).toBe(true)
		})

		it('останавливается при null parentElement', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			expect(isInsideList(text, root, 'UL')).toBe(false)
		})
	})

	describe('toHTMLElement — Comment-узел', () => {
		it('возвращает null для Comment-узла', () => {
			const comment = document.createComment('comment')
			expect(toHTMLElement(comment)).toBeNull()
		})

		it('возвращает null для DocumentFragment', () => {
			const fragment = document.createDocumentFragment()
			expect(toHTMLElement(fragment)).toBeNull()
		})
	})

	describe('isInsideList — дополнительные кейсы', () => {
		it('возвращает false для null-узла', () => {
			const root = document.createElement('div')
			expect(isInsideList(null, root, 'UL')).toBe(false)
		})

		it('не поднимается выше root', () => {
			const outer = document.createElement('ul')
			const root = document.createElement('div')
			const text = document.createTextNode('text')
			root.appendChild(text)
			outer.appendChild(root)
			expect(isInsideList(text, root, 'UL')).toBe(false)
		})
	})

	describe('getBlockAlign — null-узел', () => {
		it('возвращает left для null-узла', () => {
			const root = document.createElement('div')
			expect(getBlockAlign(null, root)).toBe('left')
		})
	})

	describe('getFormatBlock — null-узел', () => {
		it('возвращает пустую строку для null-узла', () => {
			const root = document.createElement('div')
			expect(getFormatBlock(null, root)).toBe('')
		})
	})

	describe('findAncestorByTags — не поднимается выше root', () => {
		it('не находит предка выше root', () => {
			const outer = document.createElement('div')
			const root = document.createElement('div')
			const text = document.createTextNode('text')
			root.appendChild(text)
			outer.appendChild(root)
			expect(findAncestorByTags(text, root, ['DIV'])).toBeNull()
		})
	})

	describe('findAncestorByTags — проходит через несовпадающий элемент', () => {
		it('пропускает несовпадающий промежуточный элемент', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			root.appendChild(span)
			expect(findAncestorByTags(text, root, ['B'])).toBeNull()
		})
	})

	describe('isInsideList — проходит через несовпадающий тег', () => {
		it('проходит мимо OL при поиске UL', () => {
			const root = document.createElement('div')
			const ol = document.createElement('ol')
			const li = document.createElement('li')
			const text = document.createTextNode('text')
			li.appendChild(text)
			ol.appendChild(li)
			root.appendChild(ol)
			expect(isInsideList(text, root, 'UL')).toBe(false)
		})
	})

	describe('getBlockParent — проходит через inline-элемент', () => {
		it('пропускает span и возвращает root', () => {
			const root = document.createElement('div')
			const span = document.createElement('span')
			const em = document.createElement('em')
			const text = document.createTextNode('text')
			em.appendChild(text)
			span.appendChild(em)
			root.appendChild(span)
			expect(getBlockParent(text, root)).toBe(root)
		})
	})

	describe('getFormatBlock — проходит через LI', () => {
		it('пропускает LI и возвращает пустую строку', () => {
			const root = document.createElement('div')
			const li = document.createElement('li')
			const span = document.createElement('span')
			const text = document.createTextNode('text')
			span.appendChild(text)
			li.appendChild(span)
			root.appendChild(li)
			expect(getFormatBlock(text, root)).toBe('')
		})
	})

	describe('getBlockAlign — выравнивание center проходит через else', () => {
		it('center не равно end и возвращает center', () => {
			const root = document.createElement('div')
			const p = document.createElement('p')
			p.style.textAlign = 'center'
			root.appendChild(p)
			expect(getBlockAlign(p, root)).toBe('center')
		})
	})

	describe('константы', () => {
		it('FORMAT_CONFIG содержит bold/italic/underline/strikeThrough', () => {
			expect(Object.keys(FORMAT_CONFIG)).toEqual(['bold', 'italic', 'underline', 'strikeThrough'])
		})

		it('ALIGN_MAP содержит все выравнивания', () => {
			expect(Object.keys(ALIGN_MAP)).toEqual(['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'])
		})

		it('INLINE_FORMAT_TAGS содержит теги форматирования', () => {
			expect(INLINE_FORMAT_TAGS.has('B')).toBe(true)
			expect(INLINE_FORMAT_TAGS.has('STRONG')).toBe(true)
			expect(INLINE_FORMAT_TAGS.has('SPAN')).toBe(true)
		})
	})
})
