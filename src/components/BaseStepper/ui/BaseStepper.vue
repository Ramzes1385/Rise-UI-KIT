<template>
	<div
		class="base-stepper"
		:class="[`base-stepper--${orientation}`, `base-stepper--${shape}`, variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, progressStyle]">
		<div v-if="$slots.header" class="base-stepper__header" :class="classes.header">
			<slot name="header" />
		</div>

		<div class="base-stepper__items" :class="classes.items">
			<div
				v-for="(step, index) in items"
				:key="index"
				class="base-stepper__step"
				:class="[
					{
						'base-stepper__step--active': modelValue === index + 1,
						'base-stepper__step--completed': modelValue > index + 1,
						'base-stepper__step--disabled': step.isDisabled,
					},
					classes.step,
				]"
				role="button"
				:tabindex="step.isDisabled ? -1 : 0"
				:aria-disabled="step.isDisabled || undefined"
				:aria-current="modelValue === index + 1 ? 'step' : undefined"
				@click="handleStepClick(index + 1)"
				@keydown.enter.prevent="handleStepClick(index + 1)"
				@keydown.space.prevent="handleStepClick(index + 1)">
				<slot
					name="item"
					:item="step"
					:index="index"
					:step-number="index + 1"
					:is-active="modelValue === index + 1"
					:is-completed="modelValue > index + 1"
					:is-disabled="Boolean(step.isDisabled)">
					<div class="base-stepper__indicator-wrapper" :class="classes.indicatorWrapper">
						<div v-if="shape !== 'empty'" class="base-stepper__indicator" :class="classes.indicator">
							<span v-if="modelValue > index + 1" class="base-stepper__check" :class="classes.check">
								<BaseIcon name="check" :size-scale="calcIconScale('sm', sizeScale)" />
							</span>
							<span v-else-if="step.icon" class="base-stepper__icon">
								<BaseIcon :name="step.icon" :size-scale="calcIconScale('sm', sizeScale)" />
							</span>
							<span v-else>{{ index + 1 }}</span>
						</div>
					</div>
					<div class="base-stepper__content" :class="classes.content">
						<span class="base-stepper__label" :class="classes.label">{{ step.label }}</span>
						<p v-if="step.description" class="base-stepper__description" :class="classes.description">
							{{ step.description }}
						</p>
					</div>
				</slot>
			</div>
		</div>

		<div v-if="$slots.footer" class="base-stepper__footer" :class="classes.footer">
			<slot name="footer" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseStepper.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/media/iconUtils'
import { useBaseStepper } from '../model/useBaseStepper'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseStepperEmits, BaseStepperProps, BaseStepperSlots } from '../types/BaseStepper.types'

const props = withDefaults(
	defineProps<BaseStepperProps>(),
	kitDefaults('BaseStepper', {
		variant: DEFAULT_VARIANT,
		orientation: 'horizontal',
		shape: 'circle',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseStepperEmits>()
defineSlots<BaseStepperSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, progressStyle, handleStepClick } = useBaseStepper(
	props,
	emit,
)
</script>
