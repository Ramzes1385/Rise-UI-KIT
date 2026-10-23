import { mount } from '@vue/test-utils'
import { useDatePickerState } from '../useDatePickerState'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import type { UseDatePickerStateOptions } from '../types/useDatePickerState.types'

type Props = UseDatePickerStateOptions['props']
type Resolved = UseDatePickerStateOptions['resolvedProps']['value']
type CalendarConfig = UseDatePickerStateOptions['calendarConfig']['value']

const observers: { callback: ResizeObserverCallback; disconnect: ReturnType<typeof vi.fn> }[] = []

class FakeResizeObserver {
	disconnect = vi.fn()
	callback: ResizeObserverCallback
	constructor(callback: ResizeObserverCallback) {
		this.callback = callback
		observers.push(this)
	}
	observe() {}
	unobserve() {}
}

function setWidth(el: HTMLElement, width: number): void {
	Object.defineProperty(el, 'clientWidth', { configurable: true, value: width })
}

interface SetupOptions {
	props?: Props
	resolved?: Partial<Resolved>
	config?: Partial<CalendarConfig>
	width?: number
	bindWrapper?: boolean
}

function setup(options: SetupOptions = {}) {
	const props = reactive<Props>({ ...options.props })
	const resolved = ref<Resolved>({
		selectionMode: 'single',
		dateFormat: 'dd.MM.yyyy',
		isDisabled: false,
		isMultiMonth: false,
		sizeScale: 100,
		closeOnClickOutside: true,
		closeOnEscape: true,
		gap: 4,
		...options.resolved,
	})
	const config = ref<CalendarConfig>({ showTime: false, showSeconds: false, is24Hour: true, locale: 'ru-RU', ...options.config })
	const emit = vi.fn()
	let state!: ReturnType<typeof useDatePickerState>

	const wrapper = mount(
		defineComponent({
			setup() {
				state = useDatePickerState({ props, resolvedProps: resolved, emit, calendarConfig: config })
				return () =>
					h('div', { 'data-theme': 'dark' }, [
						options.bindWrapper === false
							? h('div', [h('input')])
							: h(
									'div',
									{
										ref: (el: unknown) => {
											if (el) setWidth(el as HTMLElement, options.width ?? 300)
											state.wrapperRef.value = el as HTMLElement | null
										},
									},
									[h('input', { 'aria-label': 'Дата' })],
								),
					])
			},
		}),
		{ attachTo: document.body },
	)

	const panel = document.createElement('div')
	panel.innerHTML = `
		<button class="base-calendar__day base-calendar__day--other">30</button>
		<button class="base-calendar__day" data-day="1">1</button>
		<button class="base-calendar__day base-calendar__day--today" data-day="2">2</button>
		<button class="base-calendar__day base-calendar__day--selected" data-day="3">3</button>`
	document.body.appendChild(panel)

	function attachPanel(): void {
		state.panelRef.value = { panelRef: panel }
	}

	return { state, emit, props, resolved, config, panel, attachPanel, wrapper }
}

