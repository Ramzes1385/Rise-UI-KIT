import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createUiKitPlugin } from '@/plugin'
import BaseTransfer from '../ui/BaseTransfer.vue'
import type { ListItem } from '@components/BaseList'
import type { BaseTransferExpose } from '../types/BaseTransfer.types'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const ITEMS: ListItem[] = [
	{ id: 'a', title: 'Анна', description: 'Дизайн' },
	{ id: 'b', title: 'Борис', description: 'Фронтенд' },
	{ id: 'c', title: 'Вера', isDisabled: true },
	{ id: 'd', title: 'Глеб', description: 'Бэкенд' },
]

const panel = (name: string): HTMLElement => screen.getByRole('group', { name })
const listbox = (name: string): HTMLElement => screen.getByRole('listbox', { name })
const titles = (name: string): string[] =>
	within(listbox(name))
		.queryAllByRole('option')
		.map(option => option.dataset.listId ?? '')
const option = (name: string, title: string): HTMLElement => within(listbox(name)).getByRole('option', { name: new RegExp(title) })
const status = (): HTMLElement => document.querySelector('.base-transfer__status') as HTMLElement
const moveButton = (name: string): HTMLElement => screen.getByRole('button', { name: `Перенести отмеченные в «${name}»` })

describe('BaseTransfer unit', () => {
	it('делит строки на «Доступно» и «Выбрано» по v-model, «Выбрано» — в порядке v-model', () => {
		render(BaseTransfer, { props: { items: ITEMS, modelValue: ['d', 'a'], ariaLabel: 'Участники' } })
		expect(titles('Доступно')).toEqual(['b', 'c'])
		expect(titles('Выбрано')).toEqual(['d', 'a'])
		expect(screen.getByRole('group', { name: 'Участники' })).toBeInTheDocument()
	})

	it('без v-model все строки в «Доступно», «Выбрано» пуста', () => {
		render(BaseTransfer, { props: { items: ITEMS } })
		expect(titles('Доступно')).toEqual(['a', 'b', 'c', 'd'])
		expect(within(panel('Выбрано')).getByText('Список пуст')).toBeInTheDocument()
	})

	it('пропускает id, которых нет в items, но сохраняет их при переносе и перестановке', async () => {
		const { emitted } = render(BaseTransfer, { props: { items: ITEMS, modelValue: ['x', 'a'] } })
		expect(titles('Выбрано')).toEqual(['a'])
		await fireEvent.click(option('Доступно', 'Борис'))
		await fireEvent.click(moveButton('Выбрано'))
		expect(emitted()['update:modelValue']).toEqual([[['x', 'a', 'b']]])
	})

	it('видимая подпись связана с группой', () => {
		render(BaseTransfer, { props: { items: ITEMS, label: 'Участники' } })
		expect(screen.getByRole('group', { name: 'Участники' })).toHaveTextContent('Участники')
	})

	it('свои заголовки панелей — в группах, списках, кнопках и объявлении', async () => {
		render(BaseTransfer, { props: { items: ITEMS, titles: ['Все', 'В команде'] } })
		expect(panel('Все')).toBeInTheDocument()
		expect(panel('В команде')).toBeInTheDocument()
		await fireEvent.click(option('Все', 'Анна'))
		await fireEvent.click(moveButton('В команде'))
		await nextTick()
		expect(status()).toHaveTextContent('Перенесено в «В команде»: 1')
	})

	it('отметка, счётчик и «Выбрать все» с частичным состоянием', async () => {
		render(BaseTransfer, { props: { items: ITEMS } })
		const source = panel('Доступно')
		const all = within(source).getByRole('checkbox', { name: 'Выбрать все' })
		expect(within(source).getByText('0 из 4')).toBeInTheDocument()
		await fireEvent.click(option('Доступно', 'Анна'))
		expect(within(source).getByText('1 из 4')).toBeInTheDocument()
		expect(all).toHaveProperty('indeterminate', true)
		await fireEvent.click(all)
		expect(option('Доступно', 'Борис')).toHaveAttribute('aria-selected', 'true')
		expect(option('Доступно', 'Вера')).toHaveAttribute('aria-selected', 'false')
		expect(within(source).getByText('3 из 4')).toBeInTheDocument()
		expect(all).toBeChecked()
		await fireEvent.click(all)
		expect(within(source).getByText('0 из 4')).toBeInTheDocument()
	})

	it('«Выбрать все» недоступна у пустой панели', () => {
		render(BaseTransfer, { props: { items: ITEMS } })
		expect(within(panel('Выбрано')).getByRole('checkbox', { name: 'Выбрать все' })).toBeDisabled()
	})

	it('кнопки переноса доступны, только когда в другой панели есть отмеченные', async () => {
		const { emitted } = render(BaseTransfer, { props: { items: ITEMS, modelValue: ['d'] } })
		expect(moveButton('Выбрано')).toHaveAttribute('aria-disabled', 'true')
		expect(moveButton('Доступно')).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(option('Доступно', 'Борис'))
		await fireEvent.click(option('Доступно', 'Анна'))
		expect(moveButton('Выбрано')).not.toHaveAttribute('aria-disabled')
		await fireEvent.click(moveButton('Выбрано'))
		expect(emitted()['update:modelValue']).toEqual([[['d', 'a', 'b']]])
		expect(emitted().change).toEqual([[{ to: 'target', ids: ['a', 'b'] }]])
	})

	it('возвращает отмеченные из «Выбрано» в «Доступно»', async () => {
		const { emitted } = render(BaseTransfer, { props: { items: ITEMS, modelValue: ['d', 'a', 'b'] } })
		await fireEvent.click(option('Выбрано', 'Анна'))
		await fireEvent.click(option('Выбрано', 'Глеб'))
		await fireEvent.click(moveButton('Доступно'))
		expect(emitted()['update:modelValue']).toEqual([[['b']]])
		expect(emitted().change).toEqual([[{ to: 'source', ids: ['d', 'a'] }]])
		await nextTick()
		expect(status()).toHaveTextContent('Перенесено в «Доступно»: 2')
	})

	it('перенесённые строки не остаются отмеченными', async () => {
		const { rerender } = render(BaseTransfer, { props: { items: ITEMS, modelValue: [] as string[] } })
		await fireEvent.click(option('Доступно', 'Анна'))
		await fireEvent.click(moveButton('Выбрано'))
		await rerender({ modelValue: ['a'] })
		expect(option('Выбрано', 'Анна')).toHaveAttribute('aria-selected', 'false')
		await rerender({ modelValue: [] })
		expect(option('Доступно', 'Анна')).toHaveAttribute('aria-selected', 'false')
	})

	it('отметка строки, ушедшей в другую панель извне, не учитывается', async () => {
		const { rerender } = render(BaseTransfer, { props: { items: ITEMS, modelValue: [] as string[] } })
		await fireEvent.click(option('Доступно', 'Анна'))
		await rerender({ modelValue: ['a'] })
		expect(within(panel('Доступно')).getByText('0 из 3')).toBeInTheDocument()
		expect(moveButton('Выбрано')).toHaveAttribute('aria-disabled', 'true')
	})

	it('поиск фильтрует по title и description без учёта регистра; пусто — «Ничего не найдено»', async () => {
		render(BaseTransfer, { props: { items: ITEMS, isSearchable: true } })
		const search = screen.getByRole('textbox', { name: 'Поиск: Доступно' })
		await fireEvent.update(search, '  фронт ')
		expect(titles('Доступно')).toEqual(['b'])
		await fireEvent.update(search, 'АН')
		expect(titles('Доступно')).toEqual(['a'])
		await fireEvent.update(search, 'нет такого')
		expect(within(panel('Доступно')).getByText('Ничего не найдено')).toBeInTheDocument()
		await fireEvent.update(screen.getByRole('textbox', { name: 'Поиск: Выбрано' }), 'а')
		expect(within(panel('Выбрано')).getByText('Список пуст')).toBeInTheDocument()
	})

	it('«Выбрать все» и перенос — только по показанным строкам', async () => {
		const { emitted } = render(BaseTransfer, { props: { items: ITEMS, isSearchable: true } })
		await fireEvent.click(option('Доступно', 'Анна'))
		await fireEvent.update(screen.getByRole('textbox', { name: 'Поиск: Доступно' }), 'борис')
		expect(within(panel('Доступно')).getByText('0 из 1')).toBeInTheDocument()
		await fireEvent.click(within(panel('Доступно')).getByRole('checkbox', { name: 'Выбрать все' }))
		await fireEvent.click(moveButton('Выбрано'))
		expect(emitted()['update:modelValue']).toEqual([[['b']]])
	})

	it('filterMethod заменяет поиск по умолчанию и получает запрос без пробелов', async () => {
		const filterMethod = vi.fn((item: ListItem, query: string) => item.id === query)
		render(BaseTransfer, { props: { items: ITEMS, isSearchable: true, filterMethod } })
		await fireEvent.update(screen.getByRole('textbox', { name: 'Поиск: Доступно' }), ' d ')
		expect(titles('Доступно')).toEqual(['d'])
		expect(filterMethod).toHaveBeenCalledWith(ITEMS[0], 'd')
	})

	it('без isSearchable поля поиска нет', () => {
		render(BaseTransfer, { props: { items: ITEMS } })
		expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
	})

	it('emptyText и слот empty со стороной панели', () => {
		render(BaseTransfer, { props: { items: [], emptyText: 'Никого' } })
		expect(screen.getAllByText('Никого')).toHaveLength(2)
	})

	it('слот empty получает сторону', () => {
		render(BaseTransfer, {
			props: { items: [] },
			slots: { empty: (props: { side: string }) => h('span', `пусто: ${props.side}`) },
		})
		expect(screen.getByText('пусто: source')).toBeInTheDocument()
		expect(screen.getByText('пусто: target')).toBeInTheDocument()
	})

	it('слот item получает данные строки и сторону', () => {
		render(BaseTransfer, {
			props: { items: ITEMS, modelValue: ['a'] },
			slots: { item: (props: { item: ListItem; side: string }) => h('b', `${props.side}:${props.item.title}`) },
		})
		expect(screen.getByText('target:Анна')).toBeInTheDocument()
		expect(screen.getByText('source:Борис')).toBeInTheDocument()
	})

	it('isDisabled отключает отметку, «Выбрать все», поиск и перенос', async () => {
		const { emitted } = render(BaseTransfer, { props: { items: ITEMS, isDisabled: true, isSearchable: true } })
		await fireEvent.click(option('Доступно', 'Анна'))
		expect(option('Доступно', 'Анна')).toHaveAttribute('aria-selected', 'false')
		expect(within(panel('Доступно')).getByRole('checkbox', { name: 'Выбрать все' })).toBeDisabled()
		expect(screen.getByRole('textbox', { name: 'Поиск: Доступно' })).toBeDisabled()
		expect(moveButton('Выбрано')).toBeDisabled()
		expect(emitted()['update:modelValue']).toBeUndefined()
	})

	it('ошибка связана с обеими панелями вместе с подсказкой клавиш', () => {
		render(BaseTransfer, { props: { items: ITEMS, error: 'Выберите участников' } })
		expect(screen.getByText('Выберите участников')).toBeInTheDocument()
		expect(panel('Доступно')).toHaveAccessibleDescription(
			'Space отмечает строку, Ctrl или Alt + стрелка вправо переносит отмеченные Выберите участников',
		)
		expect(panel('Выбрано')).toHaveAccessibleDescription(
			'Space отмечает строку, Ctrl или Alt + стрелка влево возвращает отмеченные Выберите участников',
		)
	})

	it('без ошибки — только подсказка', () => {
		const { container } = render(BaseTransfer, { props: { items: ITEMS } })
		expect(panel('Доступно')).toHaveAccessibleDescription('Space отмечает строку, Ctrl или Alt + стрелка вправо переносит отмеченные')
		expect(container.querySelector('.base-transfer--error')).toBeNull()
	})

	it('expose transfer: по id, без недоступных и без пустого переноса', async () => {
		const wrapper = mount(BaseTransfer, { props: { items: ITEMS, modelValue: ['a'] } })
		const exposed = wrapper.vm as unknown as BaseTransferExpose
		exposed.transfer('target', ['c'])
		exposed.transfer('source')
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		exposed.transfer('target', ['d', 'b', 'c', 'a'])
		expect(wrapper.emitted('update:modelValue')).toEqual([[['a', 'b', 'd']]])
		expect(wrapper.emitted('change')).toEqual([[{ to: 'target', ids: ['b', 'd'] }]])
		wrapper.unmount()
	})

	it('добавляет модификатор варианта и свои классы частей', () => {
		const { container } = render(BaseTransfer, {
			props: { items: ITEMS, variant: 'soft', customClass: { root: 'my-root', panel: 'my-panel', actions: 'my-actions' } },
		})
		expect(container.querySelector('.base-transfer')).toHaveClass('base-transfer--soft', 'my-root')
		expect(container.querySelectorAll('.my-panel')).toHaveLength(2)
		expect(container.querySelector('.my-actions')).toBeInTheDocument()
	})

	it('ставит --size-scale', () => {
		const { container } = render(BaseTransfer, { props: { items: ITEMS, sizeScale: 120 } })
		expect((container.querySelector('.base-transfer') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.2')
	})

	it('берёт значения по умолчанию из настроек плагина', () => {
		render(BaseTransfer, {
			props: { items: ITEMS },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTransfer: { variant: 'outline' } } })] },
		})
		expect(screen.getAllByRole('group')[0]).toHaveClass('base-transfer--outline')
	})

	it('кнопка переноса после переноса — aria-disabled и остаётся в фокусе; при isDisabled — нативный disabled', async () => {
		const { emitted, rerender } = render(BaseTransfer, { props: { items: ITEMS, modelValue: [] as string[] } })
		await fireEvent.click(option('Доступно', 'Анна'))
		const toTarget = moveButton('Выбрано')
		toTarget.focus()
		await fireEvent.click(toTarget)
		const moved = emitted()['update:modelValue'].at(-1) as [string[]]
		await rerender({ modelValue: moved[0] })

		expect(moved[0]).toEqual(['a'])
		expect(toTarget).toHaveAttribute('aria-disabled', 'true')
		expect(toTarget).not.toHaveAttribute('disabled')
		expect(document.activeElement).toBe(toTarget)
		await fireEvent.click(toTarget)
		expect(emitted()['update:modelValue']).toHaveLength(1)

		await rerender({ isDisabled: true })
		expect(toTarget).toBeDisabled()
		expect(toTarget).not.toHaveAttribute('aria-disabled')
	})
})
