<template>
	<Teleport to="body">
		<Transition name="date-picker-panel">
			<!-- data-theme копируется с ближайшего контейнера поля: панель в body иначе взяла бы токены темы страницы -->
			<div
				v-if="resolvedProps.isOpen"
				ref="panelRef"
				role="dialog"
				:aria-label="UI_TEXT.SELECT_DATE"
				class="date-picker-panel"
				:class="[{ 'date-picker-panel--multi': safeMonthsCount > 1 }, classes.root]"
				:style="resolvedProps.panelStyle"
				:data-theme="resolvedProps.theme">
				<!-- Общая навигация: год и месяц(ы) для всех календарей панели -->
				<div class="date-picker-panel__header">
					<div class="date-picker-panel__nav-group">
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn date-picker-panel__nav-btn--double"
							:aria-label="UI_ARIA.PREV_YEAR"
							:title="UI_ARIA.PREV_YEAR"
							:size-scale="resolvedProps.sizeScale"
							@click="handlePrevYear">
							<BaseIcon name="chevron-left" :size-scale="calcIconScale('sm', resolvedProps.sizeScale)" />
							<BaseIcon name="chevron-left" :size-scale="calcIconScale('sm', resolvedProps.sizeScale)" />
						</BaseButton>
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn"
							:aria-label="UI_ARIA.PREV_MONTH"
							:title="UI_ARIA.PREV_MONTH"
							:size-scale="resolvedProps.sizeScale"
							@click="handlePrevRange">
							<BaseIcon name="chevron-left" :size-scale="calcIconScale('md', resolvedProps.sizeScale)" />
						</BaseButton>
					</div>

					<span class="date-picker-panel__year-title">{{ displayYear }}</span>

					<div class="date-picker-panel__nav-group date-picker-panel__nav-group--next">
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn"
							:aria-label="UI_ARIA.NEXT_MONTH"
							:title="UI_ARIA.NEXT_MONTH"
							:size-scale="resolvedProps.sizeScale"
							@click="handleNextRange">
							<BaseIcon name="chevron-right" :size-scale="calcIconScale('md', resolvedProps.sizeScale)" />
						</BaseButton>
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn date-picker-panel__nav-btn--double"
							:aria-label="UI_ARIA.NEXT_YEAR"
							:title="UI_ARIA.NEXT_YEAR"
							:size-scale="resolvedProps.sizeScale"
							@click="handleNextYear">
							<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', resolvedProps.sizeScale)" />
							<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', resolvedProps.sizeScale)" />
						</BaseButton>
					</div>
				</div>

				<div class="date-picker-panel__months">
					<DatePickerRangePanel
						v-if="resolvedProps.selectionMode === 'range'"
						:model-value="modelValue"
						:model-value-end="modelValueEnd"
						:selected-dates="selectedDates"
						:calendar-variant="resolvedProps.calendarVariant"
						:calendar-config="resolvedCalendarConfig"
						:size-scale="resolvedProps.sizeScale"
						:month-items="monthItems"
						@model-update="handleModelUpdate"
						@model-end-update="handleModelEndUpdate"
						@selected-update="handleSelectedUpdate"
						@range-select="handleRangeSelect"
						@month-change="handleMonthChange"
						@year-change="handleYearChange" />

					<template v-else>
						<BaseCalendar
							v-for="(item, index) in monthItems"
							:key="item.key"
							class="date-picker-panel__calendar"
							v-bind="index === 0 ? calendarBindings : secondaryCalendarBindings"
							:model-value="modelValue"
							:model-value-end="modelValueEnd"
							:selected-dates="selectedDates"
							:selection-mode="resolvedProps.selectionMode"
							:variant="resolvedProps.calendarVariant"
							:size-scale="resolvedProps.sizeScale"
							:initial-month="item.month"
							:initial-year="item.year"
							@update:model-value="handleModelUpdate"
							@update:model-value-end="handleModelEndUpdate"
							@update:selected-dates="handleSelectedUpdate"
							@range-select="handleRangeSelect"
							@month-change="m => handleMonthChange(m, index)"
							@year-change="y => handleYearChange(y, index)" />
					</template>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import './DatePickerPanel.style.scss'
import { computed, ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseCalendar } from '@components/BaseCalendar'
import { BaseIcon } from '@components/BaseIcon'
import { useCustomClass } from '@composables/useCustomClass'
import { useDatePickerPanelNavigation } from '@composables/useDatePickerPanelNavigation'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { UI_ARIA, UI_TEXT } from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import { pickDatePickerCalendarConfig, toBaseCalendarProps, withoutTimeBlock } from '../../model/BaseDatePickerCalendar.types'
import DatePickerRangePanel from '../DatePickerRangePanel/DatePickerRangePanel.vue'
import type { DatePickerPanelEmits, DatePickerPanelProps } from '../../model/DatePickerPanel.types'

const props = defineProps<DatePickerPanelProps>()
const { resolveBooleanPropDefault } = useExplicitPropDetection()

const resolvedProps = computed(() => ({
	isOpen: props.isOpen ?? false,
	selectionMode: props.selectionMode ?? 'single',
	calendarVariant: props.calendarVariant ?? 'ghost',
	sizeScale: props.sizeScale ?? 100,
	selectedDates: props.selectedDates ?? [],
	monthsCount: props.monthsCount ?? 1,
	panelStyle: props.panelStyle ?? {},
	theme: props.theme ?? null,
}))

const emit = defineEmits<DatePickerPanelEmits>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
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
	],
})

/** Ref на элемент панели (для useClickOutside из родителя) */
const panelRef = ref<HTMLElement | null>(null)

const resolvedCalendarConfig = computed(
	() =>
		props.calendarConfig ??
		pickDatePickerCalendarConfig({
			...props,
			is24Hour: resolveBooleanPropDefault('is24Hour', props.is24Hour, true),
		}),
)

const {
	safeMonthsCount,
	displayYear,
	monthItems,
	handleMonthChange,
	handleYearChange,
	handlePrevRange,
	handleNextRange,
	handlePrevYear,
	handleNextYear,
} = useDatePickerPanelNavigation({
	isOpen: () => props.isOpen,
	modelValue: () => props.modelValue,
	modelValueEnd: () => props.modelValueEnd,
	selectedDates: () => resolvedProps.value.selectedDates,
	monthsCount: () => resolvedProps.value.monthsCount,
})

/** Props BaseCalendar (single/multiple): год и «Сегодня» — только в одиночном месяце */
const calendarBindings = computed(() =>
	toBaseCalendarProps(resolvedCalendarConfig.value, {
		showYear: safeMonthsCount.value === 1,
		showTodayButton: safeMonthsCount.value === 1,
	}),
)

/** Календари после первого — без блока времени: он один на всё значение */
const secondaryCalendarBindings = computed(() => withoutTimeBlock(calendarBindings.value))

/** Проксирование modelValue */
function handleModelUpdate(value: Date | null): void {
	emit('model-update', value)
}

/** Проксирование modelValueEnd */
function handleModelEndUpdate(value: Date | null): void {
	emit('model-end-update', value)
}

/** Проксирование selectedDates */
function handleSelectedUpdate(value: Date[]): void {
	emit('selected-update', value)
}

/** Проксирование range-select */
function handleRangeSelect(start: Date, end: Date): void {
	emit('range-select', start, end)
}

/** Открыть panelRef для родителя */
defineExpose({ panelRef })
</script>
