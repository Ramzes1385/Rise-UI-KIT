import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import BaseList from '../ui/BaseList.vue'
import { createUiKitPlugin } from '@/plugin'
import { mergeShown } from '../model/order/listOrder'
import type { BaseListExpose, ListItem } from '../types/BaseList.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const items: ListItem[] = [
	{ id: 'a', title: 'Альфа' },
	{ id: 'b', title: 'Бета' },
]

const ROWS: ListItem[] = [
	{ id: 'a', title: 'Альфа', description: 'Первая', meta: '12' },
	{ id: 'b', title: 'Бета', icon: 'check' },
	{ id: 'c', title: 'Гамма', avatar: 'https://example.test/c.png' },
	{ id: 'd', title: 'Дельта', isDisabled: true },
]

const EVENTS = ['update:modelValue', 'update:items', 'move', 'activate']

function setup(props: Record<string, unknown> = {}, slots = '') {
	const api = ref<BaseListExpose | null>(null)
	const log: Record<string, unknown[][]> = {}
	const handlers = Object.fromEntries(EVENTS.map(name => [name, (...args: unknown[]) => (log[name] ??= []).push(args)]))
	const result = render({
		components: { BaseList },
		setup: () => ({ api, handlers, props: { items: ROWS, ariaLabel: 'Разделы', ...props } }),
		template: `<BaseList ref="api" v-bind="props" v-on="handlers">${slots}</BaseList>`,
	})
	return { ...result, emitted: (name: string) => log[name], api: () => api.value as BaseListExpose }
}

const ids = (role: string) => screen.getAllByRole(role).map(row => row.dataset.listId)

