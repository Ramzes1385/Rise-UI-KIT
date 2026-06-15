/**
 * Integration-тесты для BaseTabs.
 * Проверяют взаимодействие: переключение табов, emits.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

import type { TabItem } from '../model/BaseTabs.types'
import BaseTabs from '../ui/BaseTabs.vue'

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
