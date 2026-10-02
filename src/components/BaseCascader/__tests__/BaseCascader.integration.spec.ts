import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseCascader from '../ui/BaseCascader.vue'
import userEvent from '@testing-library/user-event'
import { UI_ARIA, UI_TEXT } from '@/locales/messages'
import { deferred, flush, REGIONS } from './cascaderFixtures'
import type { BaseCascaderNode } from '../types/BaseCascader.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'

function setup(props: Record<string, unknown> = {}) {
	const user = userEvent.setup()
	const view = render(BaseCascader, { props: { items: REGIONS, label: 'Регион', ...props } })
	const field = screen.getByRole('combobox', { name: 'Регион' })
	return { user, field, ...view }
}

const activeOption = (field: HTMLElement): HTMLElement | null => document.getElementById(field.getAttribute('aria-activedescendant') ?? '')

const columns = (): HTMLElement[] => screen.queryAllByRole('listbox')

async function openWithKeyboard(user: ReturnType<typeof userEvent.setup>, field: HTMLElement, key = '{ArrowDown}'): Promise<void> {
	field.focus()
	await user.keyboard(key)
}

describe('BaseCascader integration', () => {
	describe('клавиатура', () => {
		it.each(['{ArrowDown}', '{ArrowUp}', '{Enter}', ' '])('%s открывает панель на первом доступном узле', async key => {
			const { user, field } = setup()
			await openWithKeyboard(user, field, key)
			expect(field).toHaveAttribute('aria-expanded', 'true')
			expect(field).toHaveAttribute('aria-controls', columns()[0].id)
			expect(columns()[0]).toHaveAccessibleName('Регион')
			expect(activeOption(field)).toHaveTextContent('Россия')
		})

		it('стрелки двигают активный узел без зацикливания и пропускают отключённые', async () => {
			const { user, field } = setup()
			await openWithKeyboard(user, field)
			await user.keyboard('{ArrowUp}')
			expect(activeOption(field)).toHaveTextContent('Россия')
			await user.keyboard('{ArrowDown}{ArrowDown}')
			expect(activeOption(field)).toHaveTextContent('Армения')
			await user.keyboard('{ArrowDown}')
			expect(activeOption(field)).toHaveTextContent('Армения')
			await user.keyboard('{ArrowUp}')
			expect(activeOption(field)).toHaveTextContent('Казахстан')
		})

		it('Home и End открывают панель и ставят первый и последний доступный узел', async () => {
			const { user, field } = setup()
			await openWithKeyboard(user, field, '{End}')
			expect(activeOption(field)).toHaveTextContent('Армения')
			await user.keyboard('{Home}')
			expect(activeOption(field)).toHaveTextContent('Россия')
		})

		it('ArrowRight раскрывает узел и переходит в следующую колонку, ArrowLeft возвращает', async () => {
			const { user, field } = setup()
			await openWithKeyboard(user, field)
			await user.keyboard('{ArrowRight}')
			await flush()
			expect(columns()).toHaveLength(2)
			expect(columns()[1]).toHaveAccessibleName('Россия')
			expect(field).toHaveAttribute('aria-controls', columns()[1].id)
			expect(activeOption(field)).toHaveTextContent('Москва')
			await user.keyboard('{ArrowLeft}')
			expect(activeOption(field)).toHaveTextContent('Россия')
			expect(columns()).toHaveLength(2)
			await user.keyboard('{ArrowLeft}')
			expect(activeOption(field)).toHaveTextContent('Россия')
			await user.keyboard('{ArrowDown}')
			expect(columns()).toHaveLength(1)
		})

		it('ArrowRight на конечном узле ничего не делает, ArrowLeft и ArrowRight на закрытом — тоже', async () => {
			const { user, field } = setup()
			field.focus()
			await user.keyboard('{ArrowRight}{ArrowLeft}')
			expect(field).toHaveAttribute('aria-expanded', 'false')
			await user.keyboard('{End}{ArrowRight}')
			await flush()
			expect(columns()).toHaveLength(1)
		})

		it('Enter на узле с детьми раскрывает его, на конечном — выбирает путь и закрывает', async () => {
			const { user, field, emitted } = setup()
			await openWithKeyboard(user, field)
			await user.keyboard('{Enter}')
			await flush()
			await user.keyboard('{Enter}')
			await flush()
			expect(activeOption(field)).toHaveTextContent('Тверской')
			await user.keyboard('{Enter}')
			expect(emitted()['update:modelValue']).toEqual([[['ru', 'msk', 'tverskoy']]])
			expect(emitted().change).toEqual([[['ru', 'msk', 'tverskoy']]])
			expect(field).toHaveAttribute('aria-expanded', 'false')
			expect(field).toHaveFocus()
		})

		it('пробел на открытой панели выбирает конечный узел', async () => {
			const { user, field, emitted } = setup()
			await openWithKeyboard(user, field, '{End}')
			await user.keyboard(' ')
			expect(emitted()['update:modelValue']).toEqual([[['am']]])
		})

		it('Enter и Home без доступных узлов ничего не делают', async () => {
			const { user, field, emitted } = setup({ items: [{ id: 'x', label: 'Закрыт', isDisabled: true }] })
			await openWithKeyboard(user, field)
			await user.keyboard('{Home}{End}{Enter}')
			expect(field).not.toHaveAttribute('aria-activedescendant')
			expect(emitted()['update:modelValue']).toBeUndefined()
		})

		it('Tab закрывает панель', async () => {
			const { user, field } = setup()
			await openWithKeyboard(user, field)
			await user.tab()
			expect(field).toHaveAttribute('aria-expanded', 'false')
		})

		it('Tab на закрытом поле уходит дальше без действий', async () => {
			const { user, field, emitted } = setup()
			field.focus()
			await user.tab()
			expect(emitted()['update:modelValue']).toBeUndefined()
		})

		it('Escape закрывает панель', async () => {
			const { user, field } = setup()
			await openWithKeyboard(user, field)
			await user.keyboard('{Escape}')
			await nextTick()
			expect(field).toHaveAttribute('aria-expanded', 'false')
		})

		it('прочие клавиши не перехватываются', async () => {
			const { field } = setup()
			field.focus()
			const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true })
			field.dispatchEvent(event)
			expect(event.defaultPrevented).toBe(false)
		})

		it('открытие показывает колонки выбранного пути и делает активным выбранный узел', async () => {
			const { user, field } = setup({ modelValue: ['ru', 'msk', 'khamovniki'] })
			await openWithKeyboard(user, field)
			await flush()
			expect(columns()).toHaveLength(3)
			expect(activeOption(field)).toHaveTextContent('Хамовники')
			expect(activeOption(field)).toHaveAttribute('aria-selected', 'true')
			expect(within(columns()[0]).getByRole('option', { name: 'Россия' })).toHaveClass('base-cascader__option--expanded')
		})

		it('путь со стёртым узлом раскрывается до последнего найденного узла', async () => {
			const { user, field } = setup({ modelValue: ['ru', 'gone', 'x'] })
			await openWithKeyboard(user, field)
			await flush()
			expect(columns()).toHaveLength(2)
			expect(activeOption(field)).toHaveTextContent('Россия')
		})

		it('путь через узел без детей останавливается на нём', async () => {
			const { user, field } = setup({ modelValue: ['am', 'x'] })
			await openWithKeyboard(user, field)
			await flush()
			expect(columns()).toHaveLength(1)
			expect(activeOption(field)).toHaveTextContent('Армения')
		})
	})

	describe('мышь', () => {
		it('щелчок открывает и закрывает панель', async () => {
			const { user, field } = setup()
			await user.click(field)
			expect(field).toHaveAttribute('aria-expanded', 'true')
			await user.click(field)
			expect(field).toHaveAttribute('aria-expanded', 'false')
		})

		it('щелчок по узлу с детьми раскрывает колонку, по конечному — выбирает', async () => {
			const { user, field, emitted } = setup()
			await user.click(field)
			await user.click(screen.getByRole('option', { name: 'Казахстан' }))
			await flush()
			expect(columns()).toHaveLength(2)
			expect(activeOption(field)).toHaveTextContent('Казахстан')
			await user.click(screen.getByRole('option', { name: 'Алматы' }))
			expect(emitted()['update:modelValue']).toEqual([[['kz', 'almaty']]])
			expect(field).toHaveAttribute('aria-expanded', 'false')
		})

		it('отключённый узел не выбирается и не раскрывается', async () => {
			const { user, field, emitted } = setup()
			await user.click(field)
			const disabled = screen.getByRole('option', { name: 'Беларусь' })
			expect(disabled).toHaveAttribute('aria-disabled', 'true')
			await user.click(disabled)
			await flush()
			expect(columns()).toHaveLength(1)
			expect(emitted()['update:modelValue']).toBeUndefined()
		})

		it('наведение делает узел активным', async () => {
			const { user, field } = setup()
			await user.click(field)
			await user.hover(screen.getByRole('option', { name: 'Армения' }))
			expect(activeOption(field)).toHaveTextContent('Армения')
			await fireEvent.mouseMove(screen.getByRole('option', { name: 'Армения' }))
			expect(activeOption(field)).toHaveTextContent('Армения')
		})

		it('щелчок мимо закрывает панель', async () => {
			const { user, field } = setup()
			await user.click(field)
			await user.click(document.body)
			expect(field).toHaveAttribute('aria-expanded', 'false')
		})
	})

	describe('isAnyLevel', () => {
		it('Enter на узле с детьми выбирает его и раскрывает, панель остаётся открытой', async () => {
			const { user, field, emitted } = setup({ isAnyLevel: true })
			await openWithKeyboard(user, field)
			await user.keyboard('{Enter}')
			await flush()
			expect(emitted()['update:modelValue']).toEqual([[['ru']]])
			expect(field).toHaveAttribute('aria-expanded', 'true')
			expect(columns()).toHaveLength(2)
			expect(activeOption(field)).toHaveTextContent('Россия')
		})
	})

	describe('isMultiple', () => {
		it('выбор переключает пути, панель не закрывается, у выбираемых — флажки', async () => {
			const { user, field, emitted, rerender } = setup({ isMultiple: true, modelValue: [] })
			await user.click(field)
			expect(columns()[0]).toHaveAttribute('aria-multiselectable', 'true')
			await user.click(screen.getByRole('option', { name: 'Армения' }))
			expect(emitted()['update:modelValue']).toEqual([[[['am']]]])
			expect(field).toHaveAttribute('aria-expanded', 'true')
			await rerender({ items: REGIONS, label: 'Регион', isMultiple: true, modelValue: [['am']] })
			const armenia = screen.getByRole('option', { name: 'Армения' })
			expect(armenia).toHaveAttribute('aria-selected', 'true')
			expect(armenia.querySelector('.base-cascader__checkbox')).toBeInTheDocument()
			expect(screen.getByRole('option', { name: 'Россия' }).querySelector('.base-cascader__checkbox')).toBeNull()
			await user.click(armenia)
			expect(emitted()['update:modelValue'][1]).toEqual([[]])
		})
		it('поле выросло от новых меток — панель сама переезжает под него (наблюдатель размера BaseDropdown)', async () => {
			const observers: { callback: () => void; targets: Element[] }[] = []
			vi.stubGlobal(
				'ResizeObserver',
				class {
					callback: () => void
					targets: Element[] = []
					constructor(callback: () => void) {
						this.callback = callback
						observers.push(this)
					}
					observe(target: Element) {
						this.targets.push(target)
					}
					disconnect() {}
				},
			)
			const { user, field, rerender } = setup({ isMultiple: true, modelValue: [] })
			await user.click(field)
			await nextTick()
			const wrapper = field.closest('.base-dropdown') as HTMLElement
			const panel = document.querySelector('.base-dropdown__panel') as HTMLElement
			const observer = observers.find(item => item.targets.includes(wrapper))
			expect(observer).toBeDefined()
			const before = panel.style.top

			await rerender({ items: REGIONS, label: 'Регион', isMultiple: true, modelValue: [['am']] })
			;(wrapper.firstElementChild as HTMLElement).getBoundingClientRect = () =>
				DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 80 })
			observer?.callback()
			await nextTick()
			expect(panel.style.top).not.toBe(before)
			vi.unstubAllGlobals()
		})
	})

	describe('ленивые уровни', () => {
		it('успех: загрузка, дети, переход в колонку; повторное раскрытие не грузит снова', async () => {
			const pending = deferred<BaseCascaderNode[]>()
			const load = vi.fn(() => pending.promise)
			const { user, field } = setup({ items: [{ id: 'ru', label: 'Россия' }], load })
			await openWithKeyboard(user, field)
			await user.keyboard('{ArrowRight}')
			await flush()
			expect(load).toHaveBeenCalledWith(expect.objectContaining({ id: 'ru' }))
			expect(screen.getByRole('status', { name: /Загрузка/ })).toBeInTheDocument()
			expect(activeOption(field)).toHaveTextContent('Россия')
			await user.keyboard('{ArrowRight}')
			expect(load).toHaveBeenCalledTimes(1)
			pending.resolve([{ id: 'msk', label: 'Москва', isLeaf: true }])
			await flush()
			expect(screen.queryByRole('status')).not.toBeInTheDocument()
			expect(activeOption(field)).toHaveTextContent('Москва')
			await user.keyboard('{ArrowLeft}{ArrowDown}{ArrowUp}{ArrowRight}')
			await flush()
			expect(load).toHaveBeenCalledTimes(1)
			expect(activeOption(field)).toHaveTextContent('Москва')
		})

		it('ошибка: текст, событие load-error, «Повторить» загружает снова', async () => {
			const error = new Error('сеть')
			const load = vi
				.fn()
				.mockRejectedValueOnce(error)
				.mockResolvedValueOnce([{ id: 'msk', label: 'Москва', isLeaf: true }])
			const { user, field, emitted } = setup({ items: [{ id: 'ru', label: 'Россия' }], load })
			await user.click(field)
			await user.click(screen.getByRole('option', { name: 'Россия' }))
			await flush()
			expect(screen.getByRole('alert')).toHaveTextContent(UI_TEXT.LOAD_ERROR)
			expect(emitted()['load-error']).toEqual([[expect.objectContaining({ id: 'ru' }), error]])
			await user.click(screen.getByRole('button', { name: UI_TEXT.RETRY }))
			await flush()
			expect(load).toHaveBeenCalledTimes(2)
			expect(screen.queryByRole('alert')).not.toBeInTheDocument()
			expect(activeOption(field)).toHaveTextContent('Москва')
		})

		it('ошибка: ArrowRight на узле повторяет загрузку', async () => {
			const load = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce([])
			const { user, field } = setup({ items: [{ id: 'ru', label: 'Россия' }], load })
			await openWithKeyboard(user, field)
			await user.keyboard('{ArrowRight}')
			await flush()
			expect(activeOption(field)).toHaveTextContent('Россия')
			expect(screen.getByRole('alert')).toBeInTheDocument()
			await user.keyboard('{ArrowRight}')
			await flush()
			expect(load).toHaveBeenCalledTimes(2)
			expect(screen.getByText(UI_TEXT.EMPTY)).toBeInTheDocument()
		})

		it('isLeaf и отсутствие load: узел конечный, выбирается сразу', async () => {
			const load = vi.fn()
			const { user, field, emitted } = setup({ items: [{ id: 'am', label: 'Армения', isLeaf: true }], load })
			await openWithKeyboard(user, field)
			await user.keyboard('{Enter}')
			expect(load).not.toHaveBeenCalled()
			expect(emitted()['update:modelValue']).toEqual([[['am']]])
		})

		it('открытие с выбранным путём загружает уровни по пути', async () => {
			const load = vi.fn(async (node: BaseCascaderNode) =>
				node.id === 'ru' ? [{ id: 'msk', label: 'Москва' }] : [{ id: 'tverskoy', label: 'Тверской', isLeaf: true }],
			)
			const { user, field } = setup({ items: [{ id: 'ru', label: 'Россия' }], load, modelValue: ['ru', 'msk', 'tverskoy'] })
			expect(field).toHaveTextContent('Россия / msk / tverskoy')
			await openWithKeyboard(user, field)
			await flush()
			await flush()
			expect(load).toHaveBeenCalledTimes(2)
			expect(columns()).toHaveLength(3)
			expect(activeOption(field)).toHaveTextContent('Тверской')
			expect(field).toHaveTextContent('Россия / Москва / Тверской')
		})

		it('переход к другому узлу во время загрузки не уводит в загруженную колонку', async () => {
			const pending = deferred<BaseCascaderNode[]>()
			const { user, field } = setup({
				items: [
					{ id: 'ru', label: 'Россия' },
					{ id: 'am', label: 'Армения', isLeaf: true },
				],
				load: () => pending.promise,
			})
			await openWithKeyboard(user, field)
			await user.keyboard('{ArrowRight}{ArrowDown}')
			pending.resolve([{ id: 'msk', label: 'Москва' }])
			await flush()
			expect(activeOption(field)).toHaveTextContent('Армения')
		})

		it('движение по колонке во время раскрытия пути отменяет раскрытие', async () => {
			const pending = deferred<BaseCascaderNode[]>()
			const { user, field } = setup({
				items: [
					{ id: 'ru', label: 'Россия' },
					{ id: 'am', label: 'Армения', isLeaf: true },
				],
				load: () => pending.promise,
				modelValue: ['ru', 'msk'],
			})
			await openWithKeyboard(user, field, '{Enter}')
			await user.keyboard('{ArrowDown}')
			pending.resolve([{ id: 'msk', label: 'Москва', isLeaf: true }])
			await flush()
			expect(columns()).toHaveLength(1)
			expect(activeOption(field)).toHaveTextContent('Армения')
		})

		it('isLoading: корневая колонка — загрузка, поле — aria-busy', async () => {
			const { user, field } = setup({ items: [], isLoading: true })
			await user.click(field)
			expect(screen.getByRole('status', { name: /Загрузка/ })).toBeInTheDocument()
			expect(field.getAttribute('aria-controls')).toMatch(/-panel$/)
			expect(document.getElementById(field.getAttribute('aria-controls') ?? '')).toBeInTheDocument()
			expect(field).not.toHaveAttribute('aria-activedescendant')
		})

		it('смена items при открытой панели сбрасывает активный узел на доступный', async () => {
			const { user, field, rerender } = setup()
			await openWithKeyboard(user, field, '{End}')
			await rerender({ items: [{ id: 'x', label: 'Новый' }], label: 'Регион' })
			await nextTick()
			expect(activeOption(field)).toHaveTextContent('Новый')
		})

		it('схлопывание колонок при открытой панели возвращает активный уровень', async () => {
			const { user, field, rerender } = setup()
			await openWithKeyboard(user, field)
			await user.keyboard('{ArrowRight}')
			await flush()
			await rerender({ items: [{ id: 'x', label: 'Новый' }], label: 'Регион' })
			await nextTick()
			expect(columns()).toHaveLength(1)
			expect(activeOption(field)).toHaveTextContent('Новый')
		})
	})

	describe('пустые состояния', () => {
		it('нет узлов — «Нет данных»; слот empty заменяет текст', async () => {
			const { user, field, unmount } = setup({ items: [] })
			await user.click(field)
			expect(screen.getByText(UI_TEXT.EMPTY)).toBeInTheDocument()
			unmount()
			render(BaseCascader, { props: { items: [], label: 'Пусто' }, slots: { empty: '<span>Регионов нет</span>' } })
			await user.click(screen.getByRole('combobox', { name: 'Пусто' }))
			expect(screen.getByText('Регионов нет')).toBeInTheDocument()
		})

		it('слот option заменяет строку узла', async () => {
			const user = userEvent.setup()
			render(BaseCascader, {
				props: { items: REGIONS, label: 'Регион' },
				slots: {
					option: `<template #option="{ node, isSelected, hasChildren }">{{ node.label }}:{{ isSelected }}:{{ hasChildren }}</template>`,
				},
			})
			await user.click(screen.getByRole('combobox'))
			expect(screen.getByRole('option', { name: 'Россия:false:true' })).toBeInTheDocument()
		})

		it('значок и описание узла', async () => {
			const { user, field } = setup({ modelValue: ['ru', 'msk', 'tverskoy'] })
			await user.click(field)
			await flush()
			expect(screen.getByText('Центр')).toBeInTheDocument()
			expect(
				within(columns()[0]).getByRole('option', { name: 'Казахстан' }).querySelector('.base-cascader__option-icon'),
			).toBeInTheDocument()
		})

		it('повторный id и цикл не показываются дважды', async () => {
			const loop: BaseCascaderNode = { id: 'loop', label: 'Петля', children: [] }
			loop.children = [loop, { id: 'leaf', label: 'Лист' }]
			const { user, field } = setup({ items: [loop, { id: 'loop', label: 'Дубль' }] })
			await user.click(field)
			expect(within(columns()[0]).getAllByRole('option')).toHaveLength(1)
			await user.click(screen.getByRole('option', { name: 'Петля' }))
			await flush()
			expect(
				within(columns()[1])
					.getAllByRole('option')
					.map(option => option.textContent?.trim()),
			).toEqual(['Лист'])
		})
	})

	describe('поиск', () => {
		it('поле поиска в фокусе, результаты — пути конечных узлов; Enter выбирает', async () => {
			const { user, field, emitted } = setup({ isSearchable: true })
			await user.click(field)
			const search = screen.getByRole('textbox', { name: UI_ARIA.SEARCH })
			expect(search).toHaveFocus()
			await user.type(search, 'ар')
			const results = screen.getByRole('listbox', { name: UI_ARIA.SEARCH })
			expect(
				within(results)
					.getAllByRole('option')
					.map(option => option.textContent?.trim()),
			).toEqual(['Россия / Москва / Арбат', 'Армения'])
			expect(search).toHaveAttribute('aria-controls', results.id)
			expect(activeOption(search)).toHaveTextContent('Армения')
			expect(screen.getByRole('option', { name: 'Россия / Москва / Арбат' })).toHaveAttribute('aria-disabled', 'true')
			await user.keyboard('{ArrowUp}{ArrowDown}{ArrowDown}{Enter}')
			expect(emitted()['update:modelValue']).toEqual([[['am']]])
			expect(field).toHaveAttribute('aria-expanded', 'false')
		})

		it('ищет по описанию; узлы с детьми — только при isAnyLevel', async () => {
			const { user, field, rerender } = setup({ isSearchable: true })
			await user.click(field)
			await user.type(screen.getByRole('textbox'), 'центр')
			expect(screen.getByRole('option', { name: /Хамовники/ })).toBeInTheDocument()
			await user.clear(screen.getByRole('textbox'))
			await user.type(screen.getByRole('textbox'), 'моск')
			expect(screen.getByText(UI_TEXT.NO_RESULTS)).toBeInTheDocument()
			await rerender({ items: REGIONS, label: 'Регион', isSearchable: true, isAnyLevel: true })
			expect(screen.getByRole('option', { name: 'Россия / Москва' })).toBeInTheDocument()
		})

		it('щелчок по результату выбирает, по отключённому — нет; наведение делает активным', async () => {
			const { user, field, emitted } = setup({ isSearchable: true, isMultiple: true, modelValue: [] })
			await user.click(field)
			await user.type(screen.getByRole('textbox'), 'ар')
			await user.hover(screen.getByRole('option', { name: 'Россия / Москва / Арбат' }))
			expect(activeOption(screen.getByRole('textbox'))).toHaveTextContent('Армения')
			await user.click(screen.getByRole('option', { name: 'Россия / Москва / Арбат' }))
			expect(emitted()['update:modelValue']).toBeUndefined()
			await user.hover(screen.getByRole('option', { name: 'Армения' }))
			await user.click(screen.getByRole('option', { name: 'Армения' }))
			expect(emitted()['update:modelValue']).toEqual([[[['am']]]])
			expect(field).toHaveAttribute('aria-expanded', 'true')
			expect(screen.getByRole('listbox', { name: UI_ARIA.SEARCH })).toHaveAttribute('aria-multiselectable', 'true')
		})

		it('стрелки ходят по результатам, наведение делает результат активным', async () => {
			const { user, field } = setup({ isSearchable: true })
			await user.click(field)
			const search = screen.getByRole('textbox')
			await user.type(search, 'ск')
			expect(activeOption(search)).toHaveTextContent('Россия / Москва / Тверской')
			await user.keyboard('{ArrowDown}')
			expect(activeOption(search)).toHaveTextContent('Россия / Санкт-Петербург / Невский')
			await user.keyboard('{ArrowUp}')
			expect(activeOption(search)).toHaveTextContent('Россия / Москва / Тверской')
			await user.hover(screen.getByRole('option', { name: 'Россия / Санкт-Петербург / Невский' }))
			expect(activeOption(search)).toHaveTextContent('Россия / Санкт-Петербург / Невский')
		})

		it('Enter без результатов ничего не выбирает; стрелки без результатов не двигают', async () => {
			const { user, field, emitted } = setup({ isSearchable: true })
			await user.click(field)
			await user.type(screen.getByRole('textbox'), 'zzz{ArrowDown}{Enter}')
			expect(emitted()['update:modelValue']).toBeUndefined()
			expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-activedescendant')
		})

		it('пустой запрос: стрелки из поля поиска ходят по колонкам, пробел и Home печатаются', async () => {
			const { user, field } = setup({ isSearchable: true })
			await user.click(field)
			const search = screen.getByRole('textbox')
			await user.keyboard('{ArrowRight}')
			await flush()
			expect(activeOption(search)).toHaveTextContent('Москва')
			await user.keyboard(' ')
			expect(search).toHaveValue(' ')
			await user.keyboard('{Home}')
			expect(activeOption(search)).toHaveTextContent('Москва')
		})

		it('Tab в поле поиска закрывает панель; закрытие очищает запрос', async () => {
			const { user, field } = setup({ isSearchable: true })
			await user.click(field)
			await user.type(screen.getByRole('textbox'), 'ар')
			await user.tab()
			expect(field).toHaveAttribute('aria-expanded', 'false')
			await user.click(field)
			expect(screen.getByRole('textbox')).toHaveValue('')
		})
	})
})
