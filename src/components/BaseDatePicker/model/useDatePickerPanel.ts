/** Composable: логика DatePickerPanel — навигация по месяцам и годам, настройки календарей и события выбора */
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import { useLayerIndex } from '@composables/useLayerStack'
import { useCustomClass } from '@composables/useCustomClass'
import { useTeleportTarget } from '@composables/useTeleportTarget'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { useDatePickerPanelNavigation } from '@composables/useDatePickerPanelNavigation'
import type { DatePickerPanelEmits, DatePickerPanelProps } from '../types/DatePickerPanel.types'
import { pickDatePickerCalendarConfig, toBaseCalendarProps, withoutTimeBlock } from './datePickerCalendarConfig'

const PANEL_ELEMENTS = [
	'root',
	'header',
	'navGroupPrev',
	'navGroupNext',
	'navBtn',
	'navBtnDouble',
	'navIcon',
	'yearTitle',
	'yearText',
	'calendar',
]

function resolvePanelProps(props: DatePickerPanelProps) {
	return {
		isOpen: props.isOpen ?? false,
		selectionMode: props.selectionMode ?? 'single',
		calendarVariant: props.calendarVariant ?? 'ghost',
		sizeScale: props.sizeScale ?? 100,
		selectedDates: props.selectedDates ?? [],
		monthsCount: props.monthsCount ?? 1,
		panelStyle: props.panelStyle ?? {},
		theme: props.theme ?? null,
	}
}

function useNavigation(props: DatePickerPanelProps, resolvedProps: ComputedRef<ReturnType<typeof resolvePanelProps>>) {
	return useDatePickerPanelNavigation({
		isOpen: () => props.isOpen,
		modelValue: () => props.modelValue,
		modelValueEnd: () => props.modelValueEnd,
		selectedDates: () => resolvedProps.value.selectedDates,
		monthsCount: () => resolvedProps.value.monthsCount,
	})
}

/** Настройки календарей: calendarConfig или плоские пропсы; год и «Сегодня» — только в одиночном месяце */
function useCalendarBindings(props: DatePickerPanelProps, isSingleMonth: () => boolean) {
	const { resolveBooleanPropDefault } = useExplicitPropDetection()
	const resolvedCalendarConfig = computed(
		() =>
			props.calendarConfig ??
			pickDatePickerCalendarConfig({ ...props, is24Hour: resolveBooleanPropDefault('is24Hour', props.is24Hour, true) }),
	)
	const calendarBindings = computed(() =>
		toBaseCalendarProps(resolvedCalendarConfig.value, { showYear: isSingleMonth(), showTodayButton: isSingleMonth() }),
	)
	return {
		resolvedCalendarConfig,
		calendarBindings,
		// Календари после первого — без блока времени: он один на всё значение
		secondaryCalendarBindings: computed(() => withoutTimeBlock(calendarBindings.value)),
	}
}

function createRelays(emit: DatePickerPanelEmits) {
	return {
		handleModelUpdate: (value: Date | null): void => emit('model-update', value),
		handleModelEndUpdate: (value: Date | null): void => emit('model-end-update', value),
		handleSelectedUpdate: (value: Date[]): void => emit('selected-update', value),
		handleRangeSelect: (start: Date, end: Date): void => emit('range-select', start, end),
	}
}

export function useDatePickerPanel(props: DatePickerPanelProps, emit: DatePickerPanelEmits) {
	// Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo)
	const teleportTarget = useTeleportTarget()
	const resolvedProps = computed(() => resolvePanelProps(props))
	// Место панели среди открытых слоёв: календарь в окне — над окном
	const layerStyle = useLayerIndex(() => resolvedProps.value.isOpen)
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: PANEL_ELEMENTS })
	// Элемент панели — для useClickOutside в родителе
	const panelRef = ref<HTMLElement | null>(null)
	const navigation = useNavigation(props, resolvedProps)

	return {
		teleportTarget,
		resolvedProps,
		layerStyle,
		classes,
		panelRef,
		...navigation,
		...useCalendarBindings(props, () => navigation.safeMonthsCount.value === 1),
		...createRelays(emit),
		exposed: { panelRef },
	}
}
