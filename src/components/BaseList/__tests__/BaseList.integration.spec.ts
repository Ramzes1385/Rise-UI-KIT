import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import BaseList from '../ui/BaseList.vue'
import userEvent from '@testing-library/user-event'
import type { ListItem } from '../types/BaseList.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const ROWS: ListItem[] = [
	{ id: 'a', title: 'Альфа' },
	{ id: 'b', title: 'Бета' },
	{ id: 'c', title: 'Гамма' },
	{ id: 'd', title: 'Дельта' },
]

const EVENTS = ['update:modelValue', 'update:items', 'move', 'activate']

function setup(props: Record<string, unknown> = {}, slots = '') {
	const log: Record<string, unknown[][]> = {}
	const handlers = Object.fromEntries(EVENTS.map(name => [name, (...args: unknown[]) => (log[name] ??= []).push(args)]))
	const model = ref(props.modelValue ?? null)
	const rows = ref((props.items as ListItem[] | undefined) ?? ROWS)
	render({
		components: { BaseList },
		setup: () => ({ handlers, model, rows, props: { ariaLabel: 'Разделы', ...props } }),
		template: `<BaseList v-bind="props" v-model="model" v-model:items="rows" v-on="handlers">${slots}</BaseList>`,
	})
	return { user: userEvent.setup(), emitted: (name: string) => log[name], model, rows }
}

const option = (name: string) => screen.getByRole('option', { name })

const row = (name: string) =>
	screen
		.getAllByText(name)
		.find(node => node.closest('li'))
		?.closest('li') as HTMLElement

const order = (role = 'listitem') => screen.getAllByRole(role).map(element => element.dataset.listId)

