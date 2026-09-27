/**
 * Unit-тесты BaseCheckboxGroup: разметка группы, имя и описание, варианты, «Выбрать все».
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseCheckboxGroup from '../ui/BaseCheckboxGroup.vue'
import type { CheckboxGroupOption } from '../model/BaseCheckboxGroup.types'

const OPTIONS: CheckboxGroupOption[] = [
	{ value: 'email', label: 'Почта' },
	{ value: 'push', label: 'Push' },
	{ value: 3, label: 'Третий' },
	{ value: 'sms', label: 'SMS', isDisabled: true },
]

describe('BaseCheckboxGroup', () => {
	it('группа с именем из заголовка, флажок на каждый вариант, отмеченные — из modelValue', () => {
		render(BaseCheckboxGroup, { props: { options: OPTIONS, modelValue: ['push', 3], label: 'Каналы' } })

		expect(screen.getByRole('group', { name: 'Каналы' })).toBeInTheDocument()
		expect(screen.getAllByRole('checkbox')).toHaveLength(4)
		expect(screen.getByRole('checkbox', { name: 'Push' })).toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Третий' })).toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'Почта' })).not.toBeChecked()
		expect(screen.getByRole('checkbox', { name: 'SMS' })).toBeDisabled()
	})

	it('звёздочка обязательной группы скрыта от скринридера', () => {
		render(BaseCheckboxGroup, { props: { options: OPTIONS, label: 'Каналы', isRequired: true } })

		expect(screen.getByRole('group', { name: 'Каналы' })).toBeInTheDocument()
		expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
	})

	it('без заголовка и без BaseFormField у группы нет aria-labelledby', () => {
		render(BaseCheckboxGroup, { props: { options: OPTIONS } })

		expect(screen.getByRole('group')).not.toHaveAttribute('aria-labelledby')
	})

	it('ошибка описывает группу и красит её', () => {
		const { container } = render(BaseCheckboxGroup, { props: { options: OPTIONS, label: 'Каналы', error: 'Выберите канал' } })

		expect(screen.getByRole('group', { name: 'Каналы' })).toHaveAccessibleDescription('Выберите канал')
		expect(container.querySelector('.base-checkbox-group')).toHaveClass('base-checkbox-group--error')
	})

	it('isDisabled отключает все флажки', () => {
		render(BaseCheckboxGroup, { props: { options: OPTIONS, isDisabled: true, hasSelectAll: true } })

		for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).toBeDisabled()
	})

	it('isVertical ставит флажки столбиком, вариант получает каждый флажок', () => {
		const { container } = render(BaseCheckboxGroup, { props: { options: OPTIONS, isVertical: true, variant: 'soft' } })

		expect(container.querySelector('.base-checkbox-group__options')).toHaveClass('base-checkbox-group__options--vertical')
		expect(container.querySelectorAll('.base-checkbox--soft')).toHaveLength(4)
	})

	describe('«Выбрать все»', () => {
		it('частичный выбор — indeterminate, все доступные — отмечен, ничего — пуст', async () => {
			const { rerender } = render(BaseCheckboxGroup, { props: { options: OPTIONS, modelValue: ['email'], hasSelectAll: true } })
			const selectAll = screen.getByRole('checkbox', { name: 'Выбрать все' })

			expect(selectAll).toBePartiallyChecked()
			await rerender({ modelValue: ['email', 'push', 3] })
			expect(selectAll).toBeChecked()
			await rerender({ modelValue: [] })
			expect(selectAll).not.toBeChecked()
			expect(selectAll).not.toBePartiallyChecked()
		})

		it('своя подпись; без доступных вариантов флажок отключён', () => {
			render(BaseCheckboxGroup, {
				props: { options: [{ value: 'a', label: 'А', isDisabled: true }], hasSelectAll: true, selectAllLabel: 'Все каналы' },
			})

			expect(screen.getByRole('checkbox', { name: 'Все каналы' })).toBeDisabled()
		})
	})
})
