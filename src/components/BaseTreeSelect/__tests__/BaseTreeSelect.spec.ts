import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { UI_TEXT } from '@/locales/messages'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import BaseTreeSelect from '../ui/BaseTreeSelect.vue'
import { render, screen } from '@testing-library/vue'
import { BaseFormField } from '@components/BaseFormField'
import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'

const ITEMS: TreeNode[] = [
	{
		id: 'center',
		label: 'Центр',
		children: [
			{ id: 'moscow', label: 'Москва' },
			{ id: 'tula', label: 'Тула' },
		],
	},
	{
		id: 'north',
		label: 'Север',
		children: [
			{ id: 'spb', label: 'Петербург' },
			{ id: 'murmansk', label: 'Мурманск', isDisabled: true },
		],
	},
	{ id: 'kazan', label: 'Казань', icon: 'star' },
]

const trigger = (): HTMLElement => screen.getByRole('combobox')

describe('BaseTreeSelect unit', () => {
	describe('поле', () => {
		it('без значения показывает плейсхолдер по умолчанию, свой плейсхолдер — вместо него', () => {
			const { unmount } = render(BaseTreeSelect, { props: { items: ITEMS } })
			expect(screen.getByText(UI_TEXT.SELECT_PLACEHOLDER)).toBeInTheDocument()
			unmount()
			render(BaseTreeSelect, { props: { items: ITEMS, placeholder: 'Город' } })
			expect(screen.getByText('Город')).toBeInTheDocument()
		})

		it('имя поля: подпись, иначе ariaLabel, иначе плейсхолдер', () => {
			const { unmount } = render(BaseTreeSelect, { props: { items: ITEMS, label: 'Город', ariaLabel: 'Скрытое' } })
			expect(screen.getByRole('combobox', { name: 'Город' })).not.toHaveAttribute('aria-label')
			unmount()
			const second = render(BaseTreeSelect, { props: { items: ITEMS, ariaLabel: 'Регион' } })
			expect(screen.getByRole('combobox', { name: 'Регион' })).toBeInTheDocument()
			second.unmount()
			render(BaseTreeSelect, { props: { items: ITEMS, placeholder: '' } })
			expect(screen.getByRole('combobox', { name: UI_TEXT.SELECT_PLACEHOLDER })).toBeInTheDocument()
		})

		it('combobox: aria-haspopup="tree", закрыт — aria-expanded="false" без aria-controls', () => {
			render(BaseTreeSelect, { props: { items: ITEMS } })
			expect(trigger()).toHaveAttribute('aria-haspopup', 'tree')
			expect(trigger()).toHaveAttribute('aria-expanded', 'false')
			expect(trigger()).not.toHaveAttribute('aria-controls')
			expect(trigger()).toHaveAttribute('tabindex', '0')
		})

		it('ошибка: класс, aria-invalid и описание', () => {
			const { container } = render(BaseTreeSelect, { props: { items: ITEMS, label: 'Город', error: 'Выберите город' } })
			expect(container.querySelector('.base-tree-select')).toHaveClass('base-tree-select--error')
			expect(trigger()).toHaveAttribute('aria-invalid', 'true')
			expect(trigger()).toHaveAccessibleDescription('Выберите город')
		})

		it('triggerAttrs: свой id и aria-describedby вместе с ошибкой', () => {
			render({
				components: { BaseTreeSelect },
				template: `<p id="hint">Подсказка</p><BaseTreeSelect :items="items" error="Ошибка" :trigger-attrs="{ id: 'city', 'aria-describedby': 'hint' }" />`,
				setup: () => ({ items: ITEMS }),
			})
			expect(trigger()).toHaveAttribute('id', 'city')
			expect(trigger()).toHaveAccessibleDescription('Ошибка Подсказка')
		})

		it('isRequired: звёздочка у подписи и aria-required', () => {
			const { container } = render(BaseTreeSelect, { props: { items: ITEMS, label: 'Город', isRequired: true } })
			expect(container.querySelector('.base-tree-select__required')).toBeInTheDocument()
			expect(trigger()).toHaveAttribute('aria-required', 'true')
		})

		it('клик по подписи переводит фокус на поле, у отключённого — нет', async () => {
			const user = userEvent.setup()
			const { unmount } = render(BaseTreeSelect, { props: { items: ITEMS, label: 'Город' } })
			await user.click(screen.getByText('Город'))
			expect(trigger()).toHaveFocus()
			unmount()
			render(BaseTreeSelect, { props: { items: ITEMS, label: 'Город', isDisabled: true } })
			await user.click(screen.getByText('Город'))
			expect(trigger()).not.toHaveFocus()
		})

		it('отключённое поле: aria-disabled, вне порядка Tab, не открывается кликом и клавишами', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseTreeSelect, { props: { items: ITEMS, isDisabled: true } })
			expect(container.querySelector('.base-tree-select')).toHaveClass('base-tree-select--disabled')
			expect(trigger()).toHaveAttribute('aria-disabled', 'true')
			expect(trigger()).not.toHaveAttribute('tabindex')
			await user.click(trigger())
			trigger().focus()
			await user.keyboard('{Enter}')
			expect(trigger()).toHaveAttribute('aria-expanded', 'false')
		})

		it('вариант, масштаб и customClass', () => {
			const { container } = render(BaseTreeSelect, {
				props: { items: ITEMS, variant: 'underline', sizeScale: 125, customClass: { root: 'my-root' } },
			})
			const root = container.querySelector('.base-tree-select') as HTMLElement
			expect(root).toHaveClass('base-tree-select--underline', 'my-root')
			expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		})

		it('берёт умолчания из createUiKitPlugin({ defaults })', () => {
			const { container } = render(BaseTreeSelect, {
				props: { items: ITEMS },
				global: { plugins: [createUiKitPlugin({ defaults: { BaseTreeSelect: { variant: 'soft', isMultiple: true } } })] },
			})
			expect(container.querySelector('.base-tree-select')).toHaveClass('base-tree-select--soft', 'base-tree-select--multiple')
		})

		it('внутри BaseFormField поле и дерево называются подписью обёртки', async () => {
			const user = userEvent.setup()
			render({
				components: { BaseTreeSelect, BaseFormField },
				template: `<BaseFormField label="Регион доставки"><BaseTreeSelect :items="items" /></BaseFormField>`,
				setup: () => ({ items: ITEMS }),
			})
			await nextTick()
			await user.click(screen.getByRole('combobox', { name: 'Регион доставки' }))
			expect(await screen.findByRole('tree', { name: 'Регион доставки' })).toBeInTheDocument()
		})
	})

	describe('значение', () => {
		it('одиночный выбор: подпись выбранного узла любой глубины, слот selected', () => {
			const { unmount } = render(BaseTreeSelect, { props: { items: ITEMS, modelValue: 'tula' } })
			expect(screen.getByText('Тула')).toBeInTheDocument()
			unmount()
			render(BaseTreeSelect, {
				props: { items: ITEMS, modelValue: 'kazan' },
				slots: { selected: '<template #selected="{ node }">[{{ node.id }}]</template>' },
			})
			expect(screen.getByText('[kazan]')).toBeInTheDocument()
		})

		it('одиночный выбор: массив — берётся первый id; неизвестный id — плейсхолдер', () => {
			const { unmount } = render(BaseTreeSelect, { props: { items: ITEMS, modelValue: ['spb', 'tula'] } })
			expect(screen.getByText('Петербург')).toBeInTheDocument()
			unmount()
			render(BaseTreeSelect, { props: { items: ITEMS, modelValue: 'nope', placeholder: 'Пусто' } })
			expect(screen.getByText('Пусто')).toBeInTheDocument()
		})

		it('isMultiple: строка вместо массива — ничего не выбрано', () => {
			render(BaseTreeSelect, { props: { items: ITEMS, isMultiple: true, modelValue: 'spb', placeholder: 'Пусто' } })
			expect(screen.getByText('Пусто')).toBeInTheDocument()
		})

		it.each([
			['child', ['Москва', 'Тула', 'Петербург']],
			['parent', ['Центр', 'Север']],
			['all', ['Центр', 'Москва', 'Тула', 'Север', 'Петербург']],
		] as const)('isMultiple, checkedStrategy=%s: метки в порядке дерева', (checkedStrategy, labels) => {
			const { container } = render(BaseTreeSelect, {
				props: { items: ITEMS, isMultiple: true, checkedStrategy, modelValue: ['spb', 'center'] },
			})
			expect(container.querySelector('.base-tree-select')).toHaveClass('base-tree-select--has-tags', 'base-tree-select--multiple')
			const tags = [...container.querySelectorAll('.base-tree-select__tag-text')].map(tag => tag.textContent)
			expect(tags).toEqual(labels)
		})

		it('isMultiple: неизвестные id в значении не дают меток', () => {
			const { container } = render(BaseTreeSelect, {
				props: { items: ITEMS, isMultiple: true, modelValue: ['ghost', 'spb', 'phantom'] },
			})
			const tags = [...container.querySelectorAll('.base-tree-select__tag-text')].map(tag => tag.textContent)
			expect(tags).toEqual(['Петербург'])
		})

		it('maxTagCount: лишние метки — счётчиком «+N»', () => {
			const { container } = render(BaseTreeSelect, {
				props: { items: ITEMS, isMultiple: true, maxTagCount: 1, modelValue: ['moscow', 'tula', 'spb'] },
			})
			expect(container.querySelectorAll('.base-tree-select__tag-text')).toHaveLength(1)
			expect(container.querySelector('.base-tree-select__more')).toHaveTextContent('+2')
		})

		it('maxTagCount больше числа меток — без счётчика', () => {
			const { container } = render(BaseTreeSelect, { props: { items: ITEMS, isMultiple: true, maxTagCount: 5, modelValue: ['spb'] } })
			expect(container.querySelector('.base-tree-select__more')).not.toBeInTheDocument()
		})

		it('метка отключённого узла и отключённого поля — без кнопки удаления', () => {
			const { unmount } = render(BaseTreeSelect, { props: { items: ITEMS, isMultiple: true, modelValue: ['murmansk', 'spb'] } })
			expect(screen.getAllByRole('button', { hidden: true })).toHaveLength(1)
			expect(screen.getByRole('button', { name: `${UI_TEXT.DELETE} Петербург`, hidden: true })).toBeInTheDocument()
			unmount()
			render(BaseTreeSelect, { props: { items: ITEMS, isMultiple: true, isDisabled: true, modelValue: ['spb'] } })
			expect(screen.queryByRole('button', { hidden: true })).not.toBeInTheDocument()
		})

		it('слот tag получает узлы и remove', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTreeSelect, {
				props: { items: ITEMS, isMultiple: true, modelValue: ['center'] },
				slots: {
					tag: `<template #tag="{ nodes, remove }"><span>{{ nodes.map(node => node.id).join(',') }}</span><button type="button" @click.stop="remove('moscow')">x</button></template>`,
				},
			})
			expect(screen.getByText('moscow,tula')).toBeInTheDocument()
			await user.click(screen.getByText('x'))
			expect(emitted()['update:modelValue']).toEqual([[['tula']]])
		})

		it('remove с невыбранным id ничего не меняет', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTreeSelect, {
				props: { items: ITEMS, isMultiple: true, modelValue: ['spb'] },
				slots: { tag: `<template #tag="{ remove }"><button type="button" @click.stop="remove('tula')">x</button></template>` },
			})
			await user.click(screen.getByText('x'))
			expect(emitted()['update:modelValue']).toBeUndefined()
		})
	})

	describe('методы', () => {
		it('focus, blur, validate и reset', async () => {
			const wrapper = mount(BaseTreeSelect, {
				props: { items: ITEMS, label: 'Город', isRequired: true, modelValue: '' },
				attachTo: document.body,
			})
			const element = wrapper.find('[role="combobox"]').element
			wrapper.vm.focus()
			expect(element).toHaveFocus()
			wrapper.vm.blur()
			expect(element).not.toHaveFocus()
			expect(wrapper.vm.validate()).toBe(false)
			await nextTick()
			expect(wrapper.text()).toContain(UI_TEXT.REQUIRED_FIELD)
			wrapper.vm.reset()
			await nextTick()
			expect(wrapper.text()).not.toContain(UI_TEXT.REQUIRED_FIELD)
			wrapper.unmount()
		})
	})
})
