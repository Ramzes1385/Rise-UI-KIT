<template>
	<Teleport to="body">
		<Transition name="dropdown">
			<div
				v-if="resolvedProps.isOpen"
				ref="panelRef"
				class="date-picker-panel"
				:class="[{ 'date-picker-panel--multi': safeMonthsCount > 1 }, classes.root]"
				:style="resolvedProps.panelStyle"
				:data-theme="resolvedProps.theme">
				<!-- Общая навигация -->
				<div class="date-picker-panel__header">
					<div class="date-picker-panel__nav-group date-picker-panel__nav-group--prev">
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn date-picker-panel__nav-btn--double"
							:title="UI_PREV_YEAR_ARIA"
							:size-scale="resolvedProps.sizeScale"
							@click="handlePrevYear">
							<BaseIcon name="chevron-left" :size-scale="calcIconScale('xs', resolvedProps.sizeScale)" />
							<BaseIcon name="chevron-left" :size-scale="calcIconScale('xs', resolvedProps.sizeScale)" />
						</BaseButton>
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn"
							:title="UI_PREV_MONTH_ARIA"
							:size-scale="resolvedProps.sizeScale"
							@click="handlePrevRange">
							<BaseIcon name="chevron-left" :size-scale="calcIconScale('sm', resolvedProps.sizeScale)" />
						</BaseButton>
					</div>

					<div class="date-picker-panel__year-title">
						<BaseText tag="span" :weight="700" :size-scale="resolvedProps.sizeScale">
							{{ displayYear }}
						</BaseText>
					</div>

					<div class="date-picker-panel__nav-group date-picker-panel__nav-group--next">
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn"
							:title="UI_NEXT_MONTH_ARIA"
							:size-scale="resolvedProps.sizeScale"
							@click="handleNextRange">
							<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', resolvedProps.sizeScale)" />
						</BaseButton>
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn date-picker-panel__nav-btn--double"
							:title="UI_NEXT_YEAR_ARIA"
							:size-scale="resolvedProps.sizeScale"
							@click="handleNextYear">
							<BaseIcon name="chevron-right" :size-scale="calcIconScale('xs', resolvedProps.sizeScale)" />
							<BaseIcon name="chevron-right" :size-scale="calcIconScale('xs', resolvedProps.sizeScale)" />
						</BaseButton>
					</div>
				</div>

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
						v-bind="resolvedCalendarConfig"
						:show-navigation="false"
						:can-switch-view="false"
						:show-year="safeMonthsCount === 1"
						:show-today-button="safeMonthsCount === 1"
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
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import './DatePickerPanel.style.scss'
import type { DatePickerPanelEmits, DatePickerPanelProps } from './DatePickerPanel.types'

import { BaseButton } from '@components/BaseButton'
import { BaseCalendar } from '@components/BaseCalendar'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { UI_NEXT_MONTH_ARIA, UI_NEXT_YEAR_ARIA, UI_PREV_MONTH_ARIA, UI_PREV_YEAR_ARIA } from '@constants'
import { computed, getCurrentInstance, ref } from 'vue'
import { useDatePickerPanelNavigation } from '../../composables/useDatePickerPanelNavigation'
import { pickDatePickerCalendarConfig, resolveBooleanPropDefault } from '../../model/BaseDatePickerCalendar.types'
import DatePickerRangePanel from '../DatePickerRangePanel/DatePickerRangePanel.vue'

const props = defineProps<DatePickerPanelProps>()
const rawProps = getCurrentInstance()?.vnode.props

const resolvedProps = computed(() => ({
	isOpen: props.isOpen ?? false,
	selectionMode: props.selectionMode ?? 'single',
	calendarVariant: props.calendarVariant ?? 'default',
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
			is24Hour: resolveBooleanPropDefault(rawProps, 'is24Hour', props.is24Hour, true),
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
