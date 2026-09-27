<template>
	<!--
		Сегменты — нативные radio с общим name (APG Radio Group): один таб-стоп на группу, стрелки переключают выбор.
		Группа названа заголовком (или подписью BaseFormField вокруг), ошибка описывает её
	-->
	<div
		class="base-segmented"
		:class="[variantClass, { 'base-segmented--block': isBlock, 'base-segmented--disabled': isControlDisabled, 'base-segmented--error': control.hasError.value }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="radiogroup"
		:aria-labelledby="labelledBy"
		:aria-label="labelledBy ? undefined : ariaLabel"
		:aria-describedby="control.aria.value['aria-describedby']">
		<FormFieldLabel
			v-if="label"
			:id="labelId"
			tag="span"
			:label="label"
			class-name="base-segmented__label"
			:custom-class="classes.label"
			:size-scale="sizeScale" />
		<div class="base-segmented__track" :class="classes.track">
			<label
				v-for="option in options"
				:key="option.value"
				class="base-segmented__segment"
				:class="[{ 'base-segmented__segment--checked': option.value === modelValue, 'base-segmented__segment--disabled': isControlDisabled || option.isDisabled }, classes.segment]">
				<input
					type="radio"
					class="base-segmented__input"
					:name="radioName"
					:value="option.value"
					:checked="option.value === modelValue"
					:disabled="isControlDisabled || option.isDisabled"
					@change="select(option.value)" />
				<BaseIcon v-if="option.icon" :name="option.icon" class="base-segmented__icon" :size-scale="calcIconScale('sm', sizeScale)" />
				<span class="base-segmented__text">{{ option.label }}</span>
			</label>
		</div>
		<FormFieldError :id="errorId" :error="error ?? ''" class-name="base-segmented__error" :custom-class="classes.error" :size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { BaseIcon } from '@components/BaseIcon'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useFieldControl, useFormDisabled } from '@composables/useFormContext'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseSegmented.style.scss'
import type { BaseSegmentedEmits, BaseSegmentedProps } from '../model/BaseSegmented.types'

const props = withDefaults(defineProps<BaseSegmentedProps>(), kitDefaults('BaseSegmented', {
	variant: DEFAULT_VARIANT,
	modelValue: null,
	isDisabled: false,
	isBlock: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const emit = defineEmits<BaseSegmentedEmits>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-segmented', props, [
	'root', 'label', 'track', 'segment', 'error',
])

const ownId = useId()
const labelId = `${ownId}-label`
const errorId = `${ownId}-error`
const radioName = computed(() => props.name ?? `rise-segmented-${ownId}`)

/** Блокировка: свой isDisabled или неактивная BaseForm вокруг */
const isControlDisabled = useFormDisabled(() => props.isDisabled)

/** Группа в BaseFormField: подпись обёртки называет группу, её описание или ошибка описывают группу */
const control = useFieldControl({
	isLabelable: false,
	describedBy: () => (props.error ? errorId : undefined),
	hasError: () => Boolean(props.error),
})

const labelledBy = computed(() => (props.label ? labelId : control.fieldLabelId.value))

function select(value: string | number): void {
	emit('update:modelValue', value)
	emit('change', value)
}
</script>
