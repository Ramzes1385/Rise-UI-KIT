<template>
	<div
		:class="[ui('root'), variantClass, { 'base-form-wizard--disabled': isDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group"
		:aria-label="UI_FORM_WIZARD.LABEL"
		:aria-disabled="isDisabled ? true : undefined">
		<template v-if="currentStep">
			<div :class="[ui('header'), classes.header]">
				<BaseStepper
					:model-value="currentNumber"
					:items="stepperItems"
					:is-linear="isLinear"
					:clickable="isDisabled || isLoading ? 'none' : 'all'"
					summary="count"
					:size-scale="sizeScale"
					@update:model-value="handleStepper" />
			</div>

			<div
				role="group"
				:aria-labelledby="titleId"
				:aria-describedby="currentStep.description ? descriptionId : undefined"
				:class="[ui('content'), classes.content]">
				<component :is="titleTag" :id="titleId" ref="titleRef" tabindex="-1" :class="[ui('title'), classes.title]">
					{{ currentStep.title }}
				</component>
				<p v-if="currentStep.description" :id="descriptionId" :class="[ui('description'), classes.description]">
					{{ currentStep.description }}
				</p>

				<BaseForm
					:id="formId"
					:key="currentStep.id"
					ref="formRef"
					:schema="currentStep.schema"
					:state="state"
					:is-loading="isLoading"
					:is-disabled="isDisabled"
					:size-scale="sizeScale"
					@submit="handleSubmit"
					@invalid="handleInvalid">
					<slot :name="`step-${currentStep.id}`" v-bind="stepSlot">
						<slot v-bind="stepSlot" />
					</slot>
				</BaseForm>

				<p v-if="stepError" role="alert" :class="[ui('error'), classes.error]">{{ stepError }}</p>
			</div>

			<div role="group" :aria-label="UI_FORM_WIZARD.ACTIONS" :class="[ui('actions'), classes.actions]">
				<BaseButton
					variant="outline"
					:size-scale="sizeScale"
					:is-disabled="isFirst || isLocked"
					:class="ui('back')"
					:custom-class="classes.back"
					@click="back">
					{{ UI_FORM_WIZARD.BACK }}
				</BaseButton>
				<BaseButton
					v-if="currentStep.isOptional && !isLast"
					variant="ghost"
					:size-scale="sizeScale"
					:is-disabled="isLocked"
					:class="ui('skip')"
					:custom-class="classes.skip"
					@click="skip">
					{{ UI_FORM_WIZARD.SKIP }}
				</BaseButton>
				<BaseButton
					type="submit"
					:form="formId"
					:size-scale="sizeScale"
					:is-loading="isBusy"
					:is-disabled="isDisabled"
					:class="ui('next')"
					:custom-class="classes.next">
					{{ isLast ? UI_FORM_WIZARD.FINISH : UI_FORM_WIZARD.NEXT }}
				</BaseButton>
			</div>
		</template>

		<BaseEmpty
			v-else
			:title="UI_FORM_WIZARD.EMPTY_TITLE"
			:description="UI_FORM_WIZARD.EMPTY_DESCRIPTION"
			variant="ghost"
			:size-scale="sizeScale" />

		<div role="status" aria-live="polite" class="base-form-wizard__live">{{ liveText }}</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseFormWizard.style.scss'
import { BaseForm } from '@components/BaseForm'
import { BaseEmpty } from '@components/BaseEmpty'
import { UI_FORM_WIZARD } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseStepper } from '@components/BaseStepper'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseFormWizard } from '../model/useBaseFormWizard'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFormWizardEmits, BaseFormWizardExpose, BaseFormWizardProps, BaseFormWizardSlots } from '../types/BaseFormWizard.types'

const props = withDefaults(
	defineProps<BaseFormWizardProps>(),
	kitDefaults('BaseFormWizard', {
		variant: DEFAULT_VARIANT,
		steps: () => [],
		isLinear: true,
		isLoading: false,
		isDisabled: false,
		titleTag: 'h2',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseFormWizardEmits>()
defineSlots<BaseFormWizardSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	titleRef,
	liveText,
	formRef,
	titleId,
	descriptionId,
	formId,
	currentStep,
	currentNumber,
	isFirst,
	isLast,
	isLocked,
	isBusy,
	stepError,
	stepperItems,
	stepSlot,
	handleStepper,
	handleSubmit,
	handleInvalid,
	skip,
	back,
	exposed,
} = useBaseFormWizard(props, emit)

defineExpose<BaseFormWizardExpose>(exposed)
</script>
