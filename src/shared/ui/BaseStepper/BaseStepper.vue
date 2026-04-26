<template>
	<div
		class="base-stepper"
		:class="[`base-stepper--${orientation}`, `base-stepper--${shape}`, variantClass]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, progressStyle]">
		<div v-if="$slots.header" class="base-stepper__header">
			<slot name="header" />
		</div>

		<div class="base-stepper__items">
			<div
				v-for="(step, index) in items"
				:key="index"
				class="base-stepper__step"
				:class="{
					'base-stepper__step--active': modelValue === index + 1,
					'base-stepper__step--completed': modelValue > index + 1,
					'base-stepper__step--disabled': step.isDisabled,
				}"
				@click="handleStepClick(index + 1)">
				<slot
					name="item"
					:item="step"
					:index="index"
					:step-number="index + 1"
					:is-active="modelValue === index + 1"
					:is-completed="modelValue > index + 1"
					:is-disabled="Boolean(step.isDisabled)">
					<div class="base-stepper__indicator-wrapper">
						<div v-if="shape !== 'empty'" class="base-stepper__indicator">
							<span v-if="modelValue > index + 1" class="base-stepper__check">
								<BaseIcon name="check" size="sm" :size-scale="sizeScale" />
							</span>
							<span v-else>{{ index + 1 }}</span>
						</div>
					</div>
					<div class="base-stepper__content">
						<BaseText tag="span" :size-scale="sizeScale" :weight="500" class="base-stepper__label">{{
							step.label
						}}</BaseText>
						<BaseText v-if="step.description" tag="p" :size-scale="sizeScale" class="base-stepper__description">
							{{ step.description }}
						</BaseText>
					</div>
				</slot>
			</div>
		</div>

		<div v-if="$slots.footer" class="base-stepper__footer">
			<slot name="footer" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseText } from '@/shared/ui/BaseText'
import './BaseStepper.style.scss'
import type { BaseStepperEmits, BaseStepperProps } from './BaseStepper.types'

const props = withDefaults(defineProps<BaseStepperProps>(), {
	orientation: 'horizontal',
	shape: 'circle',
	variant: 'default',
	sizeScale: 100,
})

const emit = defineEmits<BaseStepperEmits>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({
	block: 'base-stepper',
	getVariant: () => props.variant,
})
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

/** CSS-переменные для линии прогресса */
const progressStyle = computed(() => {
	const count = props.items.length
	if (count <= 1) return undefined
	const scale = (props.modelValue - 1) / (count - 1)
	const halfStep = 50 / count
	return {
		'--stepper-progress-scale': scale,
		'--stepper-line-offset': `${halfStep}%`,
	}
})

function handleStepClick(step: number): void {
	if (props.items[step - 1].isDisabled) return
	emit('update:modelValue', step)
	emit('change', step)
}
</script>
