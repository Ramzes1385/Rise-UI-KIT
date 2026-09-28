/** Общая подпись полей: BaseInput, BaseTextarea, BaseSelect, BaseCheckbox, BaseRadio, BaseSwitch */

import '@testing-library/jest-dom/vitest'
import FormFieldLabel from '../ui/FormFieldLabel.vue'
import { render, screen } from '@testing-library/vue'

describe('FormFieldLabel unit', () => {
	it('связывает подпись с полем через for, если передан forId', () => {
		render(FormFieldLabel, { props: { label: 'Email', forId: 'email-field' } })

		expect(screen.getByText('Email')).toHaveAttribute('for', 'email-field')
	})

	it('не ставит for на теги, которые не могут быть подписью поля', () => {
		render(FormFieldLabel, { props: { label: 'Материал', tag: 'span', forId: 'material' } })

		expect(screen.getByText('Материал')).not.toHaveAttribute('for')
	})

	it('рендерит подпись с начертанием medium (inline-стиль BaseText не сбрасывает его в 400)', () => {
		render(FormFieldLabel, { props: { label: 'Email' } })

		expect(screen.getByText('Email')).toHaveStyle({ fontWeight: '500' })
	})

	it('показывает звёздочку обязательности с переданными классами', () => {
		render(FormFieldLabel, { props: { label: 'Email', isRequired: true, requiredClassName: 'field__required' } })

		expect(screen.getByText('*')).toHaveClass('field__required')
	})
})
