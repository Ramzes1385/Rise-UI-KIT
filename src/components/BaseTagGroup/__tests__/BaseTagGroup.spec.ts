import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseTagGroup from '../ui/BaseTagGroup.vue'
import type { TagGroupItem } from '../types/BaseTagGroup.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const ITEMS: TagGroupItem[] = [
	{ value: 'vue', label: 'Vue' },
	{ value: 'react', label: 'React', tone: 'info' },
	{ value: 'svelte', label: 'Svelte', isDisabled: true },
]

describe('BaseTagGroup unit', () => {
	describe('рендер', () => {
		it('группа с именем по умолчанию «Метки» и метками', () => {
			const { container } = render(BaseTagGroup, { props: { items: ITEMS } })

			const group = screen.getByRole('group', { name: 'Метки' })
			expect(group).toHaveAttribute('tabindex', '-1')
			expect(container.querySelectorAll('.base-tag')).toHaveLength(3)
			expect(screen.queryByRole('button')).not.toBeInTheDocument()
		})

		it('label задаёт имя группы', () => {
			render(BaseTagGroup, { props: { items: ITEMS, label: 'Технологии' } })

			expect(screen.getByRole('group', { name: 'Технологии' })).toBeInTheDocument()
		})

		it('tone группы и свой tone метки, variant, color и customClass передаются меткам', () => {
			const { container } = render(BaseTagGroup, {
				props: {
					items: ITEMS,
					tone: 'success',
					variant: 'outline',
					color: { bg: { base: 'red' } },
					customClass: { root: 'g', tag: 't' },
				},
			})

			const tags = container.querySelectorAll<HTMLElement>('.base-tag')
			expect(container.querySelector('.base-tag-group')).toHaveClass('g')
			expect(tags[0]).toHaveClass('base-tag--tone-success', 'base-tag--outline', 't')
			expect(tags[1]).toHaveClass('base-tag--tone-info')
			expect(tags[0].style.getPropertyValue('--custom-bg')).toBe('red')
		})

		it('слот tag получает метку и выбор', () => {
			render(BaseTagGroup, {
				props: { items: ITEMS, selectionMode: 'multiple', modelValue: ['vue'] },
				slots: { tag: '<template #tag="{ item, isSelected }">{{ item.label }}:{{ isSelected }}</template>' },
			})

			expect(screen.getByText('Vue:true')).toBeInTheDocument()
			expect(screen.getByText('React:false')).toBeInTheDocument()
		})

		it('выключенная метка и isDisabled группы', () => {
			const { rerender } = render(BaseTagGroup, { props: { items: ITEMS, selectionMode: 'single' } })

			expect(screen.getByRole('button', { name: 'Svelte' })).toBeDisabled()
			expect(screen.getByRole('button', { name: 'Vue' })).toBeEnabled()

			return rerender({ items: ITEMS, selectionMode: 'single', isDisabled: true }).then(() => {
				expect(screen.getByRole('button', { name: 'Vue' })).toBeDisabled()
			})
		})
	})

	describe('выбор', () => {
		it('none — метки не выбираются, даже если modelValue задан', () => {
			const { container } = render(BaseTagGroup, { props: { items: ITEMS, modelValue: 'vue' } })

			expect(container.querySelector('.base-tag--selected')).not.toBeInTheDocument()
		})

		it('single — aria-pressed у выбранной, клик выбирает другую', async () => {
			const { emitted } = render(BaseTagGroup, { props: { items: ITEMS, selectionMode: 'single', modelValue: 'vue' } })

			expect(screen.getByRole('button', { name: 'Vue' })).toHaveAttribute('aria-pressed', 'true')
			expect(screen.getByRole('button', { name: 'React' })).toHaveAttribute('aria-pressed', 'false')

			await fireEvent.click(screen.getByRole('button', { name: 'React' }))
			expect(emitted('update:modelValue')).toEqual([['react']])
		})

		it('single — повторный клик снимает выбор (null)', async () => {
			const { emitted } = render(BaseTagGroup, { props: { items: ITEMS, selectionMode: 'single', modelValue: 'vue' } })

			await fireEvent.click(screen.getByRole('button', { name: 'Vue' }))

			expect(emitted('update:modelValue')).toEqual([[null]])
		})

		it('multiple — добавляет и убирает значения', async () => {
			const { emitted, rerender } = render(BaseTagGroup, { props: { items: ITEMS, selectionMode: 'multiple', modelValue: ['vue'] } })

			await fireEvent.click(screen.getByRole('button', { name: 'React' }))
			expect(emitted('update:modelValue')[0]).toEqual([['vue', 'react']])

			await rerender({ items: ITEMS, selectionMode: 'multiple', modelValue: ['vue', 'react'] })
			await fireEvent.click(screen.getByRole('button', { name: 'Vue' }))
			expect(emitted('update:modelValue')[1]).toEqual([['react']])
		})

		it('multiple без modelValue и со скалярным modelValue', async () => {
			const { emitted, rerender } = render(BaseTagGroup, { props: { items: ITEMS, selectionMode: 'multiple' } })

			await fireEvent.click(screen.getByRole('button', { name: 'Vue' }))
			expect(emitted('update:modelValue')[0]).toEqual([['vue']])

			await rerender({ items: ITEMS, selectionMode: 'multiple', modelValue: 'react' })
			await fireEvent.click(screen.getByRole('button', { name: 'Vue' }))
			expect(emitted('update:modelValue')[1]).toEqual([['react', 'vue']])
		})
	})

	describe('удаление', () => {
		it('isRemovable группы и isRemovable метки', () => {
			render(BaseTagGroup, {
				props: { items: [...ITEMS.slice(0, 2), { value: 'x', label: 'X', isRemovable: false }], isRemovable: true },
			})

			expect(screen.getByRole('button', { name: 'Удалить метку Vue' })).toBeInTheDocument()
			expect(screen.queryByRole('button', { name: 'Удалить метку X' })).not.toBeInTheDocument()
		})

		it('remove с меткой и индексом; приложение не убрало метку — фокус не двигается', async () => {
			const { emitted } = render(BaseTagGroup, { props: { items: ITEMS, isRemovable: true } })

			const remove = screen.getByRole('button', { name: 'Удалить метку React' })
			remove.focus()
			await fireEvent.click(remove)
			await nextTick()

			expect(emitted('remove')).toEqual([[ITEMS[1], 1]])
			expect(remove).toHaveFocus()
		})

		it('группа скрыта вместе с удалением — фокус не трогается', async () => {
			const isShown = ref(true)
			const items = ref(ITEMS)
			const hide = () => {
				items.value = ITEMS.slice(1)
				isShown.value = false
			}
			render({
				components: { BaseTagGroup },
				setup: () => ({ isShown, items, hide }),
				template: '<div><BaseTagGroup v-if="isShown" :items="items" is-removable @remove="hide" /></div>',
			})

			await fireEvent.click(screen.getByRole('button', { name: 'Удалить метку Vue' }))
			await nextTick()

			expect(screen.queryByRole('group')).not.toBeInTheDocument()
			expect(document.body).toHaveFocus()
		})
	})

	it('берёт selectionMode из defaults.BaseTagGroup', () => {
		render(BaseTagGroup, {
			props: { items: ITEMS },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTagGroup: { selectionMode: 'multiple' } } })] },
		})

		expect(screen.getByRole('button', { name: 'Vue' })).toHaveAttribute('aria-pressed', 'false')
	})
})
