<template>
	<Teleport defer :to="teleportTarget">
		<Transition name="date-picker-panel">
			<div
				v-if="resolvedProps.isOpen"
				ref="panelRef"
				role="dialog"
				:aria-label="UI_TEXT.SELECT_DATE"
				class="date-picker-panel"
				:class="[
					ui('panel'),
					{ 'date-picker-panel--multi': safeMonthsCount > 1, 'date-picker-panel--presets': hasPresets },
					classes.root,
				]"
				:style="[resolvedProps.panelStyle, layerStyle]"
				:data-theme="resolvedProps.theme"
				:data-rise-theme="resolvedProps.riseTheme"
				:data-rise-motion="resolvedProps.motionPreset">
				<div
					v-if="hasPresets"
					class="date-picker-panel__presets"
					:class="ui('presets')"
					role="group"
					:aria-label="UI_DATE_PICKER.PRESETS">
					<BaseButton
						v-for="preset in resolvedProps.presets"
						:key="preset.id"
						:variant="preset.isActive ? 'soft' : 'ghost'"
						class="date-picker-panel__preset"
						:class="[ui('preset'), { 'date-picker-panel__preset--active': preset.isActive }]"
						:aria-pressed="preset.isActive ? 'true' : 'false'"
						:is-disabled="preset.isDisabled"
						:size-scale="resolvedProps.sizeScale"
						@click="handlePresetSelect(preset.id)">
						{{ preset.label }}
					</BaseButton>
				</div>

				<div class="date-picker-panel__header" :class="ui('header')">
					<div class="date-picker-panel__nav-group" :class="ui('nav-group')">
						<BaseTooltip :text="UI_ARIA.PREV_YEAR" :size-scale="resolvedProps.sizeScale">
							<BaseButton
								variant="ghost"
								class="date-picker-panel__nav-btn date-picker-panel__nav-btn--double"
								:class="ui('nav-btn')"
								:aria-label="UI_ARIA.PREV_YEAR"
								:size-scale="resolvedProps.sizeScale"
								@click="handlePrevYear">
								<BaseIcon name="chevron-left" :size-scale="calcIconScale('sm', resolvedProps.sizeScale)" />
								<BaseIcon name="chevron-left" :size-scale="calcIconScale('sm', resolvedProps.sizeScale)" />
							</BaseButton>
						</BaseTooltip>
						<BaseTooltip :text="UI_ARIA.PREV_MONTH" :size-scale="resolvedProps.sizeScale">
							<BaseButton
								variant="ghost"
								class="date-picker-panel__nav-btn"
								:class="ui('nav-btn')"
								:aria-label="UI_ARIA.PREV_MONTH"
								:size-scale="resolvedProps.sizeScale"
								@click="handlePrevRange">
								<BaseIcon name="chevron-left" :size-scale="calcIconScale('md', resolvedProps.sizeScale)" />
							</BaseButton>
						</BaseTooltip>
					</div>

					<span class="date-picker-panel__year-title" :class="ui('year-title')">{{ displayYear }}</span>

					<div class="date-picker-panel__nav-group date-picker-panel__nav-group--next" :class="ui('nav-group')">
						<BaseTooltip :text="UI_ARIA.NEXT_MONTH" :size-scale="resolvedProps.sizeScale">
							<BaseButton
								variant="ghost"
								class="date-picker-panel__nav-btn"
								:class="ui('nav-btn')"
								:aria-label="UI_ARIA.NEXT_MONTH"
								:size-scale="resolvedProps.sizeScale"
								@click="handleNextRange">
								<BaseIcon name="chevron-right" :size-scale="calcIconScale('md', resolvedProps.sizeScale)" />
							</BaseButton>
						</BaseTooltip>
						<BaseTooltip :text="UI_ARIA.NEXT_YEAR" :size-scale="resolvedProps.sizeScale">
							<BaseButton
								variant="ghost"
								class="date-picker-panel__nav-btn date-picker-panel__nav-btn--double"
								:class="ui('nav-btn')"
								:aria-label="UI_ARIA.NEXT_YEAR"
								:size-scale="resolvedProps.sizeScale"
								@click="handleNextYear">
								<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', resolvedProps.sizeScale)" />
								<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', resolvedProps.sizeScale)" />
							</BaseButton>
						</BaseTooltip>
					</div>
				</div>

				<Transition :name="monthTransition" :mode="monthMode" :css="!isMotionReduced">
					<div :key="monthItems[0].key" class="date-picker-panel__months" :class="ui('months')">
						<DatePickerRangePanel
							v-if="resolvedProps.selectionMode === 'range'"
							:model-value="modelValue"
							:model-value-end="modelValueEnd"
							:selected-dates="selectedDates"
							:calendar-variant="resolvedProps.calendarVariant"
							:calendar-config="resolvedCalendarConfig"
							:size-scale="resolvedProps.sizeScale"
							:month-items="monthItems"
							:min-days="minDays"
							:max-days="maxDays"
							:part-class="partClass"
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
								:class="ui('calendar')"
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
				</Transition>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import '../../styles/DatePickerPanel.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseTooltip } from '@components/BaseTooltip'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseCalendar } from '@components/BaseCalendar'
import { useDatePickerPanel } from '../../model/useDatePickerPanel'
import { UI_ARIA, UI_DATE_PICKER, UI_TEXT } from '@/locales/messages'
import DatePickerRangePanel from '../DatePickerRangePanel/DatePickerRangePanel.vue'
import type { DatePickerPanelEmits, DatePickerPanelProps } from '../../types/DatePickerPanel.types'

const props = defineProps<DatePickerPanelProps>()

const emit = defineEmits<DatePickerPanelEmits>()

const {
	ui,
	monthTransition,
	monthMode,
	isMotionReduced,
	teleportTarget,
	resolvedProps,
	layerStyle,
	classes,
	panelRef,
	safeMonthsCount,
	hasPresets,
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
	handlePresetSelect,
	exposed,
} = useDatePickerPanel(props, emit)

defineExpose(exposed)
</script>
