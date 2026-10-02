import '@testing-library/jest-dom/vitest'
import { UI_TEXT } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import BaseTreeSelect from '../ui/BaseTreeSelect.vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'
import type { BaseTreeSelectProps, TreeSelectValue } from '../types/BaseTreeSelect.types'

const ITEMS: TreeNode[] = [
	{
		id: 'center',
		label: 'Центр',
		children: [
			{ id: 'moscow', label: 'Москва' },
			{
				id: 'region',
				label: 'Область',
				children: [
					{ id: 'khimki', label: 'Химки' },
					{ id: 'podolsk', label: 'Подольск' },
				],
			},
		],
	},
	{
		id: 'north',
		label: 'Север',
		isDisabled: true,
		children: [{ id: 'spb', label: 'Петербург' }],
	},
	{ id: 'kazan', label: 'Казань' },
]

function renderSelect(props: Partial<BaseTreeSelectProps> = {}, initial: TreeSelectValue = '') {
	const value = ref<TreeSelectValue>(initial)
	const changes: TreeSelectValue[] = []
	const toggles: [string, boolean][] = []
	const Harness = defineComponent(
		() => () =>
			h(BaseTreeSelect, {
				items: ITEMS,
				label: 'Город',
				...props,
				modelValue: value.value,
				'onUpdate:modelValue': (next: TreeSelectValue) => (value.value = next),
				onChange: (next: TreeSelectValue) => changes.push(next),
				onToggle: (id: string, isExpanded: boolean) => toggles.push([id, isExpanded]),
			}),
	)
	const result = render(Harness)
	return { ...result, value, changes, toggles, user: userEvent.setup() }
}

const combobox = (): HTMLElement => screen.getByRole('combobox', { name: 'Город' })
const rowLabels = (): string[] => screen.queryAllByRole('treeitem').map(item => item.textContent?.trim() ?? '')
const activeLabel = (owner: HTMLElement = combobox()): string | undefined => {
	const id = owner.getAttribute('aria-activedescendant')
	return id ? document.getElementById(id)?.textContent?.trim() : undefined
}
const treeitem = (name: string): HTMLElement => screen.getByRole('treeitem', { name })

async function openWithKeyboard(user: ReturnType<typeof userEvent.setup>): Promise<void> {
	combobox().focus()
	await user.keyboard('{ArrowDown}')
}

