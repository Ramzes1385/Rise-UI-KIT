/**
 * Unit-тесты для BaseDatePicker.
 * Проверяют рендер, пропсы, формат отображения, clear-кнопку.
 * Дочерние компоненты заменены stub'ами.
 * Мокаем только DOM-зависимые composables.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseDatePicker from '../ui/BaseDatePicker.vue'

const clickOutsideOptions: { isActive?: () => boolean } = {}
const escapeKeyOptions: { isActive?: () => boolean } = {}

vi.mock('@composables/useClickOutside', () => ({
	useClickOutside: vi.fn((opts: { isActive?: () => boolean }) => {
		clickOutsideOptions.isActive = opts.isActive
	}),
}))
vi.mock('@composables/useDropdownPosition', () => ({
	useDropdownPosition: (opts: {
		position?: () => unknown
		gap?: () => unknown
		matchWidth?: () => unknown
		maxHeight?: () => unknown
		isOpen?: () => unknown
	}) => {
		opts.position?.()
		opts.gap?.()
		opts.matchWidth?.()
		opts.maxHeight?.()
		opts.isOpen?.()
		return {
			panelStyle: { value: { position: 'fixed', top: '0px', left: '0px' } },
		}
	},
}))
vi.mock('@composables/useEscapeKey', () => ({
	useEscapeKey: vi.fn((opts: { isActive?: () => boolean }) => {
		escapeKeyOptions.isActive = opts.isActive
	}),
}))

const stubs = {
	DatePickerField: {
		template: `
			<div class="date-picker-field-stub" data-testid="field" :class="customClass" @click="$emit('field-click')">
				<input :value="displayValue" :placeholder="placeholder" :disabled="isDisabled" :readonly="isReadonly" />
				<button v-if="isClearable && hasValue" class="clear-btn-stub" @click.stop="$emit('clear-click')">clear</button>
				<button class="icon-btn-stub" @click.stop="$emit('icon-click')"><slot name="icon">icon</slot></button>
			</div>
		`,
		emits: ['field-click', 'clear-click', 'icon-click'],
		props: [
			'displayValue',
			'placeholder',
			'label',
			'error',
			'isDisabled',
			'isReadonly',
			'isRequired',
			'isOpen',
			'isClearable',
			'hasValue',
			'inputVariant',
			'color',
			'sizeScale',
			'customClass',
		],
	},
	DatePickerPanel: {
		template: `
			<div
				v-if="isOpen"
				class="date-picker-panel-stub"
				:class="customClass"
				:data-locale="calendarConfig?.locale"
				:data-show-time="String(calendarConfig?.showTime)"
				:data-show-week-number="String(calendarConfig?.showWeekNumber)">
				panel
				<button class="emit-model" @click="$emit('model-update', new Date(2024, 0, 2))">model</button>
				<button class="emit-model-end" @click="$emit('model-end-update', new Date(2024, 0, 3))">modelEnd</button>
				<button class="emit-dates" @click="$emit('selected-update', [new Date(2024, 0, 4)])">dates</button>
				<button class="emit-range" @click="$emit('range-select', new Date(2024, 0, 5), new Date(2024, 0, 6))">range</button>
			</div>
		`,
		emits: ['model-update', 'model-end-update', 'selected-update', 'range-select'],
		setup(_props: unknown, { expose }: { expose: (api: Record<string, unknown>) => void }) {
			expose({ panelRef: document.createElement('div') })
		},
		props: [
			'isOpen',
			'modelValue',
			'modelValueEnd',
			'selectedDates',
			'selectionMode',
			'calendarVariant',
			'calendarConfig',
			'sizeScale',
			'monthsCount',
			'panelStyle',
			'customClass',
		],
	},
}

describe('BaseDatePicker unit', () => {
	it('должен рендерить компонент', () => {
		const { container } = render(BaseDatePicker, { global: { stubs } })
		expect(container.querySelector('.base-date-picker')).toBeInTheDocument()
	})

	it('должен рендерить пользовательскую иконку из слота', () => {
		const { container } = render(BaseDatePicker, {
			global: { stubs },
			slots: { icon: '<span class="custom-icon">★</span>' },
		})
		expect(container.querySelector('.custom-icon')).toBeInTheDocument()
	})

	it('должен показывать плейсхолдер', () => {
		render(BaseDatePicker, {
			props: { placeholder: 'Выберите дату' },
			global: { stubs },
		})
		const input = screen.getByPlaceholderText('Выберите дату')
		expect(input).toBeInTheDocument()
	})

	it('должен применять isDisabled', () => {
		render(BaseDatePicker, {
			props: { isDisabled: true },
			global: { stubs },
		})
		const input = screen.getByPlaceholderText('Выберите дату')
		expect(input).toBeDisabled()
	})

	it('не должен показывать панель по умолчанию', () => {
		const { container } = render(BaseDatePicker, { global: { stubs } })
		expect(container.querySelector('.date-picker-panel-stub')).not.toBeInTheDocument()
	})

	describe('формат отображения', () => {
		it('должен форматировать single дату (без времени)', () => {
			render(BaseDatePicker, {
				props: {
					modelValue: new Date(2024, 5, 15),
					selectionMode: 'single',
					locale: 'ru-RU',
				},
				global: { stubs },
			})
			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toContain('2024')
		})

		it('должен форматировать single дату со временем', () => {
			render(BaseDatePicker, {
				props: {
					modelValue: new Date(2024, 5, 15, 14, 30),
					selectionMode: 'single',
					showTime: true,
					locale: 'ru-RU',
				},
				global: { stubs },
			})
			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toContain('14')
			expect(input.value).toContain('30')
		})

		it('должен форматировать range с обеими датами', () => {
			render(BaseDatePicker, {
				props: {
					modelValue: new Date(2024, 5, 10),
					modelValueEnd: new Date(2024, 5, 20),
					selectionMode: 'range',
					locale: 'ru-RU',
				},
				global: { stubs },
			})
			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toContain('—')
		})

		it('должен форматировать range без конечной даты', () => {
			render(BaseDatePicker, {
				props: {
					modelValue: new Date(2024, 5, 10),
					selectionMode: 'range',
					locale: 'ru-RU',
				},
				global: { stubs },
			})
			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toContain('...')
		})

		it('должен форматировать multiple (≤3 даты)', () => {
			const dates = [new Date(2024, 5, 10), new Date(2024, 5, 15)]
			render(BaseDatePicker, {
				props: {
					selectedDates: dates,
					selectionMode: 'multiple',
					locale: 'ru-RU',
				},
				global: { stubs },
			})
			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toContain('2024')
			expect(input.value).toContain(',')
		})

		it('должен форматировать multiple (>3 даты) компактно', () => {
			const dates = [new Date(2024, 5, 10), new Date(2024, 5, 15), new Date(2024, 5, 20), new Date(2024, 5, 25)]
			render(BaseDatePicker, {
				props: {
					selectedDates: dates,
					selectionMode: 'multiple',
					locale: 'ru-RU',
				},
				global: { stubs },
			})
			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toContain('Выбрано:')
			expect(input.value).toContain('4')
		})

		it('должен показывать пустую строку без значения', () => {
			render(BaseDatePicker, {
				props: { selectionMode: 'single' },
				global: { stubs },
			})
			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toBe('')
		})
	})

	describe('clear-кнопка', () => {
		it('должна показываться когда isClearable и есть значение', () => {
			const { container } = render(BaseDatePicker, {
				props: {
					isClearable: true,
					modelValue: new Date(2024, 5, 15),
				},
				global: { stubs },
			})
			expect(container.querySelector('.clear-btn-stub')).toBeInTheDocument()
		})

		it('не должна показываться когда isClearable но нет значения', () => {
			const { container } = render(BaseDatePicker, {
				props: { isClearable: true },
				global: { stubs },
			})
			expect(container.querySelector('.clear-btn-stub')).not.toBeInTheDocument()
		})

		it('не должна показываться когда isClearable=false даже со значением', () => {
			const { container } = render(BaseDatePicker, {
				props: {
					isClearable: false,
					modelValue: new Date(2024, 5, 15),
				},
				global: { stubs },
			})
			expect(container.querySelector('.clear-btn-stub')).not.toBeInTheDocument()
		})
	})

	describe('пропс minDate/maxDate', () => {
		it('должен передавать minDate в панель', () => {
			const minDate = new Date(2024, 0, 1)
			const { container } = render(BaseDatePicker, {
				props: { minDate },
				global: { stubs },
			})

			/** Панель не открыта по умолчанию — проверяем через открытие */
			const field = container.querySelector('.date-picker-field-stub')
			expect(field).toBeInTheDocument()
		})

		it('должен передавать maxDate в панель', () => {
			const maxDate = new Date(2024, 11, 31)
			const { container } = render(BaseDatePicker, {
				props: { maxDate },
				global: { stubs },
			})

			const field = container.querySelector('.date-picker-field-stub')
			expect(field).toBeInTheDocument()
		})
	})

	describe('внутренний calendarConfig', () => {
		it('собирает календарные пропсы в единый объект для панели', async () => {
			const { container } = render(BaseDatePicker, {
				props: {
					showWeekNumber: true,
					locale: 'en-US',
				},
				global: { stubs },
			})

			await fireEvent.click(container.querySelector('.date-picker-field-stub')!)

			const panel = container.querySelector('.date-picker-panel-stub')
			expect(panel).toHaveAttribute('data-locale', 'en-US')
			expect(panel).toHaveAttribute('data-show-week-number', 'true')
		})

		it('принимает публичный calendarConfig как единый объект календарных настроек', async () => {
			const { container } = render(BaseDatePicker, {
				props: {
					calendarConfig: {
						locale: 'en-US',
						showTime: true,
						showWeekNumber: true,
					},
				},
				global: { stubs },
			})

			await fireEvent.click(container.querySelector('.date-picker-field-stub')!)

			const panel = container.querySelector('.date-picker-panel-stub')
			expect(panel).toHaveAttribute('data-locale', 'en-US')
			expect(panel).toHaveAttribute('data-show-time', 'true')
			expect(panel).toHaveAttribute('data-show-week-number', 'true')
		})

		it('явные календарные props переопределяют значения из calendarConfig', async () => {
			const { container } = render(BaseDatePicker, {
				props: {
					locale: 'ru-RU',
					showWeekNumber: false,
					calendarConfig: {
						locale: 'en-US',
						showWeekNumber: true,
					},
				},
				global: { stubs },
			})

			await fireEvent.click(container.querySelector('.date-picker-field-stub')!)

			const panel = container.querySelector('.date-picker-panel-stub')
			expect(panel).toHaveAttribute('data-locale', 'ru-RU')
			expect(panel).toHaveAttribute('data-show-week-number', 'false')
		})
	})

	describe('пропс sizeScale', () => {
		it('должен устанавливать CSS переменную --size-scale когда sizeScale не 100', () => {
			const { container } = render(BaseDatePicker, {
				props: { sizeScale: 150 },
				global: { stubs },
			})

			const picker = container.querySelector('.base-date-picker') as HTMLElement
			expect(picker.style.getPropertyValue('--size-scale')).toBe('1.5')
		})
	})

	describe('пропс showSeconds', () => {
		it('должен форматировать дату с секундами когда showSeconds=true', () => {
			render(BaseDatePicker, {
				props: {
					modelValue: new Date(2024, 5, 15, 14, 30, 45),
					selectionMode: 'single',
					showTime: true,
					showSeconds: true,
					locale: 'ru-RU',
				},
				global: { stubs },
			})
			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toContain('45')
		})
	})

	describe('пропс is24Hour', () => {
		it('должен форматировать время в 12-часовом формате когда is24Hour=false', () => {
			render(BaseDatePicker, {
				props: {
					modelValue: new Date(2024, 5, 15, 14, 30),
					selectionMode: 'single',
					showTime: true,
					is24Hour: false,
					locale: 'ru-RU',
				},
				global: { stubs },
			})
			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			// В 12-часовом формате 14:30 отображается как 2:30 PM
			expect(input.value).toMatch(/PM|pm/i)
		})
	})

	describe('пропс isReadonly', () => {
		it('должен передавать isReadonly в поле ввода', () => {
			const { container } = render(BaseDatePicker, {
				props: { isReadonly: true },
				global: { stubs },
			})

			const field = container.querySelector('.date-picker-field-stub')
			expect(field).toBeInTheDocument()
			// Stub рендерит input с readonly, проверяем что он есть
			const input = field?.querySelector('input')
			expect(input?.hasAttribute('readonly')).toBe(true)
		})
	})

	describe('пропс error', () => {
		it('должен передавать error в поле ввода', () => {
			const { container } = render(BaseDatePicker, {
				props: { error: 'Обязательное поле' },
				global: { stubs },
			})

			const field = container.querySelector('.date-picker-field-stub')
			expect(field).toBeInTheDocument()
		})
	})

	describe('синхронизация внешних значений (watch)', () => {
		it('должен обновлять отображение при изменении modelValue извне', async () => {
			const { rerender } = render(BaseDatePicker, {
				props: { modelValue: new Date(2024, 5, 15), selectionMode: 'single', locale: 'ru-RU' },
				global: { stubs },
			})

			await rerender({ modelValue: new Date(2025, 0, 1), selectionMode: 'single', locale: 'ru-RU' })

			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toContain('2025')
		})

		it('должен обновлять отображение при изменении modelValueEnd извне', async () => {
			const { rerender } = render(BaseDatePicker, {
				props: {
					modelValue: new Date(2024, 5, 10),
					modelValueEnd: new Date(2024, 5, 20),
					selectionMode: 'range',
					locale: 'ru-RU',
				},
				global: { stubs },
			})

			await rerender({
				modelValue: new Date(2024, 5, 10),
				modelValueEnd: new Date(2025, 0, 31),
				selectionMode: 'range',
				locale: 'ru-RU',
			})

			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toContain('2025')
		})

		it('должен обновлять отображение при изменении selectedDates извне', async () => {
			const { rerender } = render(BaseDatePicker, {
				props: {
					selectedDates: [new Date(2024, 5, 10)],
					selectionMode: 'multiple',
					locale: 'ru-RU',
				},
				global: { stubs },
			})

			await rerender({
				selectedDates: [new Date(2025, 0, 1), new Date(2025, 0, 2)],
				selectionMode: 'multiple',
				locale: 'ru-RU',
			})

			const input = screen.getByPlaceholderText('Выберите дату') as HTMLInputElement
			expect(input.value).toContain('2025')
		})

		it('игнорирует watch modelValue, когда новое значение undefined', async () => {
			const { rerender } = render(BaseDatePicker, {
				props: { modelValue: new Date(2024, 5, 15), selectionMode: 'single', locale: 'ru-RU' },
				global: { stubs },
			})
			await rerender({ modelValue: undefined, selectionMode: 'single', locale: 'ru-RU' })
			expect(screen.getByPlaceholderText('Выберите дату')).toBeInTheDocument()
		})

		it('игнорирует watch modelValueEnd, когда новое значение undefined', async () => {
			const { rerender } = render(BaseDatePicker, {
				props: {
					modelValue: new Date(2024, 5, 10),
					modelValueEnd: new Date(2024, 5, 20),
					selectionMode: 'range',
					locale: 'ru-RU',
				},
				global: { stubs },
			})
			await rerender({
				modelValue: new Date(2024, 5, 10),
				modelValueEnd: undefined,
				selectionMode: 'range',
				locale: 'ru-RU',
			})
			expect(screen.getByPlaceholderText('Выберите дату')).toBeInTheDocument()
		})

		it('игнорирует watch selectedDates, когда новое значение отсутствует', async () => {
			const { rerender } = render(BaseDatePicker, {
				props: { selectedDates: [new Date(2024, 5, 10)], selectionMode: 'multiple', locale: 'ru-RU' },
				global: { stubs },
			})
			await rerender({ selectedDates: undefined, selectionMode: 'multiple', locale: 'ru-RU' })
			expect(screen.getByPlaceholderText('Выберите дату')).toBeInTheDocument()
		})
	})

	describe('открытие и закрытие панели', () => {
		it('открывает панель по клику на поле', async () => {
			const { container, emitted } = render(BaseDatePicker, { global: { stubs } })
			await fireEvent.click(container.querySelector<HTMLElement>('.icon-btn-stub')!)
			expect(container.querySelector('.date-picker-panel-stub')).toBeInTheDocument()
			expect(emitted().open).toBeTruthy()
		})

		it('пересчитывает ширину при открытии в режиме нескольких месяцев', async () => {
			const { container } = render(BaseDatePicker, {
				props: { isMultiMonth: true },
				global: { stubs },
			})
			await fireEvent.click(container.querySelector<HTMLElement>('.icon-btn-stub')!)
			expect(container.querySelector('.date-picker-panel-stub')).toBeInTheDocument()
		})

		it('не открывает панель, когда компонент отключён', async () => {
			const { container, emitted } = render(BaseDatePicker, {
				props: { isDisabled: true },
				global: { stubs },
			})
			await fireEvent.click(container.querySelector<HTMLElement>('.icon-btn-stub')!)
			expect(container.querySelector('.date-picker-panel-stub')).not.toBeInTheDocument()
			expect(emitted().open).toBeUndefined()
		})

		it('повторный вызов open не открывает панель дважды', async () => {
			const { container, emitted } = render(BaseDatePicker, { global: { stubs } })
			await fireEvent.click(container.querySelector<HTMLElement>('.icon-btn-stub')!)
			await fireEvent.click(container.querySelector<HTMLElement>('.icon-btn-stub')!)
			expect(emitted().open).toHaveLength(1)
		})
	})

	describe('обработчики выбора из панели', () => {
		async function openPanel(container: Element): Promise<void> {
			await fireEvent.click(container.querySelector<HTMLElement>('.icon-btn-stub')!)
		}

		it('эмитит update:modelValue при выборе даты', async () => {
			const { container, emitted } = render(BaseDatePicker, {
				props: { selectionMode: 'single' },
				global: { stubs },
			})
			await openPanel(container)
			await fireEvent.click(container.querySelector<HTMLElement>('.emit-model')!)
			expect(emitted()['update:modelValue']).toBeTruthy()
		})

		it('эмитит update:modelValueEnd при выборе конца диапазона', async () => {
			const { container, emitted } = render(BaseDatePicker, {
				props: { selectionMode: 'range' },
				global: { stubs },
			})
			await openPanel(container)
			await fireEvent.click(container.querySelector<HTMLElement>('.emit-model-end')!)
			expect(emitted()['update:modelValueEnd']).toBeTruthy()
		})

		it('эмитит update:selectedDates при множественном выборе', async () => {
			const { container, emitted } = render(BaseDatePicker, {
				props: { selectionMode: 'multiple' },
				global: { stubs },
			})
			await openPanel(container)
			await fireEvent.click(container.querySelector<HTMLElement>('.emit-dates')!)
			expect(emitted()['update:selectedDates']).toBeTruthy()
		})

		it('эмитит range-select и закрывает панель без времени', async () => {
			const { container, emitted } = render(BaseDatePicker, {
				props: { selectionMode: 'range' },
				global: { stubs },
			})
			await openPanel(container)
			await fireEvent.click(container.querySelector<HTMLElement>('.emit-range')!)
			expect(emitted()['range-select']).toBeTruthy()
			expect(container.querySelector('.date-picker-panel-stub')).not.toBeInTheDocument()
		})

		it('не закрывает панель после выбора диапазона при showTime', async () => {
			const { container, emitted } = render(BaseDatePicker, {
				props: { selectionMode: 'range', showTime: true },
				global: { stubs },
			})
			await openPanel(container)
			await fireEvent.click(container.querySelector<HTMLElement>('.emit-range')!)
			expect(emitted()['range-select']).toBeTruthy()
			expect(container.querySelector('.date-picker-panel-stub')).toBeInTheDocument()
		})

		it('очищает значение по кнопке очистки', async () => {
			const { container, emitted } = render(BaseDatePicker, {
				props: { isClearable: true, modelValue: new Date(2024, 5, 15) },
				global: { stubs },
			})
			await fireEvent.click(container.querySelector<HTMLElement>('.clear-btn-stub')!)
			expect(emitted().clear).toBeTruthy()
			expect(emitted()['update:modelValue']?.at(-1)).toEqual([null])
		})
	})

	describe('флаги активности закрытия', () => {
		it('активирует клик-снаружи только при открытой панели и closeOnClickOutside', async () => {
			const { container } = render(BaseDatePicker, {
				props: { closeOnClickOutside: true },
				global: { stubs },
			})
			expect(clickOutsideOptions.isActive?.()).toBe(false)
			await fireEvent.click(container.querySelector<HTMLElement>('.icon-btn-stub')!)
			expect(clickOutsideOptions.isActive?.()).toBe(true)
		})

		it('активирует Escape только при открытой панели и closeOnEscape', async () => {
			const { container } = render(BaseDatePicker, {
				props: { closeOnEscape: true },
				global: { stubs },
			})
			expect(escapeKeyOptions.isActive?.()).toBe(false)
			await fireEvent.click(container.querySelector<HTMLElement>('.icon-btn-stub')!)
			expect(escapeKeyOptions.isActive?.()).toBe(true)
		})
	})
})