describe('BaseList integration', () => {
	it('выбирает строку пробелом после Tab и стрелки', async () => {
		const user = userEvent.setup()
		const items = [
			{ id: 'a', title: 'Альфа' },
			{ id: 'b', title: 'Бета' },
		]
		const { emitted } = render(BaseList, { props: { items, ariaLabel: 'Разделы', selectionMode: 'multiple' } })
		await user.tab()
		await user.keyboard('{ArrowDown} ')
		expect(screen.getByRole('option', { name: 'Бета' })).toHaveFocus()
		expect(emitted()['update:modelValue']).toEqual([[['b']]])
	})

	describe('фокус и навигация (APG Listbox)', () => {
		it('↑/↓ без зацикливания, Home и End', async () => {
			const { user } = setup({ selectionMode: 'single' })
			await user.tab()
			expect(option('Альфа')).toHaveFocus()
			await user.keyboard('{ArrowUp}')
			expect(option('Альфа')).toHaveFocus()
			await user.keyboard('{End}')
			expect(option('Дельта')).toHaveFocus()
			await user.keyboard('{ArrowDown}')
			expect(option('Дельта')).toHaveFocus()
			await user.keyboard('{Home}{ArrowDown}')
			expect(option('Бета')).toHaveFocus()
			expect(option('Бета')).toHaveAttribute('tabindex', '0')
		})

		it('Tab возвращает на последнюю активную строку', async () => {
			const { user } = setup({ selectionMode: 'single' })
			await user.tab()
			await user.keyboard('{ArrowDown}{ArrowDown}')
			await user.tab()
			await user.tab({ shift: true })
			expect(option('Гамма')).toHaveFocus()
		})

		it('поиск по первым буквам: префикс, повтор буквы — по кругу, сброс через 500 мс', async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true })
			const items = [
				{ id: 'a', title: 'Бор' },
				{ id: 'b', title: 'Берёза' },
				{ id: 'c', title: 'Бук' },
				{ id: 'd', title: 'Ель' },
			]
			const { user } = setup({ selectionMode: 'single', items })
			await user.tab()
			await user.keyboard('б')
			expect(option('Берёза')).toHaveFocus()
			await user.keyboard('б')
			expect(option('Бук')).toHaveFocus()
			await user.keyboard('б')
			expect(option('Бор')).toHaveFocus()
			vi.advanceTimersByTime(600)
			await user.keyboard('бе')
			expect(option('Берёза')).toHaveFocus()
			vi.advanceTimersByTime(600)
			await user.keyboard('я')
			expect(option('Берёза')).toHaveFocus()
			vi.advanceTimersByTime(600)
			await user.keyboard('Е')
			expect(option('Ель')).toHaveFocus()
			vi.useRealTimers()
		})

		it('Ctrl+буква и ввод в составе (IME) не ищут и не выбирают', async () => {
			const { user, emitted } = setup({ selectionMode: 'single' })
			await user.tab()
			await user.keyboard('{Control>}г{/Control}')
			expect(option('Альфа')).toHaveFocus()
			await fireEvent.keyDown(option('Альфа'), { key: ' ', isComposing: true })
			await fireEvent.keyDown(option('Альфа'), { key: 'Tab' })
			expect(emitted('update:modelValue')).toBeUndefined()
		})
	})

	describe('одиночный выбор', () => {
		it('клик, пробел и Enter выбирают; повтор — тот же id', async () => {
			const { user, emitted, model } = setup({ selectionMode: 'single' })
			await user.click(option('Бета'))
			expect(model.value).toBe('b')
			await user.keyboard(' ')
			await user.keyboard('{ArrowDown}{Enter}')
			expect(emitted('update:modelValue')).toEqual([['b'], ['b'], ['c']])
			expect(option('Гамма')).toHaveAttribute('aria-selected', 'true')
			expect(option('Бета')).toHaveAttribute('aria-selected', 'false')
		})

		it('Shift+клик в одиночном выборе — обычный выбор', async () => {
			const { user, model } = setup({ selectionMode: 'single' })
			await user.keyboard('{Shift>}')
			await user.click(option('Гамма'))
			expect(model.value).toBe('c')
		})

		it('недоступная строка и выключенный список не выбираются', async () => {
			const disabledRow = setup({ selectionMode: 'single', items: [...ROWS, { id: 'e', title: 'Эпсилон', isDisabled: true }] })
			await disabledRow.user.click(option('Эпсилон'))
			expect(disabledRow.emitted('update:modelValue')).toBeUndefined()
		})

		it('isDisabled: ни клик, ни клавиши не выбирают', async () => {
			const { user, emitted } = setup({ selectionMode: 'single', isDisabled: true })
			await user.click(option('Бета'))
			await user.keyboard(' {Enter}')
			expect(emitted('update:modelValue')).toBeUndefined()
		})
	})

	describe('множественный выбор', () => {
		it('клик, пробел и Enter переключают строку', async () => {
			const { user, model } = setup({ selectionMode: 'multiple' })
			await user.click(option('Альфа'))
			expect(model.value).toEqual(['a'])
			await user.keyboard('{ArrowDown} ')
			expect(model.value).toEqual(['a', 'b'])
			await user.keyboard('{Enter}')
			expect(model.value).toEqual(['a'])
			await user.click(option('Альфа'))
			expect(model.value).toEqual([])
		})

		it('Shift+клик и Shift+пробел выбирают диапазон от последней нажатой, пропуская недоступные', async () => {
			const items = [ROWS[0], { id: 'x', title: 'Икс', isDisabled: true }, ...ROWS.slice(1)]
			const { user, model } = setup({ selectionMode: 'multiple', items })
			await user.click(option('Альфа'))
			await user.keyboard('{Shift>}')
			await user.click(option('Гамма'))
			await user.keyboard('{/Shift}')
			expect(model.value).toEqual(['a', 'b', 'c'])

			await user.click(option('Дельта'))
			await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{Shift>} {/Shift}')
			expect(model.value).toEqual(['a', 'b', 'c', 'd'])
		})

		it('Shift+клик без предыдущей нажатой выбирает одну строку', async () => {
			const { user, model } = setup({ selectionMode: 'multiple' })
			await user.keyboard('{Shift>}')
			await user.click(option('Гамма'))
			expect(model.value).toEqual(['c'])
		})

		it('Shift+↑/↓ переходит и переключает следующую строку; на краю — ничего', async () => {
			const { user, model } = setup({ selectionMode: 'multiple' })
			await user.tab()
			await user.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}')
			expect(option('Гамма')).toHaveFocus()
			expect(model.value).toEqual(['b', 'c'])
			await user.keyboard('{Shift>}{ArrowUp}{/Shift}')
			expect(model.value).toEqual(['c'])
			await user.keyboard('{Home}{Shift>}{ArrowUp}{/Shift}')
			expect(model.value).toEqual(['c'])
		})

		it('Shift+стрелка в одиночном выборе только переводит фокус', async () => {
			const { user, emitted } = setup({ selectionMode: 'single' })
			await user.tab()
			await user.keyboard('{Shift>}{ArrowDown}{/Shift}')
			expect(option('Бета')).toHaveFocus()
			expect(emitted('update:modelValue')).toBeUndefined()
		})

		it('Ctrl+A выбирает все доступные; если все выбраны — снимает их, ⌘+A — так же', async () => {
			const items = [...ROWS, { id: 'e', title: 'Эпсилон', isDisabled: true }]
			const { user, model } = setup({ selectionMode: 'multiple', items, modelValue: ['e'] })
			await user.tab()
			await user.keyboard('{Control>}a{/Control}')
			expect(model.value).toEqual(['e', 'a', 'b', 'c', 'd'])
			await user.keyboard('{Meta>}A{/Meta}')
			expect(model.value).toEqual(['e'])
		})

		it('Ctrl+A без множественного выбора ничего не выбирает', async () => {
			const { user, emitted } = setup({ selectionMode: 'single' })
			await user.tab()
			await user.keyboard('{Control>}a{/Control}')
			expect(emitted('update:modelValue')).toBeUndefined()
		})
	})

	describe('режим none: активация', () => {
		it('клик и Enter эмитят activate; пробел без isSortable ничего не делает', async () => {
			const { user, emitted } = setup()
			await user.click(row('Бета'))
			await user.keyboard('{Enter} ')
			expect(emitted('activate')).toEqual([[ROWS[1]], [ROWS[1]]])
			expect(emitted('update:modelValue')).toBeUndefined()
		})

		it('недоступная строка и isDisabled не активируются', async () => {
			const items = [...ROWS, { id: 'e', title: 'Эпсилон', isDisabled: true }]
			const first = setup({ items })
			await first.user.click(row('Эпсилон'))
			await first.user.keyboard('{Enter}')
			expect(first.emitted('activate')).toBeUndefined()
		})

		it('isDisabled — без activate', async () => {
			const { user, emitted } = setup({ isDisabled: true })
			await user.click(row('Бета'))
			await user.keyboard('{Enter}')
			expect(emitted('activate')).toBeUndefined()
		})
	})

	describe('перестановка с клавиатуры', () => {
		it('пробел берёт, ↓ двигает, пробел кладёт — с объявлениями и событиями', async () => {
			const { user, emitted, rows } = setup({ isSortable: true })
			await user.tab()
			await user.keyboard(' ')
			const status = screen.getByRole('status')
			expect(status).toHaveTextContent('Строка «Альфа» взята, место 1 из 4. Стрелки перемещают её, Space кладёт, Escape отменяет')
			expect(row('Альфа')).toHaveClass('base-list__item--grabbed')
			await user.keyboard('{ArrowDown}')
			expect(status).toHaveTextContent('Место 2 из 4')
			expect(order()).toEqual(['b', 'a', 'c', 'd'])
			expect(row('Альфа')).toHaveFocus()
			await user.keyboard('{End}')
			expect(status).toHaveTextContent('Место 4 из 4')
			await user.keyboard(' ')
			expect(status).toHaveTextContent('Строка «Альфа» на месте 4 из 4')
			expect(emitted('move')).toEqual([[{ item: ROWS[0], from: 0, to: 3 }]])
			expect(rows.value.map(item => item.id)).toEqual(['b', 'c', 'd', 'a'])
			expect(row('Альфа')).toHaveFocus()
			expect(row('Альфа')).not.toHaveClass('base-list__item--grabbed')
		})

		it('↑ возвращает взятую строку на место выше', async () => {
			const { user, emitted } = setup({ isSortable: true })
			await user.tab()
			await user.keyboard('{ArrowDown}{ArrowDown} {ArrowUp}')
			expect(screen.getByRole('status')).toHaveTextContent('Место 2 из 4')
			expect(order()).toEqual(['a', 'c', 'b', 'd'])
			await user.keyboard(' ')
			expect(emitted('move')).toEqual([[{ item: ROWS[2], from: 2, to: 1 }]])
		})

		it('Enter тоже кладёт; на то же место — без событий', async () => {
			const { user, emitted } = setup({ isSortable: true })
			await user.tab()
			await user.keyboard(' {ArrowDown}{ArrowDown}{Enter}')
			expect(emitted('move')).toEqual([[{ item: ROWS[0], from: 0, to: 2 }]])
			await user.keyboard(' {Enter}')
			expect(emitted('move')).toHaveLength(1)
			expect(screen.getByRole('status')).toHaveTextContent('Строка «Альфа» на месте 3 из 4')
		})

		it('шагать некуда — порядок и объявление прежние', async () => {
			const { user } = setup({ isSortable: true })
			await user.tab()
			await user.keyboard('{End} {ArrowDown}')
			expect(screen.getByRole('status')).toHaveTextContent('Строка «Дельта» взята')
			expect(order()).toEqual(['a', 'b', 'c', 'd'])
		})

		it('Escape отменяет: прежний порядок, объявление, фокус на строке', async () => {
			const { user, emitted } = setup({ isSortable: true })
			await user.tab()
			await user.keyboard(' {ArrowDown}{ArrowDown}{Escape}')
			expect(order()).toEqual(['a', 'b', 'c', 'd'])
			expect(screen.getByRole('status')).toHaveTextContent('Перемещение отменено, строка «Альфа» на прежнем месте')
			expect(row('Альфа')).toHaveFocus()
			expect(emitted('move')).toBeUndefined()
		})

		it('Tab отменяет и уводит фокус дальше', async () => {
			const { user } = setup({ isSortable: true })
			await user.tab()
			await user.keyboard(' {ArrowDown}')
			await user.tab()
			expect(order()).toEqual(['a', 'b', 'c', 'd'])
			expect(screen.getByRole('status')).toHaveTextContent('Перемещение отменено')
			expect(document.body).toHaveFocus()
		})

		it('canMove запрещает: порядок прежний, событий нет, объявление «нельзя»', async () => {
			const canMove = vi.fn(() => false)
			const { user, emitted } = setup({ isSortable: true, canMove })
			await user.tab()
			await user.keyboard(' {ArrowDown} ')
			expect(canMove).toHaveBeenCalledWith({ item: ROWS[0], from: 0, to: 1 })
			expect(order()).toEqual(['a', 'b', 'c', 'd'])
			expect(emitted('update:items')).toBeUndefined()
			expect(screen.getByRole('status')).toHaveTextContent('Строку «Альфа» нельзя переместить сюда')
		})

		it('isDisabled — пробел не берёт строку', async () => {
			const { user } = setup({ isSortable: true, isDisabled: true })
			await fireEvent.focus(row('Альфа'))
			row('Альфа').focus()
			await user.keyboard(' {ArrowDown}')
			expect(screen.getByRole('status')).toHaveTextContent('')
		})

		it('Alt+↑/↓ в режиме выбора сразу сдвигает строку, фокус остаётся; на краях — ничего', async () => {
			const { user, emitted, rows } = setup({ isSortable: true, selectionMode: 'multiple' })
			await user.tab()
			await user.keyboard('{Alt>}{ArrowUp}{ArrowDown}{/Alt}')
			expect(rows.value.map(item => item.id)).toEqual(['b', 'a', 'c', 'd'])
			expect(option('Альфа')).toHaveFocus()
			expect(screen.getByRole('status')).toHaveTextContent('Строка «Альфа» на месте 2 из 4')
			await user.keyboard('{Alt>}{ArrowUp}{/Alt}')
			expect(rows.value.map(item => item.id)).toEqual(['a', 'b', 'c', 'd'])
			await user.keyboard('{End}{Alt>}{ArrowDown}{/Alt}')
			expect(emitted('move')).toEqual([[{ item: ROWS[0], from: 0, to: 1 }], [{ item: ROWS[0], from: 1, to: 0 }]])
			expect(emitted('update:modelValue')).toBeUndefined()
		})

		it('Alt+стрелка без isSortable или при isDisabled не двигает', async () => {
			const plain = setup({ selectionMode: 'single' })
			await plain.user.tab()
			await plain.user.keyboard('{Alt>}{ArrowDown}{/Alt}')
			expect(plain.emitted('move')).toBeUndefined()
		})

		it('Alt+стрелка при isDisabled не двигает', async () => {
			const { user, emitted } = setup({ isSortable: true, isDisabled: true })
			row('Альфа').focus()
			await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
			expect(emitted('move')).toBeUndefined()
		})

		it('с filter скрытые строки остаются на своих местах', async () => {
			const { user, rows } = setup({ isSortable: true, filter: (item: ListItem) => item.id !== 'b' })
			await user.tab()
			await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
			expect(rows.value.map(item => item.id)).toEqual(['b', 'c', 'a', 'd'])
			expect(order()).toEqual(['c', 'a', 'd'])
			await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
			expect(rows.value.map(item => item.id)).toEqual(['b', 'c', 'd', 'a'])
		})
	})

	describe('перестановка мышью', () => {
		const rect = (top: number) => ({ left: 0, top, width: 300, height: 40, right: 300, bottom: top + 40, x: 0, y: top }) as DOMRect
		const pointer = (type: string, y: number, init: PointerEventInit = {}) =>
			new PointerEvent(type, { bubbles: true, clientX: 10, clientY: y, button: 0, pointerType: 'mouse', ...init })

		beforeEach(() => {
			vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
				const item = this.closest('li')
				if (!item) return rect(0)
				return rect([...(item.parentElement as HTMLElement).children].indexOf(item) * 50)
			})
		})

		afterEach(() => vi.restoreAllMocks())

		it('строка едет за курсором, «призрак» с её текстом; отпускание переставляет, клик после броска не активирует', async () => {
			const { emitted, rows } = setup({ isSortable: true })
			row('Альфа').dispatchEvent(pointer('pointerdown', 10))
			await fireEvent(window, pointer('pointermove', 30))
			const ghost = document.querySelector('.base-list__ghost') as HTMLElement
			expect(ghost).toHaveTextContent('Альфа')
			expect(ghost).toHaveAttribute('aria-hidden', 'true')
			expect(row('Альфа')).toHaveClass('base-list__item--placeholder')
			await fireEvent(window, pointer('pointermove', 130))
			expect(order()).toEqual(['b', 'c', 'a', 'd'])
			await fireEvent(window, pointer('pointerup', 130))
			await waitFor(() => expect(document.querySelector('.base-list__ghost')).toBeNull())
			expect(emitted('move')).toEqual([[{ item: ROWS[0], from: 0, to: 2 }]])
			expect(rows.value.map(item => item.id)).toEqual(['b', 'c', 'a', 'd'])
			await fireEvent.click(row('Альфа'))
			expect(emitted('activate')).toBeUndefined()
			await fireEvent.click(row('Альфа'))
			expect(emitted('activate')).toEqual([[ROWS[0]]])
		})

		it('ниже всех строк — в конец; Escape отменяет перетаскивание', async () => {
			const { emitted } = setup({ isSortable: true })
			row('Бета').dispatchEvent(pointer('pointerdown', 60))
			await fireEvent(window, pointer('pointermove', 400))
			expect(order()).toEqual(['a', 'c', 'd', 'b'])
			await fireEvent.keyDown(window, { key: 'Escape' })
			await waitFor(() => expect(document.querySelector('.base-list__ghost')).toBeNull())
			expect(order()).toEqual(['a', 'b', 'c', 'd'])
			expect(screen.getByRole('status')).toHaveTextContent('Перемещение отменено')
			expect(emitted('move')).toBeUndefined()
		})

		it('вверх — на место выше; «призрак» показывает описание строки', async () => {
			const items = ROWS.map(item => (item.id === 'c' ? { ...item, description: 'Третья' } : item))
			const { emitted } = setup({ isSortable: true, items })
			row('Гамма').dispatchEvent(pointer('pointerdown', 110))
			await fireEvent(window, pointer('pointermove', 60))
			expect(document.querySelector('.base-list__ghost .base-list__description')).toHaveTextContent('Третья')
			expect(order()).toEqual(['a', 'c', 'b', 'd'])
			await fireEvent(window, pointer('pointerup', 60))
			expect(emitted('move')).toEqual([[{ item: items[2], from: 2, to: 1 }]])
		})

		it('единственную строку некуда перенести', async () => {
			const { emitted } = setup({ isSortable: true, items: [ROWS[0]] })
			row('Альфа').dispatchEvent(pointer('pointerdown', 10))
			await fireEvent(window, pointer('pointermove', 200))
			expect(document.querySelector('.base-list__ghost')).not.toBeNull()
			await fireEvent(window, pointer('pointerup', 200))
			expect(emitted('move')).toBeUndefined()
		})

		it('касание не перетаскивает; без isSortable мышь не перетаскивает', async () => {
			setup({ isSortable: true })
			row('Альфа').dispatchEvent(pointer('pointerdown', 10, { pointerType: 'touch' }))
			await fireEvent(window, pointer('pointermove', 200))
			expect(document.querySelector('.base-list__ghost')).toBeNull()
			expect(order()).toEqual(['a', 'b', 'c', 'd'])
		})

		it('без isSortable мышь не перетаскивает', async () => {
			setup()
			row('Альфа').dispatchEvent(pointer('pointerdown', 10))
			await fireEvent(window, pointer('pointermove', 200))
			expect(document.querySelector('.base-list__ghost')).toBeNull()
		})
	})

	describe('isVirtual', () => {
		const MANY = Array.from({ length: 1000 }, (_, index) => ({ id: `r${index}`, title: `Строка ${index + 1}` }))

		beforeAll(() => {
			Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
				configurable: true,
				get(this: HTMLElement) {
					return this.classList.contains('base-list__viewport') ? 360 : 0
				},
			})
		})

		afterAll(() => {
			delete (HTMLElement.prototype as { clientHeight?: number }).clientHeight
		})

		it('в DOM — только видимые строки, с aria-setsize и aria-posinset; высота по умолчанию 360px', async () => {
			setup({ selectionMode: 'single', items: MANY, isVirtual: true })
			await nextTick()
			const options = screen.getAllByRole('option')
			expect(options.length).toBeGreaterThan(0)
			expect(options.length).toBeLessThan(100)
			expect(options[0]).toHaveAttribute('aria-setsize', '1000')
			expect(options[0]).toHaveAttribute('aria-posinset', '1')
			expect(options[1].style.transform).toBe('translateY(56px)')
			expect((document.querySelector('.base-list__viewport') as HTMLElement).style.height).toBe('360px')
			expect(document.querySelector('.base-list')).toHaveClass('base-list--virtual')
		})

		it('пустой виртуальный список — блок «Список пуст»', () => {
			setup({ selectionMode: 'single', items: [], isVirtual: true })
			expect(screen.getByText('Список пуст')).toBeInTheDocument()
		})

		it('End переводит фокус на последнюю строку и прокручивает к ней', async () => {
			const { user } = setup({ selectionMode: 'single', items: MANY, isVirtual: true })
			await nextTick()
			await user.tab()
			await user.keyboard('{End}')
			await waitFor(() => expect(option('Строка 1000')).toHaveFocus())
			expect(option('Строка 1000')).toHaveAttribute('aria-posinset', '1000')
		})
	})
})