describe('BaseTreeSelect integration', () => {
	describe('открытие', () => {
		it.each(['{Enter}', ' ', '{ArrowDown}', '{ArrowUp}'])('%s открывает список, первая строка — активная', async key => {
			const { user } = renderSelect()
			combobox().focus()
			await user.keyboard(key)
			expect(combobox()).toHaveAttribute('aria-expanded', 'true')
			const tree = screen.getByRole('tree', { name: 'Город' })
			expect(combobox()).toHaveAttribute('aria-controls', tree.id)
			expect(activeLabel()).toBe('Центр')
			expect(rowLabels()).toEqual(['Центр', 'Север', 'Казань'])
		})

		it('другие клавиши при закрытом списке ничего не делают', async () => {
			const { user } = renderSelect()
			combobox().focus()
			await user.keyboard('a{Escape}')
			expect(combobox()).toHaveAttribute('aria-expanded', 'false')
		})

		it('при открытии активна выбранная видимая строка', async () => {
			const { user } = renderSelect({}, 'kazan')
			await openWithKeyboard(user)
			expect(activeLabel()).toBe('Казань')
			expect(treeitem('Казань')).toHaveAttribute('aria-selected', 'true')
			expect(treeitem('Центр')).toHaveAttribute('aria-selected', 'false')
		})

		it('клик открывает и закрывает; закрытие снимает aria-activedescendant', async () => {
			const { user } = renderSelect()
			await user.click(combobox())
			expect(combobox()).toHaveAttribute('aria-expanded', 'true')
			await user.click(combobox())
			expect(combobox()).toHaveAttribute('aria-expanded', 'false')
			expect(combobox()).not.toHaveAttribute('aria-activedescendant')
		})

		it('isDefaultExpandAll: все ветки раскрыты, у строк aria-level и aria-posinset', async () => {
			const { user } = renderSelect({ isDefaultExpandAll: true })
			await openWithKeyboard(user)
			expect(rowLabels()).toEqual(['Центр', 'Москва', 'Область', 'Химки', 'Подольск', 'Север', 'Петербург', 'Казань'])
			expect(treeitem('Химки')).toHaveAttribute('aria-level', '3')
			expect(treeitem('Подольск')).toHaveAttribute('aria-posinset', '2')
			expect(treeitem('Подольск')).toHaveAttribute('aria-setsize', '2')
			expect(treeitem('Казань')).not.toHaveAttribute('aria-expanded')
			expect(treeitem('Север')).toHaveAttribute('aria-disabled', 'true')
		})
	})

	describe('клавиатура дерева', () => {
		it('стрелки вверх и вниз без зацикливания, Home и End', async () => {
			const { user } = renderSelect()
			await openWithKeyboard(user)
			await user.keyboard('{ArrowUp}')
			expect(activeLabel()).toBe('Центр')
			await user.keyboard('{ArrowDown}{ArrowDown}')
			expect(activeLabel()).toBe('Казань')
			await user.keyboard('{ArrowDown}')
			expect(activeLabel()).toBe('Казань')
			await user.keyboard('{Home}')
			expect(activeLabel()).toBe('Центр')
			await user.keyboard('{End}')
			expect(activeLabel()).toBe('Казань')
		})

		it('вправо раскрывает ветку, второй раз — к первому ребёнку; влево — к родителю, затем сворачивает', async () => {
			const { user, toggles } = renderSelect()
			await openWithKeyboard(user)
			expect(treeitem('Центр')).toHaveAttribute('aria-expanded', 'false')
			await user.keyboard('{ArrowRight}')
			expect(treeitem('Центр')).toHaveAttribute('aria-expanded', 'true')
			expect(toggles).toEqual([['center', true]])
			await user.keyboard('{ArrowRight}')
			expect(activeLabel()).toBe('Москва')
			await user.keyboard('{ArrowRight}')
			expect(activeLabel()).toBe('Москва')
			await user.keyboard('{ArrowLeft}')
			expect(activeLabel()).toBe('Центр')
			await user.keyboard('{ArrowLeft}')
			expect(treeitem('Центр')).toHaveAttribute('aria-expanded', 'false')
			await user.keyboard('{ArrowLeft}')
			expect(activeLabel()).toBe('Центр')
		})

		it('отключённая ветка не раскрывается', async () => {
			const { user } = renderSelect()
			await openWithKeyboard(user)
			await user.keyboard('{ArrowDown}{ArrowRight}')
			expect(treeitem('Север')).toHaveAttribute('aria-expanded', 'false')
		})

		it('влево на раскрытой отключённой ветке ведёт к родителю', async () => {
			const { user } = renderSelect({ isDefaultExpandAll: true })
			await openWithKeyboard(user)
			await user.keyboard('{End}{ArrowUp}{ArrowLeft}')
			expect(activeLabel()).toBe('Север')
			await user.keyboard('{ArrowLeft}')
			expect(treeitem('Север')).toHaveAttribute('aria-expanded', 'true')
			expect(activeLabel()).toBe('Север')
		})

		it('Enter выбирает узел, закрывает список и возвращает фокус полю', async () => {
			const { user, value, changes } = renderSelect()
			await openWithKeyboard(user)
			await user.keyboard('{End}{Enter}')
			expect(value.value).toBe('kazan')
			expect(changes).toEqual(['kazan'])
			expect(combobox()).toHaveAttribute('aria-expanded', 'false')
			expect(combobox()).toHaveTextContent('Казань')
			expect(combobox()).toHaveFocus()
		})

		it('Enter на отключённом узле ничего не выбирает', async () => {
			const { user, value } = renderSelect()
			await openWithKeyboard(user)
			await user.keyboard('{ArrowDown}{Enter}')
			expect(value.value).toBe('')
			expect(combobox()).toHaveAttribute('aria-expanded', 'true')
		})

		it('Escape закрывает список', async () => {
			const { user } = renderSelect()
			await openWithKeyboard(user)
			await user.keyboard('{Escape}')
			expect(combobox()).toHaveAttribute('aria-expanded', 'false')
		})

		it('в пустом списке стрелки и Enter ничего не делают', async () => {
			const { user, value } = renderSelect({ items: [] })
			await openWithKeyboard(user)
			await user.keyboard('{ArrowLeft}{ArrowRight}{Enter}')
			expect(value.value).toBe('')
			expect(combobox()).toHaveAttribute('aria-expanded', 'true')
		})

		it('у отключённого поля клавиши не обрабатываются', async () => {
			renderSelect({ isDisabled: true })
			await fireEvent.keyDown(combobox(), { key: 'ArrowDown' })
			expect(combobox()).toHaveAttribute('aria-expanded', 'false')
		})

		it('Alt+ArrowUp и Tab закрывают список', async () => {
			const { user } = renderSelect()
			await openWithKeyboard(user)
			await user.keyboard('{Alt>}{ArrowUp}{/Alt}')
			expect(combobox()).toHaveAttribute('aria-expanded', 'false')
			await user.keyboard('{ArrowDown}')
			await user.tab()
			expect(combobox()).toHaveAttribute('aria-expanded', 'false')
		})
	})

	describe('несколько значений', () => {
		it('пробел отмечает ветку с потомками, список остаётся открытым', async () => {
			const { user, value } = renderSelect({ isMultiple: true }, [])
			await openWithKeyboard(user)
			expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true')
			await user.keyboard(' ')
			expect(value.value).toEqual(['moscow', 'khimki', 'podolsk'])
			expect(combobox()).toHaveAttribute('aria-expanded', 'true')
			expect(treeitem('Центр')).toHaveAttribute('aria-checked', 'true')
			expect(treeitem('Центр')).not.toHaveAttribute('aria-selected')
		})

		it('частичный выбор: aria-checked="mixed" у предков', async () => {
			const { user } = renderSelect({ isMultiple: true, isDefaultExpandAll: true }, ['khimki'])
			await openWithKeyboard(user)
			expect(treeitem('Область')).toHaveAttribute('aria-checked', 'mixed')
			expect(treeitem('Центр')).toHaveAttribute('aria-checked', 'mixed')
			expect(treeitem('Москва')).toHaveAttribute('aria-checked', 'false')
			expect(treeitem('Химки')).toHaveAttribute('aria-checked', 'true')
		})

		it('выбор всех детей отмечает родителя; checkedStrategy=parent отдаёт ветку одним id', async () => {
			const { user, value } = renderSelect({ isMultiple: true, isDefaultExpandAll: true, checkedStrategy: 'parent' }, ['khimki'])
			await user.click(combobox())
			await user.click(treeitem('Подольск'))
			expect(value.value).toEqual(['region'])
			await user.click(treeitem('Москва'))
			expect(value.value).toEqual(['center'])
		})

		it('кнопка метки снимает выбор с каскадом', async () => {
			const { user, value } = renderSelect({ isMultiple: true, checkedStrategy: 'parent' }, ['region'])
			await user.click(screen.getByRole('button', { name: `${UI_TEXT.DELETE} Область`, hidden: true }))
			expect(value.value).toEqual([])
			expect(combobox()).toHaveAttribute('aria-expanded', 'false')
		})
	})

	describe('указатель', () => {
		it('клик по стрелке раскрывает ветку, клик по строке выбирает', async () => {
			const { user, value } = renderSelect()
			await user.click(combobox())
			await user.click(treeitem('Центр').querySelector('.base-tree-select__toggle') as HTMLElement)
			expect(treeitem('Центр')).toHaveAttribute('aria-expanded', 'true')
			expect(combobox()).toHaveAttribute('aria-expanded', 'true')
			await user.click(treeitem('Москва'))
			expect(value.value).toBe('moscow')
		})

		it('клик по месту стрелки у листа выбирает узел; по отключённому — ничего', async () => {
			const { user, value } = renderSelect()
			await user.click(combobox())
			await user.click(treeitem('Север'))
			expect(value.value).toBe('')
			await user.click(treeitem('Казань').querySelector('.base-tree-select__toggle') as HTMLElement)
			expect(value.value).toBe('kazan')
		})

		it('наведение делает строку активной', async () => {
			const { user } = renderSelect()
			await user.click(combobox())
			await fireEvent.mouseMove(treeitem('Казань'))
			expect(activeLabel()).toBe('Казань')
			await fireEvent.mouseMove(treeitem('Казань'))
			expect(treeitem('Казань')).toHaveClass('base-tree-select__node--active')
		})
	})

	describe('поиск', () => {
		const search = (): HTMLElement => screen.getByRole('textbox', { name: /.+/ })

		it('фокус в поле поиска; совпавшие узлы с раскрытыми предками', async () => {
			const { user } = renderSelect({ isSearchable: true })
			await user.click(combobox())
			expect(search()).toHaveFocus()
			await user.type(search(), 'хим')
			expect(rowLabels()).toEqual(['Центр', 'Область', 'Химки'])
			expect(treeitem('Область')).toHaveAttribute('aria-expanded', 'true')
			expect(activeLabel(search())).toBe('Центр')
		})

		it('совпавшая ветка показывает своих детей по раскрытию', async () => {
			const { user } = renderSelect({ isSearchable: true })
			await user.click(combobox())
			await user.type(search(), 'обл')
			expect(rowLabels()).toEqual(['Центр', 'Область'])
			await user.click(treeitem('Область').querySelector('.base-tree-select__toggle') as HTMLElement)
			expect(rowLabels()).toEqual(['Центр', 'Область', 'Химки', 'Подольск'])
			await user.click(treeitem('Центр').querySelector('.base-tree-select__toggle') as HTMLElement)
			expect(treeitem('Центр')).toHaveAttribute('aria-expanded', 'true')
		})

		it('с текстом в поиске стрелки влево-вправо, Home, End и пробел работают в поле', async () => {
			const { user } = renderSelect({ isSearchable: true })
			await user.click(combobox())
			await user.type(search(), 'а')
			await user.keyboard('{ArrowDown}')
			const before = activeLabel(search())
			await user.keyboard('{ArrowRight}{ArrowLeft}{Home}{End} ')
			expect(activeLabel(search())).toBe(before)
			expect(search()).toHaveValue('а ')
		})

		it('с пустым поиском стрелки управляют деревом, Enter выбирает', async () => {
			const { user, value } = renderSelect({ isSearchable: true })
			await user.click(combobox())
			await user.keyboard('{ArrowRight}{ArrowRight}{Enter}')
			expect(value.value).toBe('moscow')
		})

		it('ничего не найдено — «Ничего не найдено», без дерева и aria-activedescendant', async () => {
			const { user } = renderSelect({ isSearchable: true })
			await user.click(combobox())
			await user.type(search(), 'zzz')
			expect(screen.getByText(UI_TEXT.NO_RESULTS)).toBeInTheDocument()
			expect(screen.queryByRole('tree')).not.toBeInTheDocument()
			expect(search()).not.toHaveAttribute('aria-activedescendant')
			expect(search()).toHaveAttribute('aria-controls', combobox().getAttribute('aria-controls'))
			expect(document.getElementById(search().getAttribute('aria-controls') ?? '')).toHaveClass('base-tree-select__panel')
		})

		it('Tab из поиска закрывает список, поиск сбрасывается', async () => {
			const { user } = renderSelect({ isSearchable: true })
			await user.click(combobox())
			await user.type(search(), 'хим')
			await user.tab()
			expect(combobox()).toHaveAttribute('aria-expanded', 'false')
			await user.click(combobox())
			expect(search()).toHaveValue('')
		})
	})

	describe('состояния списка', () => {
		it('загрузка: «Загрузка...» в role="status", aria-busy, без дерева', async () => {
			const { user } = renderSelect({ isLoading: true })
			expect(combobox()).toHaveAttribute('aria-busy', 'true')
			await user.click(combobox())
			expect(screen.getByRole('status')).toHaveTextContent(UI_TEXT.LOADING)
			expect(screen.queryByRole('tree')).not.toBeInTheDocument()
			expect(combobox()).not.toHaveAttribute('aria-activedescendant')
			expect(document.getElementById(combobox().getAttribute('aria-controls') ?? '')).toHaveClass('base-tree-select__panel')
		})

		it('нет узлов — «Нет данных» или слот empty', async () => {
			const value = ref<TreeSelectValue>('')
			const { unmount } = render(BaseTreeSelect, { props: { items: [], label: 'Город', modelValue: value.value } })
			await userEvent.setup().click(combobox())
			expect(screen.getByText(UI_TEXT.EMPTY)).toBeInTheDocument()
			unmount()
			render(BaseTreeSelect, { props: { items: [], label: 'Город' }, slots: { empty: 'Добавьте регионы' } })
			await userEvent.setup().click(combobox())
			expect(screen.getByText('Добавьте регионы')).toBeInTheDocument()
		})

		it('слот node меняет подпись узла', async () => {
			render(BaseTreeSelect, {
				props: { items: ITEMS, label: 'Город', modelValue: 'kazan' },
				slots: { node: '<template #node="{ node, isSelected, depth }">{{ node.label }}:{{ isSelected }}:{{ depth }}</template>' },
			})
			await userEvent.setup().click(combobox())
			expect(screen.getByText('Казань:true:0')).toBeInTheDocument()
		})

		it('строка, ставшая невидимой, уступает активность первой строке', async () => {
			const items = ref<TreeNode[]>(ITEMS)
			const Harness = defineComponent(() => () => h(BaseTreeSelect, { items: items.value, label: 'Город' }))
			const { user } = { ...render(Harness), user: userEvent.setup() }
			await openWithKeyboard(user)
			await user.keyboard('{End}')
			items.value = ITEMS.slice(0, 2)
			await nextTick()
			await nextTick()
			expect(activeLabel()).toBe('Центр')
			items.value = []
			await nextTick()
			await nextTick()
			expect(combobox()).not.toHaveAttribute('aria-activedescendant')
		})
	})
})
