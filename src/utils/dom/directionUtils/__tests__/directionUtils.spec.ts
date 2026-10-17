import { getDirectionSign, isRtl, mirrorArrowKey, mirrorSide, resolveArrowKey } from '../directionUtils'

function mount(dir: 'ltr' | 'rtl'): HTMLElement {
	const root = document.createElement('div')
	root.setAttribute('dir', dir)
	root.innerHTML = '<button type="button"><span></span></button>'
	document.body.append(root)
	return root
}

afterEach(() => {
	document.body.innerHTML = ''
})

describe('isRtl', () => {
	it('dir="rtl" на элементе и на предке — справа налево', () => {
		const root = mount('rtl')
		expect(isRtl(root)).toBe(true)
		expect(isRtl(root.querySelector('span'))).toBe(true)
	})

	it('dir="ltr" и элемент без dir — слева направо', () => {
		expect(isRtl(mount('ltr'))).toBe(false)
		expect(isRtl(document.createElement('div'))).toBe(false)
	})

	it('вложенный dir="ltr" внутри RTL возвращает LTR', () => {
		const root = mount('rtl')
		const inner = root.querySelector('button') as HTMLElement
		inner.setAttribute('dir', 'ltr')
		expect(isRtl(inner)).toBe(false)
	})

	it('null и undefined — не RTL', () => {
		expect(isRtl(null)).toBe(false)
		expect(isRtl(undefined)).toBe(false)
	})
})

describe('getDirectionSign', () => {
	it('1 в LTR и −1 в RTL', () => {
		expect(getDirectionSign(mount('ltr'))).toBe(1)
		expect(getDirectionSign(mount('rtl'))).toBe(-1)
		expect(getDirectionSign(null)).toBe(1)
	})
})

describe('mirrorArrowKey', () => {
	it('в RTL ← и → меняются местами', () => {
		expect(mirrorArrowKey('ArrowLeft', true)).toBe('ArrowRight')
		expect(mirrorArrowKey('ArrowRight', true)).toBe('ArrowLeft')
	})

	it('в LTR клавиши прежние', () => {
		expect(mirrorArrowKey('ArrowLeft', false)).toBe('ArrowLeft')
		expect(mirrorArrowKey('ArrowRight', false)).toBe('ArrowRight')
	})

	it('↑ ↓ и остальные клавиши не меняются в обоих направлениях', () => {
		for (const key of ['ArrowUp', 'ArrowDown', 'Home', 'Enter', ' ']) {
			expect(mirrorArrowKey(key, true)).toBe(key)
			expect(mirrorArrowKey(key, false)).toBe(key)
		}
	})
})

describe('resolveArrowKey', () => {
	const press = (key: string, target: Element | null, currentTarget: Element | null = null) =>
		({ key, target, currentTarget }) as Pick<KeyboardEvent, 'key' | 'target' | 'currentTarget'>

	it('направление берётся у цели события', () => {
		const target = mount('rtl').querySelector('span')
		expect(resolveArrowKey(press('ArrowLeft', target))).toBe('ArrowRight')
		expect(resolveArrowKey(press('ArrowRight', target))).toBe('ArrowLeft')
	})

	it('цели нет (событие на документе) — берётся элемент обработчика', () => {
		const handler = mount('rtl')
		expect(resolveArrowKey(press('ArrowLeft', null, handler))).toBe('ArrowRight')
	})

	it('явный элемент важнее цели события', () => {
		const rtl = mount('rtl')
		const ltr = mount('ltr')
		expect(resolveArrowKey(press('ArrowLeft', ltr), rtl)).toBe('ArrowRight')
		expect(resolveArrowKey(press('ArrowLeft', rtl), ltr)).toBe('ArrowLeft')
	})

	it('в LTR и без элемента клавиша прежняя', () => {
		expect(resolveArrowKey(press('ArrowLeft', mount('ltr')))).toBe('ArrowLeft')
		expect(resolveArrowKey(press('ArrowRight', null))).toBe('ArrowRight')
	})

	it('не стрелка по горизонтали — как есть, направление не читается', () => {
		const target = mount('rtl')
		expect(resolveArrowKey(press('ArrowDown', target))).toBe('ArrowDown')
		expect(resolveArrowKey(press('Escape', target))).toBe('Escape')
	})
})

describe('mirrorSide', () => {
	it('в RTL right и left, в том числе с выравниванием, меняются местами', () => {
		expect(mirrorSide('right', true)).toBe('left')
		expect(mirrorSide('left', true)).toBe('right')
		expect(mirrorSide('right-start', true)).toBe('left-start')
		expect(mirrorSide('left-end', true)).toBe('right-end')
	})

	it('top, bottom и start/end не меняются; в LTR всё как есть', () => {
		expect(mirrorSide('bottom-start', true)).toBe('bottom-start')
		expect(mirrorSide('top', true)).toBe('top')
		expect(mirrorSide('right-start', false)).toBe('right-start')
	})
})