describe('useDatePickerState', () => {
	beforeEach(() => {
		observers.length = 0
		vi.stubGlobal('ResizeObserver', FakeResizeObserver)
	})

	afterEach(() => {
		document.body.innerHTML = ''
		vi.unstubAllGlobals()
	})

	describe('открытие и закрытие', () => {
		it('открывается по клику на поле, запоминает тему и не открывается повторно', () => {
			const { state, emit } = setup()
			state.handleFieldClick()
			state.handleFieldClick()

			expect(state.isOpen.value).toBe(true)
			expect(state.currentTheme.value).toBe('dark')
			expect(emit.mock.calls.filter(([name]) => name === 'open')).toHaveLength(1)
		})

		it('без темы вокруг поля тема не задаётся', () => {
			const { state, wrapper } = setup()
			wrapper.element.removeAttribute('data-theme')
			state.handleFieldClick()
			expect(state.currentTheme.value).toBeNull()
			expect(state.currentRiseTheme.value).toBeNull()
			expect(state.currentMotion.value).toBeNull()
		})

		it('запоминает тему бренда области поля (data-rise-theme)', () => {
			const { state, wrapper } = setup()
			wrapper.element.setAttribute('data-rise-theme', 'playful')
			state.handleFieldClick()
			expect(state.currentRiseTheme.value).toBe('playful')
			expect(state.currentTheme.value).toBe('dark')
		})

		it('запоминает пресет движения области поля (data-rise-motion)', () => {
			const { state, wrapper } = setup()
			wrapper.element.setAttribute('data-rise-motion', 'none')
			state.handleFieldClick()
			expect(state.currentMotion.value).toBe('none')
			expect(state.currentTheme.value).toBe('dark')
		})

		it('в отключённом состоянии не открывается', () => {
			const { state, emit } = setup({ resolved: { isDisabled: true } })
			state.handleFieldClick()
			state.handleKeyboardOpen()
			expect(state.isOpen.value).toBe(false)
			expect(emit).not.toHaveBeenCalled()
		})

		it('закрывается по Escape', async () => {
			const { state, emit } = setup()
			state.handleFieldClick()
			await nextTick()
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

			expect(state.isOpen.value).toBe(false)
			expect(emit).toHaveBeenCalledWith('close')
		})

		it('Escape не закрывает, если это выключено', async () => {
			const { state } = setup({ resolved: { closeOnEscape: false } })
			state.handleFieldClick()
			await nextTick()
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
			expect(state.isOpen.value).toBe(true)
		})

		it('закрывается кликом вне поля и панели, а клик по панели её не закрывает', async () => {
			const { state, panel, attachPanel } = setup()
			attachPanel()
			state.handleFieldClick()
			await nextTick()

			panel.querySelector('button')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
			expect(state.isOpen.value).toBe(true)

			document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
			expect(state.isOpen.value).toBe(false)
		})

		it('клик вне не закрывает, если это выключено', async () => {
			const { state } = setup({ resolved: { closeOnClickOutside: false } })
			state.handleFieldClick()
			await nextTick()
			document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
			expect(state.isOpen.value).toBe(true)
		})
	})

	describe('открытие с клавиатуры', () => {
		it.each([
			['выбранную', [], '3'],
			['сегодняшнюю', ['.base-calendar__day--selected'], '2'],
			['первую доступную', ['.base-calendar__day--selected', '.base-calendar__day--today'], '1'],
		])('переводит фокус на %s дату', async (_name, removed, expected) => {
			const { state, panel, attachPanel } = setup()
			removed.forEach(selector => panel.querySelector(selector)!.remove())
			attachPanel()
			state.handleKeyboardOpen()
			await nextTick()

			expect((document.activeElement as HTMLElement).dataset.day).toBe(expected)
		})

		it('без доступных дат фокус не переносится', async () => {
			const { state, panel, attachPanel } = setup()
			panel.innerHTML = '<button class="base-calendar__day" disabled>1</button>'
			attachPanel()
			state.handleKeyboardOpen()
			await nextTick()
			expect(document.activeElement).toBe(document.body)
		})

		it('без отрисованной панели только открывается', async () => {
			const { state } = setup()
			state.handleKeyboardOpen()
			await nextTick()
			expect(state.isOpen.value).toBe(true)
			expect(document.activeElement).toBe(document.body)
		})

		it('после выбора даты с клавиатуры возвращает фокус в поле', async () => {
			const { state, attachPanel } = setup()
			attachPanel()
			state.handleKeyboardOpen()
			await nextTick()
			state.handleModelUpdate(new Date(2026, 4, 3))

			expect(state.isOpen.value).toBe(false)
			expect(document.activeElement).toBe(document.querySelector('input'))
		})
	})

	describe('одиночная дата', () => {
		it('выбор даты обновляет значение, показывает его в поле и закрывает панель', () => {
			const { state, emit } = setup()
			state.handleFieldClick()
			state.handleModelUpdate(new Date(2026, 4, 5))

			expect(emit).toHaveBeenCalledWith('update:modelValue', new Date(2026, 4, 5))
			expect(state.hasValue.value).toBe(true)
			expect(state.displayValue.value).toBe('05.05.2026')
			expect(state.isOpen.value).toBe(false)
		})

		it('с выбором времени и при сбросе значения панель остаётся открытой', () => {
			const timed = setup({ config: { showTime: true } })
			timed.state.handleFieldClick()
			timed.state.handleModelUpdate(new Date(2026, 4, 5, 10, 30))
			expect(timed.state.isOpen.value).toBe(true)

			const cleared = setup()
			cleared.state.handleFieldClick()
			cleared.state.handleModelUpdate(null)
			expect(cleared.state.isOpen.value).toBe(true)
			expect(cleared.state.hasValue.value).toBe(false)
			expect(cleared.state.displayValue.value).toBe('')
		})

		it('управляемое значение берётся из пропсов и следует за ними', async () => {
			const { state, props } = setup({ props: { modelValue: new Date(2026, 0, 1) } })
			expect(state.activeValue.value).toEqual(new Date(2026, 0, 1))

			props.modelValue = new Date(2026, 1, 2)
			await nextTick()
			expect(state.activeValue.value).toEqual(new Date(2026, 1, 2))

			props.modelValue = undefined
			await nextTick()
			expect(state.activeValue.value).toEqual(new Date(2026, 1, 2))
		})
	})

	describe('диапазон', () => {
		it('выбор диапазона эмитит обе границы и закрывает панель', () => {
			const { state, emit } = setup({ resolved: { selectionMode: 'range' } })
			state.handleFieldClick()
			const start = new Date(2026, 4, 5)
			const end = new Date(2026, 4, 9)
			state.handleRangeSelect(start, end)

			expect(emit).toHaveBeenCalledWith('range-select', start, end)
			expect(state.activeValue.value).toEqual(start)
			expect(state.activeValueEnd.value).toEqual(end)
			expect(state.displayValue.value).toContain('05.05.2026')
			expect(state.displayValue.value).toContain('09.05.2026')
			expect(state.isOpen.value).toBe(false)
		})

		it('с выбором времени панель остаётся открытой', () => {
			const { state } = setup({ resolved: { selectionMode: 'range' }, config: { showTime: true } })
			state.handleFieldClick()
			state.handleRangeSelect(new Date(2026, 4, 5), new Date(2026, 4, 9))
			expect(state.isOpen.value).toBe(true)
		})

		it('считает значением одну заполненную границу', () => {
			const { state, emit } = setup({ resolved: { selectionMode: 'range' } })
			expect(state.hasValue.value).toBe(false)
			state.handleModelEndUpdate(new Date(2026, 4, 9))

			expect(emit).toHaveBeenCalledWith('update:modelValueEnd', new Date(2026, 4, 9))
			expect(state.hasValue.value).toBe(true)
		})

		it('управляемый конец диапазона следует за пропсами', async () => {
			const { state, props } = setup({ props: { modelValueEnd: new Date(2026, 0, 1) }, resolved: { selectionMode: 'range' } })
			expect(state.activeValueEnd.value).toEqual(new Date(2026, 0, 1))

			props.modelValueEnd = new Date(2026, 0, 7)
			await nextTick()
			expect(state.activeValueEnd.value).toEqual(new Date(2026, 0, 7))

			props.modelValueEnd = undefined
			await nextTick()
			expect(state.activeValueEnd.value).toEqual(new Date(2026, 0, 7))
		})
	})

	describe('несколько дат', () => {
		it('обновляет список дат', () => {
			const { state, emit } = setup({ resolved: { selectionMode: 'multiple' } })
			expect(state.hasValue.value).toBe(false)
			const dates = [new Date(2026, 4, 1), new Date(2026, 4, 3)]
			state.handleSelectedDatesUpdate(dates)

			expect(emit).toHaveBeenCalledWith('update:selectedDates', dates)
			expect(state.activeDates.value).toEqual(dates)
			expect(state.hasValue.value).toBe(true)
		})

		it('управляемый список дат следует за пропсами', async () => {
			const { state, props } = setup({ props: { selectedDates: [new Date(2026, 0, 1)] }, resolved: { selectionMode: 'multiple' } })
			expect(state.activeDates.value).toEqual([new Date(2026, 0, 1)])

			props.selectedDates = [new Date(2026, 0, 2)]
			await nextTick()
			expect(state.activeDates.value).toEqual([new Date(2026, 0, 2)])

			props.selectedDates = undefined
			await nextTick()
			expect(state.activeDates.value).toEqual([new Date(2026, 0, 2)])
		})
	})

	it('очистка сбрасывает все значения', () => {
		const { state, emit } = setup({ resolved: { selectionMode: 'range' } })
		state.handleRangeSelect(new Date(2026, 4, 5), new Date(2026, 4, 9))
		state.handleSelectedDatesUpdate([new Date(2026, 4, 1)])
		state.handleClear()

		expect(state.activeValue.value).toBeNull()
		expect(state.activeValueEnd.value).toBeNull()
		expect(state.activeDates.value).toEqual([])
		expect(emit).toHaveBeenCalledWith('update:modelValue', null)
		expect(emit).toHaveBeenCalledWith('update:modelValueEnd', null)
		expect(emit).toHaveBeenCalledWith('update:selectedDates', [])
		expect(emit).toHaveBeenCalledWith('clear')
	})

	it('панель ограничена высотой окна и в многомесячном режиме равна ширине поля', async () => {
		const { state, attachPanel } = setup({ resolved: { isMultiMonth: true } })
		attachPanel()
		state.handleFieldClick()
		await nextTick()

		expect(state.panelStyle.value).toMatchObject({ maxHeight: 'calc(100vh - 16px)', width: expect.stringMatching(/px$/) })
	})

	it('с заданным числом месяцев панель не растягивается до ширины поля', async () => {
		const { state, attachPanel } = setup({ resolved: { isMultiMonth: true, monthsShown: 2 } })
		attachPanel()
		state.handleFieldClick()
		await nextTick()

		expect(state.panelStyle.value).toMatchObject({ maxHeight: 'calc(100vh - 16px)' })
		expect(state.panelStyle.value).not.toHaveProperty('width')
	})

	describe('число месяцев в панели', () => {
		it('колонка готовых периодов уменьшает место для месяцев', () => {
			expect(setup({ resolved: { isMultiMonth: true }, width: 900 }).state.computedMonthsCount.value).toBe(3)
			expect(setup({ resolved: { isMultiMonth: true, hasPresets: true }, width: 900 }).state.computedMonthsCount.value).toBe(2)
		})

		it('monthsShown заменяет подсчёт по ширине и не зависит от isMultiMonth и maxMonths', () => {
			expect(setup({ resolved: { monthsShown: 2 }, width: 100 }).state.computedMonthsCount.value).toBe(2)
			expect(
				setup({ resolved: { isMultiMonth: true, maxMonths: 1, monthsShown: 3 }, width: 2000 }).state.computedMonthsCount.value,
			).toBe(3)
			expect(setup({ resolved: { isMultiMonth: true, monthsShown: null }, width: 900 }).state.computedMonthsCount.value).toBe(3)
		})

		it('без isMultiMonth — один месяц', () => {
			const { state } = setup({ width: 2000 })
			expect(state.computedMonthsCount.value).toBe(1)
		})

		it('помещает столько месяцев, сколько влезает по ширине поля', () => {
			expect(setup({ resolved: { isMultiMonth: true }, width: 900 }).state.computedMonthsCount.value).toBe(3)
			expect(setup({ resolved: { isMultiMonth: true }, width: 100 }).state.computedMonthsCount.value).toBe(1)
		})

		it('учитывает maxMonths, номера недель и масштаб', () => {
			expect(setup({ resolved: { isMultiMonth: true, maxMonths: 2 }, width: 900 }).state.computedMonthsCount.value).toBe(2)
			expect(
				setup({ resolved: { isMultiMonth: true }, config: { showWeekNumber: true }, width: 900 }).state.computedMonthsCount.value,
			).toBe(3)
			expect(setup({ resolved: { isMultiMonth: true, sizeScale: 200 }, width: 900 }).state.computedMonthsCount.value).toBe(1)
		})

		it('следует за изменением ширины поля', async () => {
			const { state } = setup({ resolved: { isMultiMonth: true }, width: 300 })
			expect(state.computedMonthsCount.value).toBe(1)
			const target = state.wrapperRef.value!
			setWidth(target, 600)

			observers[0].callback(
				[{ target, contentBoxSize: [{ inlineSize: 600 }], contentRect: { width: 600 } } as unknown as ResizeObserverEntry],
				{} as ResizeObserver,
			)
			expect(state.computedMonthsCount.value).toBe(2)

			observers[0].callback(
				[{ target, contentBoxSize: undefined, contentRect: { width: 900 } } as unknown as ResizeObserverEntry],
				{} as ResizeObserver,
			)
			expect(state.computedMonthsCount.value).toBe(3)
		})

		it('без привязанного поля считает ширину нулевой и не следит за размером', () => {
			const { state, wrapper } = setup({ resolved: { isMultiMonth: true }, bindWrapper: false })
			expect(state.computedMonthsCount.value).toBe(1)
			expect(observers).toHaveLength(0)
			wrapper.unmount()
		})

		it('перестаёт следить за размером после размонтирования', () => {
			const { wrapper } = setup()
			wrapper.unmount()
			expect(observers[0].disconnect).toHaveBeenCalled()
		})
	})
})
