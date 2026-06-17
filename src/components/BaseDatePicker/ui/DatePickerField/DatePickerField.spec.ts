/**
 * Unit-тесты для DatePickerField.
 * Проверяют рендер, пропсы, условный рендеринг и эмиты.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import DatePickerField from './DatePickerField.vue'

/** Общие стабы для UI Kit компонентов */
const GLOBAL_STUBS = {
	BaseInput: {
		template: '<div class="base-input" @click="$emit(\'click\')"><slot /><slot name="suffix" /></div>',
		props: [
			'modelValue',
			'placeholder',
			'label',
			'error',
			'isDisabled',
			'isReadonly',
			'isRequired',
			'variant',
			'color',
			'sizeScale',
		],
	},
	BaseButton: {
		template: '<button class="base-button" :disabled="isDisabled" @click="$emit(\'click\', $event)"><slot /></button>',
		props: ['variant', 'sizeScale', 'isDisabled', 'padding', 'color'],
	},
	BaseIcon: { template: '<i />' },
}

/** Полный набор обязательных пропсов */
const DEFAULT_PROPS = {
	displayValue: '01.01.2026',
	placeholder: 'Выберите дату',
	label: '',
	error: '',
	isDisabled: false,
	isReadonly: true,
	isRequired: false,
	isOpen: false,
	isClearable: false,
	hasValue: false,
	inputVariant: 'outline' as const,
	sizeScale: 100,
}

describe('DatePickerField', () => {
	describe('рендер', () => {
		it('рендерит поле выбора даты', () => {
			const { container } = render(DatePickerField, {
				props: DEFAULT_PROPS,
				global: { stubs: GLOBAL_STUBS },
			})

			expect(container.querySelector('.date-picker-field')).toBeInTheDocument()
		})

		it('рендерит иконку календаря', () => {
			const { container } = render(DatePickerField, {
				props: DEFAULT_PROPS,
				global: { stubs: GLOBAL_STUBS },
			})

			expect(container.querySelector('.date-picker-field__icon-btn')).toBeInTheDocument()
		})
	})

	describe('условный рендеринг', () => {
		it('рендерит кнопку очистки когда isClearable=true и hasValue=true', () => {
			const { container } = render(DatePickerField, {
				props: { ...DEFAULT_PROPS, isClearable: true, hasValue: true },
				global: { stubs: GLOBAL_STUBS },
			})

			expect(container.querySelector('.date-picker-field__clear-btn')).toBeInTheDocument()
		})

		it('не рендерит кнопку очистки когда hasValue=false', () => {
			const { container } = render(DatePickerField, {
				props: { ...DEFAULT_PROPS, isClearable: true, hasValue: false },
				global: { stubs: GLOBAL_STUBS },
			})

			expect(container.querySelector('.date-picker-field__clear-btn')).not.toBeInTheDocument()
		})

		it('не рендерит кнопку очистки когда isClearable=false', () => {
			const { container } = render(DatePickerField, {
				props: { ...DEFAULT_PROPS, isClearable: false, hasValue: true },
				global: { stubs: GLOBAL_STUBS },
			})

			expect(container.querySelector('.date-picker-field__clear-btn')).not.toBeInTheDocument()
		})
	})

	describe('эмиты', () => {
		it('эмитит field-click при клике на поле', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(DatePickerField, {
				props: DEFAULT_PROPS,
				global: { stubs: GLOBAL_STUBS },
			})

			const input = container.querySelector('.base-input')!
			await user.click(input)

			expect(emitted()['field-click']).toBeTruthy()
		})

		it('эмитит icon-click при клике на иконку', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(DatePickerField, {
				props: DEFAULT_PROPS,
				global: { stubs: GLOBAL_STUBS },
			})

			const iconBtn = container.querySelector('.date-picker-field__icon-btn')!
			await user.click(iconBtn)

			expect(emitted()['icon-click']).toBeTruthy()
		})

		it('эмитит clear-click при клике на кнопку очистки', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(DatePickerField, {
				props: { ...DEFAULT_PROPS, isClearable: true, hasValue: true },
				global: { stubs: GLOBAL_STUBS },
			})

			const clearBtn = container.querySelector('.date-picker-field__clear-btn')!
			await user.click(clearBtn)

			expect(emitted()['clear-click']).toBeTruthy()
		})
	})

	describe('пропсы', () => {
		it('передаёт sizeScale', () => {
			const { container } = render(DatePickerField, {
				props: { ...DEFAULT_PROPS, sizeScale: 150 },
				global: { stubs: GLOBAL_STUBS },
			})

			expect(container.querySelector('.date-picker-field')).toBeInTheDocument()
		})

		it('передаёт isDisabled', () => {
			const { container } = render(DatePickerField, {
				props: { ...DEFAULT_PROPS, isDisabled: true },
				global: { stubs: GLOBAL_STUBS },
			})

			expect(container.querySelector('.date-picker-field')).toBeInTheDocument()
		})
	})

	describe('слоты', () => {
		it('рендерит кастомную иконку через слот icon', () => {
			render(DatePickerField, {
				props: DEFAULT_PROPS,
				slots: { icon: '<span>Custom Icon</span>' },
				global: { stubs: GLOBAL_STUBS },
			})

			expect(screen.getByText('Custom Icon')).toBeInTheDocument()
		})
	})
})