describe('BaseList unit', () => {
	it('связывает подпись со списком выбора', () => {
		render(BaseList, { props: { items, label: 'Разделы', selectionMode: 'single' } })
		expect(screen.getByRole('listbox', { name: 'Разделы' })).toBeInTheDocument()
		expect(screen.getByText('Разделы')).toHaveClass('base-list__label')
	})

	it('эмитит update:modelValue при клике по строке', async () => {
		const { emitted } = render(BaseList, { props: { items, label: 'Разделы', selectionMode: 'single' } })
		await fireEvent.click(screen.getByRole('option', { name: 'Бета' }))
		expect(emitted()['update:modelValue']).toEqual([['b']])
	})

	it('связывает ошибку со списком и помечает его невалидным', () => {
		render(BaseList, { props: { items, label: 'Разделы', selectionMode: 'single', error: 'Выберите раздел' } })
		const list = screen.getByRole('listbox')
		expect(list).toHaveAccessibleDescription('Выберите раздел')
		expect(list).toHaveAttribute('aria-invalid', 'true')
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseList, { props: { items, variant: 'soft' } })
		expect(container.querySelector('.base-list')).toHaveClass('base-list--soft')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseList, { props: { items, sizeScale: 125 } })
		expect((container.querySelector('.base-list') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseList, { props: { items, customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-list')).toHaveClass('my-root')
	})

	it('без выбора — обычный список: list и listitem без aria-selected, имя из ariaLabel', () => {
		setup()
		const list = screen.getByRole('list', { name: 'Разделы' })
		expect(list).not.toHaveAttribute('aria-multiselectable')
		const rows = within(list).getAllByRole('listitem')
		expect(rows).toHaveLength(4)
		expect(rows[0]).not.toHaveAttribute('aria-selected')
		expect(screen.queryByRole('listbox')).toBeNull()
	})

	it('одиночный выбор: option с aria-selected по v-model, без aria-multiselectable', () => {
		setup({ selectionMode: 'single', modelValue: 'b' })
		expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-multiselectable')
		expect(screen.getByRole('option', { name: 'Бета' })).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByRole('option', { name: /Альфа/ })).toHaveAttribute('aria-selected', 'false')
		expect(screen.getByRole('option', { name: 'Бета' })).toHaveClass('base-list__item--selected')
	})

	it('множественный выбор: aria-multiselectable и несколько выбранных', () => {
		setup({ selectionMode: 'multiple', modelValue: ['a', 'c'] })
		expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
		expect(screen.getAllByRole('option', { selected: true }).map(option => option.dataset.listId)).toEqual(['a', 'c'])
	})

	it('недоступная строка помечена aria-disabled; isDisabled выключает список и все строки', () => {
		const { unmount } = setup({ selectionMode: 'single' })
		expect(screen.getByRole('option', { name: 'Дельта' })).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByRole('option', { name: 'Бета' })).not.toHaveAttribute('aria-disabled')
		expect(screen.getByRole('listbox')).not.toHaveAttribute('aria-disabled')
		unmount()

		const { container } = setup({ selectionMode: 'single', isDisabled: true })
		expect(screen.getByRole('listbox')).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getAllByRole('option').every(option => option.getAttribute('aria-disabled') === 'true')).toBe(true)
		expect(container.querySelector('.base-list')).toHaveClass('base-list--disabled')
	})

	it('в режиме none ошибка видна, но aria-invalid и aria-disabled у списка нет', () => {
		const { container } = setup({ error: 'Ошибка', isDisabled: true })
		const list = screen.getByRole('list')
		expect(screen.getByText('Ошибка')).toBeInTheDocument()
		expect(list).not.toHaveAttribute('aria-invalid')
		expect(list).not.toHaveAttribute('aria-disabled')
		expect(container.querySelector('.base-list')).toHaveClass('base-list--error')
	})

	it('строка: описание, meta, значок, аватар; галочка — только при выборе', () => {
		const { container, unmount } = setup()
		expect(screen.getByText('Первая')).toHaveClass('base-list__description')
		expect(screen.getByText('12')).toHaveClass('base-list__meta')
		const prefixes = container.querySelectorAll('.base-list__prefix')
		expect(prefixes).toHaveLength(2)
		expect(prefixes[1].querySelector('.base-avatar')).toBeTruthy()
		expect(container.querySelector('.base-list__check')).toBeNull()
		unmount()

		const selectable = setup({ selectionMode: 'single' })
		expect(selectable.container.querySelectorAll('.base-list__check')).toHaveLength(4)
	})

	it('пустой список: без ul, текст «Список пуст»; слот empty его заменяет', () => {
		const { container, unmount } = setup({ items: [] })
		expect(container.querySelector('ul')).toBeNull()
		expect(screen.getByText('Список пуст')).toHaveClass('base-list__empty')
		unmount()

		setup({ items: [] }, '<template #empty>Ничего нет</template>')
		expect(screen.getByText('Ничего нет')).toBeInTheDocument()
	})

	it('emptyText заменяет текст по умолчанию', () => {
		setup({ items: [], emptyText: 'Нет папок' })
		expect(screen.getByText('Нет папок')).toBeInTheDocument()
		expect(screen.queryByText('Список пуст')).toBeNull()
	})

	it('слот prefix получает индекс строки', () => {
		setup({}, `<template #prefix="{ index }"><b>#{{ index }}</b></template>`)
		expect(screen.getAllByText(/^#\d$/).map(node => node.textContent)).toEqual(['#0', '#1', '#2', '#3'])
	})

	it('слот item заменяет содержимое строки и знает, выбрана ли она', () => {
		setup(
			{ selectionMode: 'single', modelValue: 'b' },
			`<template #item="{ item, isSelected, isDragging }">{{ item.title }}:{{ isSelected }}:{{ isDragging }}</template>`,
		)
		expect(screen.getByRole('option', { name: 'Бета:true:false' })).toBeInTheDocument()
		expect(screen.getByRole('option', { name: 'Альфа:false:false' })).toBeInTheDocument()
	})

	it('слот actions — только в режиме none; клик, нажатие и клавиши в нём не доходят до строки', async () => {
		const { emitted, unmount } = setup(
			{ isSortable: true },
			`<template #actions="{ item }"><button type="button">Удалить {{ item.title }}</button></template>`,
		)
		const button = screen.getByRole('button', { name: 'Удалить Альфа' })
		await fireEvent.click(button)
		await fireEvent.pointerDown(button)
		await fireEvent.keyDown(button, { key: 'Enter' })
		await fireEvent.keyDown(button, { key: ' ' })
		expect(emitted('activate')).toBeUndefined()
		expect(screen.getByRole('status')).toHaveTextContent('')
		unmount()

		setup({ selectionMode: 'single' }, `<template #actions><button type="button">Удалить</button></template>`)
		expect(screen.queryByRole('button')).toBeNull()
	})

	it('подсказка клавиш — у строк при isSortable; в режиме выбора — про Alt; без перестановки и при isDisabled её нет', () => {
		const { container, unmount } = setup({ isSortable: true })
		expect(screen.getAllByRole('listitem')[0]).toHaveAccessibleDescription(/Space — взять строку/)
		expect(container.querySelector('.base-list')).toHaveClass('base-list--sortable')
		expect(container.querySelectorAll('.base-list__grip')).toHaveLength(4)
		unmount()

		const select = setup({ isSortable: true, selectionMode: 'multiple' })
		expect(screen.getAllByRole('option')[0]).toHaveAccessibleDescription('Alt + стрелка вверх или вниз — переместить строку')
		select.unmount()

		const disabled = setup({ isSortable: true, isDisabled: true })
		expect(screen.getAllByRole('listitem')[0]).not.toHaveAttribute('aria-describedby')
		expect(disabled.container.querySelector('.base-list__grip')).toBeNull()
		disabled.unmount()

		setup()
		expect(screen.getAllByRole('listitem')[0]).not.toHaveAttribute('aria-describedby')
	})

	it('одна точка Tab: первая строка, иначе первая выбранная, иначе строка с фокусом', async () => {
		const { unmount } = setup({ selectionMode: 'single' })
		expect(screen.getAllByRole('option').map(option => option.tabIndex)).toEqual([0, -1, -1, -1])
		unmount()

		setup({ selectionMode: 'multiple', modelValue: ['c', 'b'] })
		expect(screen.getByRole('option', { name: 'Бета' })).toHaveAttribute('tabindex', '0')
		await fireEvent.focus(screen.getByRole('option', { name: 'Гамма' }))
		expect(screen.getByRole('option', { name: 'Гамма' })).toHaveAttribute('tabindex', '0')
		expect(screen.getByRole('option', { name: 'Бета' })).toHaveAttribute('tabindex', '-1')
	})

	it('статус для объявлений — пустой role="status"', () => {
		setup()
		expect(screen.getByRole('status')).toHaveTextContent('')
	})

	it('selectAll выбирает все доступные (только multiple), clearSelection снимает выбор', () => {
		const multiple = setup({ selectionMode: 'multiple', modelValue: ['a'] })
		multiple.api().selectAll()
		multiple.api().clearSelection()
		expect(multiple.emitted('update:modelValue')).toEqual([[['a', 'b', 'c']], [[]]])
		multiple.unmount()

		const single = setup({ selectionMode: 'single', modelValue: 'a' })
		single.api().selectAll()
		single.api().clearSelection()
		expect(single.emitted('update:modelValue')).toEqual([[null]])
		single.unmount()

		const disabled = setup({ selectionMode: 'multiple', isDisabled: true })
		disabled.api().selectAll()
		expect(disabled.emitted('update:modelValue')).toBeUndefined()
	})

	it('moveItem переставляет и без isSortable: update:items, move и объявление', async () => {
		const { api, emitted } = setup()
		api().moveItem('a', 2)
		await nextTick()
		expect(emitted('update:items')).toEqual([[[ROWS[1], ROWS[2], ROWS[0], ROWS[3]]]])
		expect(emitted('move')).toEqual([[{ item: ROWS[0], from: 0, to: 2 }]])
		expect(screen.getByRole('status')).toHaveTextContent('Строка «Альфа» на месте 3 из 4')
		expect(ids('listitem')).toEqual(['b', 'c', 'a', 'd'])
	})

	it('moveItem: запрет canMove — порядок прежний, событий нет, объявление «нельзя»', async () => {
		const canMove = vi.fn(() => false)
		const { api, emitted } = setup({ canMove })
		api().moveItem('b', 0)
		await nextTick()
		expect(canMove).toHaveBeenCalledWith({ item: ROWS[1], from: 1, to: 0 })
		expect(emitted('update:items')).toBeUndefined()
		expect(emitted('move')).toBeUndefined()
		expect(screen.getByRole('status')).toHaveTextContent('Строку «Бета» нельзя переместить сюда')
		expect(ids('listitem')).toEqual(['a', 'b', 'c', 'd'])
	})

	it('moveItem на то же место — без событий; индекс за краем прижимается к концу; неизвестный id — без переноса', () => {
		const { api, emitted } = setup()
		api().moveItem('b', 1)
		expect(emitted('move')).toBeUndefined()
		api().moveItem('a', 99)
		expect(emitted('move')).toEqual([[{ item: ROWS[0], from: 0, to: 3 }]])
		api().moveItem('zzz', 0)
		expect(emitted('move')).toHaveLength(1)
	})

	it('новые items из родителя заменяют порядок', async () => {
		const result = render(BaseList, { props: { items: ROWS, ariaLabel: 'Разделы' } })
		await result.rerender({ items: [ROWS[2], ROWS[0]] })
		expect(ids('listitem')).toEqual(['c', 'a'])
	})

	it('filter скрывает строки', () => {
		setup({ filter: (item: ListItem) => item.id !== 'b' })
		expect(ids('listitem')).toEqual(['a', 'c', 'd'])
	})

	it('focusItem ставит фокус на строку; неизвестный id — ничего', async () => {
		const { api } = setup({ selectionMode: 'single' })
		api().focusItem('zzz')
		await nextTick()
		expect(document.body).toHaveFocus()
		api().focusItem('c')
		await nextTick()
		expect(screen.getByRole('option', { name: 'Гамма' })).toHaveFocus()
		expect(screen.getByRole('option', { name: 'Гамма' })).toHaveAttribute('tabindex', '0')
	})

	it('focusItem, а список тут же опустел, — без ошибки и без фокуса', async () => {
		const api = ref<BaseListExpose | null>(null)
		const rows = ref<ListItem[]>(ROWS)
		render({
			components: { BaseList },
			setup: () => ({ api, rows }),
			template: '<BaseList ref="api" :items="rows" aria-label="Разделы" />',
		})
		;(api.value as BaseListExpose).focusItem('b')
		rows.value = []
		await nextTick()
		await nextTick()
		expect(document.body).toHaveFocus()
		expect(screen.getByText('Список пуст')).toBeInTheDocument()
	})

	it('высота области: число — в px, строка — как есть', () => {
		const { container, unmount } = setup({ height: 200 })
		expect((container.querySelector('.base-list__viewport') as HTMLElement).style.height).toBe('200px')
		unmount()
		const text = setup({ height: '50vh' })
		expect((text.container.querySelector('.base-list__viewport') as HTMLElement).style.height).toBe('50vh')
	})

	it('без isVirtual и height высоту не задаёт, строки без transform и aria-setsize', () => {
		const { container } = setup()
		expect((container.querySelector('.base-list__viewport') as HTMLElement).style.height).toBe('')
		expect(screen.getAllByRole('listitem')[0].style.transform).toBe('')
		expect(screen.getAllByRole('listitem')[0]).not.toHaveAttribute('aria-setsize')
	})

	it('умолчания из плагина: defaults.BaseList', () => {
		render(BaseList, {
			props: { items, ariaLabel: 'Разделы' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseList: { selectionMode: 'multiple' } } })] },
		})
		expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
	})
})

describe('listOrder', () => {
	it('mergeShown: единственная показанная строка без соседей встаёт в конец полного списка', () => {
		const full = [ROWS[0], ROWS[1], ROWS[2]]

		expect(mergeShown(full, [ROWS[0]], 'a').map(row => row.id)).toEqual(['b', 'c', 'a'])
	})
})
