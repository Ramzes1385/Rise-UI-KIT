<template>
	<fieldset
		ref="rootRef"
		:class="[ui('root'), variantClass, `base-card-input--${layout}`, { 'base-card-input--disabled': isControlDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:disabled="isControlDisabled"
		:aria-labelledby="label ? undefined : control.fieldLabelId.value"
		:aria-invalid="control.aria.value['aria-invalid']"
		:aria-describedby="control.aria.value['aria-describedby']">
		<legend
			v-if="label || !control.fieldLabelId.value"
			:class="[ui('legend'), { 'base-card-input__legend--hidden': !label }, classes.legend]">
			{{ label || UI_CARD.GROUP }}
		</legend>
		<div
			v-if="preview"
			:class="[ui('preview'), { 'base-card-input__preview--flipped': preview.isFlipped }, classes.preview]"
			:style="preview.style"
			aria-hidden="true">
			<div :class="ui('preview-inner')">
				<div :class="[ui('face'), 'base-card-input__face--front', { 'base-card-input__face--cover': preview.hasCover }]">
					<CardCover v-if="preview.hasCover" :cover="previewCover" :has-overlay="hasPreviewCoverOverlay">
						<slot name="previewCover" />
					</CardCover>
					<span :class="ui('chip')" />
					<Transition name="base-card-input-brand">
						<CardBrandMark
							v-if="preview.brand"
							:key="preview.brand.id"
							:class="ui('face-brand')"
							:brand="preview.brand"
							:brand-icons="brandIcons" />
					</Transition>
					<span :class="ui('face-number')">{{ preview.number }}</span>
					<span v-if="preview.hasHolder" :class="ui('face-holder')">{{ preview.holder }}</span>
					<span :class="ui('face-expiry')">
						<span :class="ui('face-caption')">{{ UI_CARD.EXPIRY }}</span>
						{{ preview.expiry }}
					</span>
				</div>
				<div :class="[ui('face'), 'base-card-input__face--back']">
					<span :class="ui('stripe')" />
					<span :class="ui('face-code')">{{ preview.code }}</span>
				</div>
			</div>
		</div>
		<div :class="ui('fields')">
			<BaseInput
				v-for="item in fieldViews"
				:key="item.field"
				:class="ui(item.field)"
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
				<template v-if="item.field === 'number'" #suffix>
					<Transition name="base-card-input-brand">
						<span
							v-if="brandView"
							:key="brandView.name"
							:class="[ui('brand'), classes.brand]"
							role="img"
							:aria-label="brandView.label">
							<img v-if="brandView.image" :class="ui('brand-image')" :src="brandView.image" alt="" />
							<svg
								v-else-if="brandView.path"
								:class="ui('brand-icon')"
								:viewBox="CARD_BRAND_ICON_VIEW_BOX"
								aria-hidden="true">
								<path :d="brandView.path" fill="currentColor" />
							</svg>
							<span v-else :class="ui('brand-name')" aria-hidden="true">{{ brandView.name }}</span>
						</span>
					</Transition>
				</template>
			</BaseInput>
		</div>
		<span :class="ui('live')" aria-live="polite">{{ brandView?.label }}</span>
		<FormFieldError
			:id="errorId"
			:error="error || ''"
			:class-name="ui('error')"
			:custom-class="classes.error"
			:size-scale="sizeScale" />
	</fieldset>
</template>

<script setup lang="ts">
import '../styles/BaseCardInput.style.scss'
import { UI_CARD } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { FormFieldError } from '@components/BaseFormField'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseCardInput } from '../model/useBaseCardInput'
import CardCover from '@components/BaseBankCard/ui/CardCover.vue'
import { CARD_BRAND_ICON_VIEW_BOX } from '@utils/form/cardFaceUtils'
import CardBrandMark from '@components/BaseBankCard/ui/CardBrandMark.vue'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCardInputEmits, BaseCardInputProps, BaseCardInputSlots } from '../types/BaseCardInput.types'

const props = withDefaults(
	defineProps<BaseCardInputProps>(),
	kitDefaults('BaseCardInput', {
		variant: DEFAULT_VARIANT,
		modelValue: null,
		layout: 'stacked',
		hasPreview: false,
		hasPreviewCoverOverlay: true,
		hasHolder: true,
		isRequired: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCardInputEmits>()

defineSlots<BaseCardInputSlots>()

const {
	ui,
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
