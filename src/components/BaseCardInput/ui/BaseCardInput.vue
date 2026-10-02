<template>
	<fieldset
		ref="rootRef"
		class="base-card-input"
		:class="[variantClass, `base-card-input--${layout}`, { 'base-card-input--disabled': isControlDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:disabled="isControlDisabled"
		:aria-labelledby="label ? undefined : control.fieldLabelId.value"
		:aria-invalid="control.aria.value['aria-invalid']"
		:aria-describedby="control.aria.value['aria-describedby']">
		<legend
			v-if="label || !control.fieldLabelId.value"
			class="base-card-input__legend"
			:class="[{ 'base-card-input__legend--hidden': !label }, classes.legend]">
			{{ label || UI_CARD.GROUP }}
		</legend>
		<div
			v-if="preview"
			class="base-card-input__preview"
			:class="[{ 'base-card-input__preview--flipped': preview.isFlipped }, classes.preview]"
			:style="preview.style"
			aria-hidden="true">
			<div class="base-card-input__preview-inner">
				<div class="base-card-input__face base-card-input__face--front">
					<span class="base-card-input__chip" />
					<CardBrandMark
						v-if="preview.brand"
						class="base-card-input__face-brand"
						:brand="preview.brand"
						:brand-icons="brandIcons" />
					<span class="base-card-input__face-number">{{ preview.number }}</span>
					<span v-if="preview.hasHolder" class="base-card-input__face-holder">{{ preview.holder }}</span>
					<span class="base-card-input__face-expiry">
						<span class="base-card-input__face-caption">{{ UI_CARD.EXPIRY }}</span>
						{{ preview.expiry }}
					</span>
				</div>
				<div class="base-card-input__face base-card-input__face--back">
					<span class="base-card-input__stripe" />
					<span class="base-card-input__face-code">{{ preview.code }}</span>
				</div>
			</div>
		</div>
		<div class="base-card-input__fields">
			<BaseInput
				v-for="item in fieldViews"
				:key="item.field"
				:class="`base-card-input__${item.field}`"
				:model-value="item.text"
				:variant="variant"
				:label="item.label"
				:placeholder="item.placeholder"
				:error="item.error"
				:is-disabled="isControlDisabled"
				:is-required="isRequired"
				:input-attrs="item.attrs"
				:size-scale="sizeScale"
				:color="color"
				:custom-class="{ root: classes[item.field] }"
				@input="handleInput(item.field, $event)"
				@keydown="handleKeydown(item.field, $event)"
				@focus="handleFocus(item.field)"
				@blur="handleBlur(item.field)">
				<template v-if="item.field === 'number' && brandView" #suffix>
					<span class="base-card-input__brand" :class="classes.brand" role="img" :aria-label="brandView.label">
						<img v-if="brandView.image" class="base-card-input__brand-image" :src="brandView.image" alt="" />
						<svg
							v-else-if="brandView.path"
							class="base-card-input__brand-icon"
							:viewBox="CARD_BRAND_ICON_VIEW_BOX"
							aria-hidden="true">
							<path :d="brandView.path" fill="currentColor" />
						</svg>
						<span v-else class="base-card-input__brand-name" aria-hidden="true">{{ brandView.name }}</span>
					</span>
				</template>
			</BaseInput>
		</div>
		<span class="base-card-input__live" aria-live="polite">{{ brandView?.label }}</span>
		<FormFieldError
			:id="errorId"
			:error="error || ''"
			class-name="base-card-input__error"
			:custom-class="classes.error"
			:size-scale="sizeScale" />
	</fieldset>
</template>

<script setup lang="ts">
import '../styles/BaseCardInput.style.scss'
import { UI_CARD } from '@/locales/messages'
import CardBrandMark from './CardBrandMark.vue'
import { BaseInput } from '@components/BaseInput'
import { FormFieldError } from '@components/BaseFormField'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseCardInput } from '../model/useBaseCardInput'
import { CARD_BRAND_ICON_VIEW_BOX } from '../types/cardBrandIcons.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCardInputEmits, BaseCardInputProps } from '../types/BaseCardInput.types'

const props = withDefaults(
	defineProps<BaseCardInputProps>(),
	kitDefaults('BaseCardInput', {
		variant: DEFAULT_VARIANT,
		modelValue: null,
		layout: 'stacked',
		hasPreview: false,
		hasHolder: true,
		isRequired: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCardInputEmits>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootRef,
	errorId,
	control,
	isControlDisabled,
	fieldViews,
	brandView,
	handleInput,
	handleKeydown,
	handleFocus,
	handleBlur,
	preview,
	exposed,
} = useBaseCardInput(props, emit)

defineExpose(exposed)
</script>
