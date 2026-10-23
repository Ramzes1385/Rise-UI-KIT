import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import BaseTable from '../../ui/BaseTable.vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { TableColumn, TableRow } from '../../types/BaseTable.types'

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя', width: '200px', minWidth: '120px', maxWidth: '320px' },
	{ key: 'city', label: 'Город', width: '200px' },
]

const ROWS: TableRow[] = [{ id: 1, data: { name: 'Анна', city: 'Тула' } }]

function pointer(
	target: EventTarget,
	type: string,
	init: { pageX: number; pointerId?: number; isPrimary?: boolean; button?: number },
): void {
	target.dispatchEvent(
		Object.assign(new Event(type, { bubbles: true, cancelable: true }), { pointerId: 1, isPrimary: true, button: 0, ...init }),
	)
}

function mockWidths(wrapper: ReturnType<typeof mount>, widths: number[]): void {
	wrapper
		.findAll('th')
		.forEach((th, index) => Object.defineProperty(th.element, 'offsetWidth', { configurable: true, value: widths[index] }))
}

describe('BaseTable: ширина колонки указателем (TBL-12)', () => {
	afterEach(() => {
		document.body.style.cursor = ''
		document.body.style.userSelect = ''
	})

	it('ручка захватывает указатель; жест касанием меняет ширину в границах колонки и сообщает итог', async () => {
		const wrapper = mount(BaseTable, {
			props: { columns: COLUMNS, rows: ROWS, behavior: { resizable: true } },
			attachTo: document.body,
		})
		mockWidths(wrapper, [200, 200])
		const handle = wrapper.get('.base-table__resizer').element as HTMLElement
		const capture = vi.fn()
		Object.defineProperty(handle, 'setPointerCapture', { configurable: true, value: capture })

		pointer(handle, 'pointerdown', { pageX: 0, pointerId: 5 })
		expect(capture).toHaveBeenCalledWith(5)
		pointer(document, 'pointermove', { pageX: 500, pointerId: 5 })
		pointer(document, 'pointerup', { pageX: 500, pointerId: 5 })
		await nextTick()

		expect(wrapper.emitted('column-resize')).toEqual([['name', 320]])
		const [changed] = wrapper.emitted('columns-change')!.at(-1) as TableColumn[][]
		expect(changed.map(column => column.width)).toEqual(['320px', '80px'])
		wrapper.unmount()
	})

	it('вторая кнопка мыши и неосновной указатель ресайз не начинают и указатель не захватывают', () => {
		const wrapper = mount(BaseTable, {
			props: { columns: COLUMNS, rows: ROWS, behavior: { resizable: true } },
			attachTo: document.body,
		})
		const handle = wrapper.get('.base-table__resizer').element as HTMLElement
		const capture = vi.fn()
		Object.defineProperty(handle, 'setPointerCapture', { configurable: true, value: capture })

		pointer(handle, 'pointerdown', { pageX: 0, button: 2 })
		pointer(handle, 'pointerdown', { pageX: 0, isPrimary: false })
		expect(capture).not.toHaveBeenCalled()
		expect(document.body.style.userSelect).toBe('')
		wrapper.unmount()
	})

	it('синтетический указатель, который браузер не знает, не ломает начало жеста', () => {
		const wrapper = mount(BaseTable, {
			props: { columns: COLUMNS, rows: ROWS, behavior: { resizable: true } },
			attachTo: document.body,
		})
		const handle = wrapper.get('.base-table__resizer').element as HTMLElement
		Object.defineProperty(handle, 'setPointerCapture', {
			configurable: true,
			value: () => {
				throw new DOMException('Нет такого указателя', 'NotFoundError')
			},
		})
		pointer(handle, 'pointerdown', { pageX: 0 })
		expect(document.body.style.userSelect).toBe('none')
		pointer(document, 'pointerup', { pageX: 0 })
		wrapper.unmount()
	})

	it('ручка без поддержки захвата указателя работает (jsdom, старые браузеры)', () => {
		const wrapper = mount(BaseTable, {
			props: { columns: COLUMNS, rows: ROWS, behavior: { resizable: true } },
			attachTo: document.body,
		})
		pointer(wrapper.get('.base-table__resizer').element, 'pointerdown', { pageX: 0 })
		expect(document.body.style.userSelect).toBe('none')
		pointer(document, 'pointerup', { pageX: 0 })
		wrapper.unmount()
	})

	it('aria-valuemin и aria-valuemax ручки учитывают minWidth и maxWidth колонки', async () => {
		const wrapper = mount(BaseTable, { props: { columns: COLUMNS, rows: ROWS, behavior: { resizable: true } } })
		mockWidths(wrapper, [300, 300])
		await wrapper.setProps({
			columns: [
				{ ...COLUMNS[0], width: '210px' },
				{ ...COLUMNS[1], width: '210px' },
			],
		})
		await nextTick()
		const [first, second] = wrapper.findAll('[role="separator"]')
		expect(first.attributes('aria-valuemin')).toBe('120')
		expect(first.attributes('aria-valuemax')).toBe('320')
		expect(second.attributes('aria-valuemin')).toBe('50')
		expect(second.attributes('aria-valuemax')).toBe('550')
		wrapper.unmount()
	})
})

describe('BaseTable: слоты тулбара добавляются после монтирования (TBL-21)', () => {
	it('toolbar-append, появившийся по v-if, показывает панель, а исчезнув — прячет', async () => {
		const isShown = ref(false)
		const Parent = defineComponent({
			setup() {
				return () =>
					h(BaseTable, { columns: COLUMNS, rows: ROWS }, isShown.value ? { 'toolbar-append': () => h('button', 'Свой') } : {})
			},
		})
		const wrapper = mount(Parent)
		expect(wrapper.find('[role="toolbar"]').exists()).toBe(false)
		isShown.value = true
		await nextTick()
		expect(wrapper.get('[role="toolbar"]').text()).toContain('Свой')
		isShown.value = false
		await nextTick()
		expect(wrapper.find('[role="toolbar"]').exists()).toBe(false)
		wrapper.unmount()
	})
})
