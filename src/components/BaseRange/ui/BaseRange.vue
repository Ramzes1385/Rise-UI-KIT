<template>
	<div
		ref="rootRef"
		class="base-range"
		:class="[
			variantClass,
			{
				'base-range--disabled': isControlDisabled,
				'base-range--vertical': isVertical,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-if="hasLabel" class="base-range__label" :class="classes.label">
			<BaseText tag="span" class="base-range__label-min" :custom-class="classes.labelMin">{{ min }}</BaseText>
			<BaseText tag="span" class="base-range__label-value" :weight="TEXT_WEIGHT.MEDIUM" :custom-class="classes.labelValue">{{
				labelText
			}}</BaseText>
			<BaseText tag="span" class="base-range__label-max" :custom-class="classes.labelMax">{{ max }}</BaseText>
		</div>

		<div class="base-range__body" :class="classes.body">
			<div class="base-range__track-wrapper" :class="classes.trackWrapper" ref="trackRef" @mousedown.prevent="handleTrackDown">
				<div class="base-range__track" :class="classes.track">
					<div
						v-for="(segment, index) in fillSegments"
						:key="index"
						class="base-range__fill"
						:class="classes.fill"
						:style="segment"></div>
				</div>

				<div
					v-for="(value, index) in pointValues"
					:key="index"
					class="base-range__thumb-container"
					:class="classes.thumbContainer"
					:style="thumbStyle(value)">
					<BaseTooltip v-if="hasTooltip" :text="String(value)" :position="tooltipPosition">
						<BaseRangeThumb
							:value="value"
							:index="index"
							:bound-min="thumbMin(index)"
							:bound-max="thumbMax(index)"
							:label="thumbLabel(index)"
							:is-disabled="isControlDisabled"
							:is-vertical="isVertical"
							:has-custom="hasThumbSlot"
							:thumb-class="classes.thumb"
							:dot-class="classes.thumbDot"
							@down="handleThumbDown"
							@keydown="handleThumbKeydown">
							<template #default="{ value: thumbValue, index: thumbIndex }">
								<slot name="thumb" :value="thumbValue" :index="thumbIndex" />
							</template>
						</BaseRangeThumb>
					</BaseTooltip>
					<BaseRangeThumb
						v-else
						:value="value"
						:index="index"
						:bound-min="thumbMin(index)"
						:bound-max="thumbMax(index)"
						:label="thumbLabel(index)"
						:is-disabled="isControlDisabled"
						:is-vertical="isVertical"
						:has-custom="hasThumbSlot"
						:thumb-class="classes.thumb"
						:dot-class="classes.thumbDot"
						@down="handleThumbDown"
						@keydown="handleThumbKeydown">
						<template #default="{ value: thumbValue, index: thumbIndex }">
							<slot name="thumb" :value="thumbValue" :index="thumbIndex" />
						</template>
					</BaseRangeThumb>
				</div>
			</div>

			<BaseRangeMarks :marks="marks" :mark-style="markStyle" :classes="classes" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { BaseTooltip } from '@components/BaseTooltip'
import { kitDefaults } from '@composables/useDefaults'
import { useFormField } from '@composables/useFormField'
import { useRangeDrag } from '@composables/useRangeDrag'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { useRangeValues } from '@composables/useRangeValues'
import { useFormDisabled } from '@composables/useFormContext'
import { DEFAULT_VARIANT, useStandardBaseComponent } from '@composables/useBaseComponent'
import BaseRangeMarks from './BaseRangeMarks.vue'
import { BaseRangeThumb } from './BaseRangeThumb'
import '../styles/BaseRange.style.scss'
import type { BaseRangeEmits, BaseRangeProps, BaseRangeSlots } from '../types/BaseRange.types'

const props = withDefaults(
	defineProps<BaseRangeProps>(),
	kitDefaults('BaseRange', {
		variant: DEFAULT_VARIANT,
		modelValue: 0,
		min: 0,
		max: 100,
		step: 1,
		isDisabled: false,
		hasTooltip: false,
		marks: () => [],
		isVertical: false,
		hasLabel: false,
	}),
)

/** Блокировка: свой isDisabled или неактивная BaseForm вокруг (fieldset формы блокирует только нативные поля) */
const isControlDisabled = useFormDisabled(() => props.isDisabled)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-range', props, [
	'root',
	'label',
	'labelMin',
	'labelValue',
	'labelMax',
	'body',
	'trackWrapper',
	'track',
	'fill',
	'thumbContainer',
	'thumb',
	'thumbDot',
	'marks',
	'mark',
	'markTick',
	'markText',
])

const emit = defineEmits<BaseRangeEmits>()
defineSlots<BaseRangeSlots>()
const slots = useSlots()

const rootRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const hasThumbSlot = computed((): boolean => Boolean(slots.thumb))

const formField = useFormField({
	value: () => props.modelValue,
})

const {
	mode,
	pointValues,
	labelText,
	tooltipPosition,
	fillSegments,
	thumbStyle,
	markStyle,
	thumbMin,
	thumbMax,
	snapToStepValue,
	setPointValue,
	emitChange,
} = useRangeValues({ props, emit })

/**
 * Доступное имя ползунка: ariaLabel (или «Значение») у одиночного; у диапазона и точек — с ролью ползунка,
 * чтобы скринридер различал их: «Цена: минимум», «Точка 2».
 */
function thumbLabel(index: number): string {
	if (mode.value === 'single') return props.ariaLabel || UI_ARIA.RANGE_VALUE
	let role: string = `${UI_ARIA.RANGE_POINT} ${index + 1}`
	if (mode.value === 'range') role = index === 0 ? UI_ARIA.RANGE_MIN : UI_ARIA.RANGE_MAX
	return props.ariaLabel ? `${props.ariaLabel}: ${role.toLowerCase()}` : role
}

const { handleThumbDown, handleTrackDown, handleThumbKeydown } = useRangeDrag({
	trackRef,
	pointValues,
	isDisabled: () => isControlDisabled.value,
	min: () => props.min,
	max: () => props.max,
	step: () => props.step,
	isVertical: () => props.isVertical,
	thumbMin,
	thumbMax,
	snapToStepValue,
	setPointValue,
	emitChange,
})

defineExpose({
	rootRef,
	focus: () => rootRef.value?.querySelector<HTMLElement>('.base-range__thumb')?.focus(),
	blur: () => rootRef.value?.querySelector<HTMLElement>('.base-range__thumb')?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
