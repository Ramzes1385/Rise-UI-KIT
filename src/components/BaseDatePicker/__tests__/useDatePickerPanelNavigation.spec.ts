import { nextTick, ref } from 'vue'
import { useDatePickerPanelNavigation } from '@composables/useDatePickerPanelNavigation'

describe('useDatePickerPanelNavigation', () => {
	it('инициализирует базовый месяц из modelValue', () => {
		const isOpen = ref(true)
		const modelValue = ref<Date | null>(new Date(2026, 0, 15))

		const navigation = useDatePickerPanelNavigation({
			isOpen: () => isOpen.value,
			modelValue: () => modelValue.value,
			modelValueEnd: () => null,
			selectedDates: () => [],
			monthsCount: () => 1,
		})

		expect(navigation.currentBaseDate.value.getMonth()).toBe(0)
		expect(navigation.currentBaseDate.value.getFullYear()).toBe(2026)
	})

	it('берёт modelValueEnd если modelValue отсутствует', () => {
		const navigation = useDatePickerPanelNavigation({
			isOpen: () => true,
			modelValue: () => null,
			modelValueEnd: () => new Date(2026, 5, 1),
			selectedDates: () => [],
			monthsCount: () => 1,
		})

		expect(navigation.currentBaseDate.value.getMonth()).toBe(5)
	})

	it('нормализует monthsCount в положительное целое', () => {
		const navigation = useDatePickerPanelNavigation({
			isOpen: () => true,
			modelValue: () => new Date(2026, 0, 1),
			modelValueEnd: () => null,
			selectedDates: () => [],
			monthsCount: () => 2.8,
		})

		expect(navigation.safeMonthsCount.value).toBe(2)
	})

	it('сдвигает диапазон месяцев вперёд и назад', () => {
		const navigation = useDatePickerPanelNavigation({
			isOpen: () => true,
			modelValue: () => new Date(2026, 0, 1),
			modelValueEnd: () => null,
			selectedDates: () => [],
			monthsCount: () => 2,
		})

		navigation.handleNextRange()
		expect(navigation.currentBaseDate.value.getMonth()).toBe(2)

		navigation.handlePrevRange()
		expect(navigation.currentBaseDate.value.getMonth()).toBe(0)
	})

	it('пересчитывает базовую дату при открытии панели', async () => {
		const isOpen = ref(false)
		const modelValue = ref<Date | null>(new Date(2026, 0, 15))

		const navigation = useDatePickerPanelNavigation({
			isOpen: () => isOpen.value,
			modelValue: () => modelValue.value,
			modelValueEnd: () => null,
			selectedDates: () => [],
			monthsCount: () => 1,
		})

		modelValue.value = new Date(2026, 4, 20)
		isOpen.value = true
		await nextTick()

		expect(navigation.currentBaseDate.value.getMonth()).toBe(4)
	})
})
