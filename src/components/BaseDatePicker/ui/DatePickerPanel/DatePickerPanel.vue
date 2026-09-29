<template>
	<Teleport defer :to="teleportTarget">
		<Transition name="date-picker-panel">
			<div
				v-if="resolvedProps.isOpen"
				ref="panelRef"
				role="dialog"
				:aria-label="UI_TEXT.SELECT_DATE"
				class="date-picker-panel"
				:class="[{ 'date-picker-panel--multi': safeMonthsCount > 1 }, classes.root]"
				:style="[resolvedProps.panelStyle, layerStyle]"
				:data-theme="resolvedProps.theme">
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
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { UI_ARIA, UI_TEXT } from '@/locales/messages'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseCalendar } from '@components/BaseCalendar'
import { useDatePickerPanel } from '../../model/useDatePickerPanel'
import DatePickerRangePanel from '../DatePickerRangePanel/DatePickerRangePanel.vue'
import type { DatePickerPanelEmits, DatePickerPanelProps } from '../../types/DatePickerPanel.types'

const props = defineProps<DatePickerPanelProps>()

const emit = defineEmits<DatePickerPanelEmits>()

const {
	teleportTarget,
	resolvedProps,
	layerStyle,
	classes,
	panelRef,
	safeMonthsCount,
	displayYear,
	monthItems,
	handleMonthChange,
	handleYearChange,
	handlePrevRange,
	handleNextRange,
	handlePrevYear,
	handleNextYear,
	resolvedCalendarConfig,
	calendarBindings,
	secondaryCalendarBindings,
	handleModelUpdate,
	handleModelEndUpdate,
	handleSelectedUpdate,
	handleRangeSelect,
	exposed,
} = useDatePickerPanel(props, emit)

defineExpose(exposed)
</script>
