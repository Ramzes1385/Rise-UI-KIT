/**
 * Integration-тесты для BaseTabs.
 * Проверяют взаимодействие: переключение табов, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseTabs from '../ui/BaseTabs.vue'
import type { TabItem } from '../types/BaseTabs.types'

const TABS: TabItem[] = [
	{ id: 'info', label: 'Информация' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы', isDisabled: true },
]

describe('BaseTabs integration', () => {
	describe('переключение табов', () => {
		it('должен эмитить update:modelValue при клике на таб', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			await user.click(screen.getByText('Характеристики'))

			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('должен эмитить корректный id таба', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			await user.click(screen.getByText('Характеристики'))

			const events = emitted()['update:modelValue'] as string[][]
			expect(events.at(-1)?.[0]).toBe('specs')
		})
	})

	describe('событие change', () => {
		it('должен эмитить change при переключении', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			await user.click(screen.getByText('Характеристики'))

			expect(emitted()).toHaveProperty('change')
		})
	})

	describe('клавиатура (APG Tabs)', () => {
		/** Набор, где отключённая вкладка стоит внутри списка, а последняя доступна */
		const KEYBOARD_TABS: TabItem[] = [
			{ id: 'a', label: 'Первая' },
			{ id: 'b', label: 'Вторая', isDisabled: true },
			{ id: 'c', label: 'Третья' },
			{ id: 'd', label: 'Четвёртая' },
		]

		it('ArrowRight переносит фокус и выбор на следующую вкладку', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			screen.getByRole('tab', { name: 'Информация' }).focus()
			await user.keyboard('{ArrowRight}')

			expect(screen.getByRole('tab', { name: 'Характеристики' })).toHaveFocus()
			expect(emitted()['update:modelValue']).toEqual([['specs']])
			expect(emitted().change).toEqual([['specs']])
		})

		it('ArrowRight пропускает отключённую вкладку и зацикливается на первую', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTabs, {
				props: { modelValue: 'specs', items: TABS },
			})

			screen.getByRole('tab', { name: 'Характеристики' }).focus()
			await user.keyboard('{ArrowRight}')

			expect(screen.getByRole('tab', { name: 'Информация' })).toHaveFocus()
			expect(emitted()['update:modelValue']).toEqual([['info']])
		})

		it('ArrowLeft пропускает отключённые вкладки, а с первой зацикливается на последнюю', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTabs, {
				props: { modelValue: 'c', items: KEYBOARD_TABS },
			})

			screen.getByRole('tab', { name: 'Третья' }).focus()
			await user.keyboard('{ArrowLeft}')

			// «Вторая» отключена — фокус уходит на «Первую»
			expect(screen.getByRole('tab', { name: 'Первая' })).toHaveFocus()
			await user.keyboard('{ArrowLeft}')

			expect(screen.getByRole('tab', { name: 'Четвёртая' })).toHaveFocus()
			expect(emitted()['update:modelValue']).toEqual([['a'], ['d']])
		})

		it('Home и End переносят фокус на первую и последнюю вкладки', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseTabs, {
				props: { modelValue: 'c', items: KEYBOARD_TABS },
			})

			screen.getByRole('tab', { name: 'Третья' }).focus()
			await user.keyboard('{Home}')
			expect(screen.getByRole('tab', { name: 'Первая' })).toHaveFocus()

			await user.keyboard('{End}')
			expect(screen.getByRole('tab', { name: 'Четвёртая' })).toHaveFocus()
			expect(emitted()['update:modelValue']).toEqual([['a'], ['d']])
		})

		it('в порядке Tab участвует только выбранная вкладка (roving tabindex)', async () => {
			const user = userEvent.setup()
			render(BaseTabs, {
				props: { modelValue: 'specs', items: TABS },
			})

			await user.tab()
			expect(screen.getByRole('tab', { name: 'Характеристики' })).toHaveFocus()

			await user.tab()
			expect(screen.getAllByRole('tab')).not.toContain(document.activeElement)
		})
	})

	describe('панель вкладки', () => {
		it('панель имеет role=tabpanel, подписана выбранной вкладкой и связана через aria-controls', async () => {
			const { rerender } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
				slots: { default: '<p>Содержимое вкладки</p>' },
			})

			const panel = screen.getByRole('tabpanel', { name: 'Информация' })
			expect(panel).toHaveTextContent('Содержимое вкладки')
			expect(screen.getByRole('tab', { name: 'Информация' })).toHaveAttribute('aria-controls', panel.id)

			await rerender({ modelValue: 'specs' })

			expect(screen.getByRole('tabpanel', { name: 'Характеристики' })).toBe(panel)
		})
	})

	describe('отключённый таб', () => {
		it('не должен эмитить update:modelValue при клике на отключённый таб', async () => {
			const { emitted } = render(BaseTabs, {
				props: { modelValue: 'info', items: TABS },
			})

			await fireEvent.click(screen.getByText('Отзывы'))

			expect(emitted()).not.toHaveProperty('update:modelValue')
		})
	})
})
