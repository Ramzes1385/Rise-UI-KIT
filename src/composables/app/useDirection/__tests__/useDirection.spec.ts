import { render } from '@testing-library/vue'
import { useDirection } from '../useDirection'
import { defineComponent, h, nextTick } from 'vue'
import type { UseDirectionReturn } from '../types/useDirection.types'

function mountWith(attrs: Record<string, string>, useTarget = false) {
	let result!: UseDirectionReturn
	let before = true
	const Child = defineComponent({
		setup() {
			result = useDirection(useTarget ? () => document.querySelector('[data-target]') : undefined)
			before = result.isRtl.value
			return () => h('span', { 'data-target': '' })
		},
	})
	const view = render(defineComponent({ render: () => h('div', attrs, [h(Child)]) }), {
		container: document.body.appendChild(document.createElement('div')),
	})
	return { result, before, view }
}

describe('useDirection', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		document.documentElement.removeAttribute('dir')
	})

	it('до монтирования — LTR, после — по direction корневого элемента', () => {
		const { result, before } = mountWith({ dir: 'rtl' })
		expect(before).toBe(false)
		expect(result.isRtl.value).toBe(true)
		expect(result.sign.value).toBe(-1)
	})

	it('LTR: sign = 1', () => {
		const { result } = mountWith({ dir: 'ltr' })
		expect(result.isRtl.value).toBe(false)
		expect(result.sign.value).toBe(1)
	})

	it('dir на html наследуется', () => {
		document.documentElement.setAttribute('dir', 'rtl')
		expect(mountWith({}).result.isRtl.value).toBe(true)
	})

	it('target — функция: направление берётся у возвращённого элемента', () => {
		expect(mountWith({ dir: 'rtl' }, true).result.isRtl.value).toBe(true)
	})

	it('update перечитывает направление после смены dir', async () => {
		const { result } = mountWith({ dir: 'ltr' })
		document.querySelector('div[dir]')?.setAttribute('dir', 'rtl')
		expect(result.isRtl.value).toBe(false)
		result.update()
		await nextTick()
		expect(result.isRtl.value).toBe(true)
	})

	it('target без элемента — LTR', () => {
		let value!: UseDirectionReturn
		render(defineComponent({ setup: () => ((value = useDirection(() => null)), () => h('i')) }))
		expect(value.isRtl.value).toBe(false)
	})
})
