/**
 * Интеграционные тесты для BaseDatePicker.
 * Проверяют open/close flow, clear flow, closeOnClickOutside, closeOnEscape.
 * Дочерние компоненты заменены stub'ами с событиями.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { nextTick } from 'vue'
import BaseDatePicker from '../ui/BaseDatePicker.vue'

/** Захваченный callback для closeOnClickOutside */
let clickOutsideCallback: (() => void) | null = null
/** Захваченный callback для closeOnEscape */
let escapeCallback: (() => void) | null = null

vi.mock('@composables/useClickOutside', () => ({
	useClickOutside: vi.fn((options: { callback: () => void }) => {
		clickOutsideCallback = options.callback
	}),
}))
vi.mock('@composables/useDropdownPosition', () => ({
	useDropdownPosition: () => ({
		panelStyle: { value: { position: 'fixed', top: '0px', left: '0px' } },
	}),
}))
vi.mock('@composables/useEscapeKey', () => ({
	useEscapeKey: vi.fn((options: { callback: () => void }) => {
		escapeCallback = options.callback
	}),
}))

const stubs = {
	DatePickerField: {
		template: `
			<div class="field-stub">
				<input
					:value="displayValue"
					:placeholder="placeholder"
					:disabled="isDisabled"
					readonly
					data-testid="field-input"
					@click="$emit('field-click')" />
				<button
					v-if="isClearable && hasValue"
					data-testid="clear-btn"
					@click.stop="$emit('clear-click')">
					clear
				</button>
				<button
					data-testid="icon-btn"
					@click.stop="$emit('icon-click')">
					icon
				</button>
			</div>
		`,
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
		],
		emits: ['field-click', 'clear-click', 'icon-click'],
	},
	DatePickerPanel: {
		template: `
			<div v-if="isOpen" class="panel-stub" data-testid="panel">
				<button
					data-testid="select-date-btn"
					@click="$emit('model-update', new Date(2024, 5, 15))">
					select date
				</button>
				<button
					data-testid="select-range-btn"
					@click="$emit('range-select', new Date(2024, 5, 10), new Date(2024, 5, 20))">
					select range
				</button>
				<button
					data-testid="select-multiple-btn"
					@click="$emit('selected-update', [new Date(2024, 5, 10), new Date(2024, 5, 15)])">
					select multiple
				</button>
			</div>
		`,
		props: [
			'isOpen',
			'modelValue',
			'modelValueEnd',
			'selectedDates',
			'selectionMode',
			'calendarVariant',
			'minDate',
			'maxDate',
			'disabledDates',
			'disabledWeekdays',
			'disableFrom',
			'disableTo',
			'highlights',
			'weekends',
			'firstDayOfWeek',
			'showTime',
			'showSeconds',
			'is24Hour',
			'showWeekNumber',
			'locale',
			'sizeScale',
			'monthsCount',
			'panelStyle',
		],
		emits: ['model-update', 'model-end-update', 'selected-update', 'range-select'],
	},
}

describe('BaseDatePicker integration', () => {
	beforeEach(() => {
		clickOutsideCallback = null
		escapeCallback = null
	})

	describe('открытие/закрытие', () => {
		it('должен открыть панель по клику на инпут', async () => {
			const { emitted } = render(BaseDatePicker, { global: { stubs } })

			const input = screen.getByTestId('field-input')
			await fireEvent.click(input)

			expect(screen.getByTestId('panel')).toBeInTheDocument()
			expect(emitted()).toHaveProperty('open')
		})

		it('должен эмитить open только один раз', async () => {
			const { emitted } = render(BaseDatePicker, { global: { stubs } })

			const input = screen.getByTestId('field-input')
			await fireEvent.click(input)

			expect(emitted('open')).toHaveLength(1)
		})

		it('повторный клик по инпуту не должен закрывать панель', async () => {
			render(BaseDatePicker, { global: { stubs } })

			const input = screen.getByTestId('field-input')
			await fireEvent.click(input)
			expect(screen.getByTestId('panel')).toBeInTheDocument()

			await fireEvent.click(input)
			expect(screen.getByTestId('panel')).toBeInTheDocument()
		})

		it('повторный клик не должен эмитить open второй раз', async () => {
			const { emitted } = render(BaseDatePicker, { global: { stubs } })

			const input = screen.getByTestId('field-input')
			await fireEvent.click(input)
			await fireEvent.click(input)

			expect(emitted('open')).toHaveLength(1)
		})

		it('не должен открываться при isDisabled', async () => {
			render(BaseDatePicker, {
				props: { isDisabled: true },
				global: { stubs },
			})

			const input = screen.getByTestId('field-input')
			await fireEvent.click(input)

			expect(screen.queryByTestId('panel')).not.toBeInTheDocument()
		})
	})

	describe('закрытие после выбора', () => {
		it('выбор даты в single без времени должен закрыть панель', async () => {
			const { emitted } = render(BaseDatePicker, {
				props: { selectionMode: 'single', showTime: false },
				global: { stubs },
			})

			const input = screen.getByTestId('field-input')
			await fireEvent.click(input)
			expect(screen.getByTestId('panel')).toBeInTheDocument()

			const selectBtn = screen.getByTestId('select-date-btn')
			await fireEvent.click(selectBtn)

			expect(screen.queryByTestId('panel')).not.toBeInTheDocument()
			expect(emitted()).toHaveProperty('close')
			expect(emitted()).toHaveProperty('update:modelValue')
		})

		it('выбор даты в single со временем не должен закрыть панель', async () => {
			render(BaseDatePicker, {
				props: { selectionMode: 'single', showTime: true },
				global: { stubs },
			})

			const input = screen.getByTestId('field-input')
			await fireEvent.click(input)

			const selectBtn = screen.getByTestId('select-date-btn')
			await fireEvent.click(selectBtn)

			expect(screen.getByTestId('panel')).toBeInTheDocument()
		})

		it('выбор диапазона должен закрыть панель', async () => {
			const { emitted } = render(BaseDatePicker, {
				props: { selectionMode: 'range' },
				global: { stubs },
			})

			const input = screen.getByTestId('field-input')
			await fireEvent.click(input)

			const rangeBtn = screen.getByTestId('select-range-btn')
			await fireEvent.click(rangeBtn)

			expect(screen.queryByTestId('panel')).not.toBeInTheDocument()
			expect(emitted()).toHaveProperty('range-select')
		})

		it('range должен обновлять поле без внешнего v-model', async () => {
			render(BaseDatePicker, {
				props: { selectionMode: 'range' },
				global: { stubs },
			})

			const input = screen.getByTestId('field-input') as HTMLInputElement
			await fireEvent.click(input)

			const rangeBtn = screen.getByTestId('select-range-btn')
			await fireEvent.click(rangeBtn)

			expect(input.value).toContain('—')
			expect(input.value).toContain('2024')
		})

		it('multiple должен обновлять поле без внешнего v-model', async () => {
			render(BaseDatePicker, {
				props: { selectionMode: 'multiple' },
				global: { stubs },
			})

			const input = screen.getByTestId('field-input') as HTMLInputElement
			await fireEvent.click(input)

			const multipleBtn = screen.getByTestId('select-multiple-btn')
			await fireEvent.click(multipleBtn)

			expect(input.value).toContain('2024')
			expect(input.value).toContain(',')
		})
	})

	describe('isMultiMonth ResizeObserver', () => {
		it('должен пересчитывать ширину обёртки по обоим форматам ResizeObserverEntry', async () => {
			let observerCallback: ((entries: unknown[]) => void) | null = null
			const originalRO = globalThis.ResizeObserver
			globalThis.ResizeObserver = class {
				constructor(cb: (entries: unknown[]) => void) {
					observerCallback = cb
				}
				observe() {}
				unobserve() {}
				disconnect() {}
			} as unknown as typeof ResizeObserver

			render(BaseDatePicker, {
				props: { isMultiMonth: true },
				global: { stubs },
			})

			await nextTick()
			expect(observerCallback).toBeTruthy()

			const target = document.createElement('div')
			Object.defineProperty(target, 'clientWidth', { value: 640, configurable: true })

			observerCallback!([{ contentBoxSize: [{ inlineSize: 640 }], target, contentRect: { width: 0 } }])
			observerCallback!([{ contentBoxSize: undefined, target, contentRect: { width: 480 } }])

			globalThis.ResizeObserver = originalRO
		})
	})

	describe('clear flow', () => {
		it('clear должен эмитить события сброса', async () => {
			const { emitted } = render(BaseDatePicker, {
				props: {
					isClearable: true,
					modelValue: new Date(2024, 5, 15),
				},
				global: { stubs },
			})

			const clearBtn = screen.getByTestId('clear-btn')
			await fireEvent.click(clearBtn)

			expect(emitted()).toHaveProperty('update:modelValue')
			expect(emitted()).toHaveProperty('update:modelValueEnd')
			expect(emitted()).toHaveProperty('update:selectedDates')
			expect(emitted()).toHaveProperty('clear')
		})
	})

	describe('close правила', () => {
		it('должен закрыть панель при closeOnClickOutside', async () => {
			const { emitted } = render(BaseDatePicker, {
				props: { closeOnClickOutside: true },
				global: { stubs },
			})

			const input = screen.getByTestId('field-input')
			await fireEvent.click(input)
			expect(screen.getByTestId('panel')).toBeInTheDocument()

			expect(clickOutsideCallback).not.toBeNull()
			clickOutsideCallback!()
			await nextTick()

			expect(screen.queryByTestId('panel')).not.toBeInTheDocument()
			expect(emitted()).toHaveProperty('close')
		})

		it('должен закрыть панель при closeOnEscape', async () => {
			const { emitted } = render(BaseDatePicker, {
				props: { closeOnEscape: true },
				global: { stubs },
			})

			const input = screen.getByTestId('field-input')
			await fireEvent.click(input)
			expect(screen.getByTestId('panel')).toBeInTheDocument()

			expect(escapeCallback).not.toBeNull()
			escapeCallback!()
			await nextTick()

			expect(screen.queryByTestId('panel')).not.toBeInTheDocument()
			expect(emitted()).toHaveProperty('close')
		})

		it('close не должен эмититься если панель уже закрыта', async () => {
			const { emitted } = render(BaseDatePicker, {
				props: { closeOnClickOutside: true },
				global: { stubs },
			})

			expect(clickOutsideCallback).not.toBeNull()
			clickOutsideCallback!()

			expect(emitted()).not.toHaveProperty('close')
		})
	})
})

