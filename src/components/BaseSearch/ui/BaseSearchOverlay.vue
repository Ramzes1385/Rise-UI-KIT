<template>
	<div
		ref="rootRef"
		:class="[ui('root'), variantClass, `base-search--${panel}`, { 'base-search--disabled': isDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseInput
			:model-value="modelValue"
			:label="triggerPlaceholder"
			:placeholder="triggerPlaceholder"
			:variant="variant"
			:size-scale="sizeScale"
			:is-disabled="isDisabled"
			:error="error"
			:class="[ui('trigger'), ui('field')]"
			:custom-class="classes.trigger"
			readonly
			type="text"
			@focus="onTriggerFocus"
			@click="open">
			<template v-if="hasIcon" #prefix>
				<BaseIcon name="search" :class="ui('icon')" :custom-class="classes.icon" :size-scale="calcIconScale('sm', sizeScale)" />
			</template>
		</BaseInput>
	</div>
	<component :is="panel === 'modal' ? BaseModal : BaseSlideover" :is-open="isOpen" v-bind="dialogProps" @update:is-open="onDialogToggle">
		<div :class="headerClass">
			<BaseSearchInput
				ref="inputRef"
				:model-value="modelValue"
				:placeholder="searchPlaceholder"
				:variant="variant"
				:size-scale="sizeScale"
				:is-disabled="isDisabled"
				:error="error"
				:has-icon="hasIcon"
				:has-clear="hasClear"
				:is-loading="isLoading"
				:input-class="inputClass"
				:classes="classes"
				:combobox-attributes="comboboxAttributes"
				:ui="ui"
				@update:model-value="emit('update:modelValue', $event)"
				@keydown="emit('keydown', $event)"
				@clear="emit('clear')" />
			<BaseButton
				variant="ghost"
				:class="closeBtnClass"
				:custom-class="closeBtnCustomClass"
				:size-scale="sizeScale"
				:aria-label="UI_ARIA.CLOSE"
				@click="close">
				<BaseIcon name="close" :custom-class="closeIconCustomClass" :size-scale="sizeScale" />
			</BaseButton>
		</div>
		<span :class="ui('live')" role="status">{{ resultsStatus }}</span>
		<Transition name="base-search-results" :css="!isMotionReduced">
			<div v-if="shouldShowResults && modelValue" :class="resultsClass">
				<BaseSearchResults
					:visible-results="visibleResults"
					:query="modelValue"
					:is-loading="isLoading"
					:size-scale="sizeScale"
					:highlighted-index="highlightedIndex"
					:classes="classes"
					:listbox-id="listboxId"
					:listbox-label="searchPlaceholder"
					:ui="ui"
					:is-motion-reduced="isMotionReduced"
					:motion-attrs="motionAttrs"
					@select="emit('select', $event)"
					@highlight="emit('highlight', $event)">
					<template #result="slotProps">
						<slot name="result" v-bind="slotProps" />
					</template>
					<template #results="slotProps">
						<slot name="results" v-bind="slotProps" />
					</template>
					<template #result-before="slotProps">
						<slot name="result-before" v-bind="slotProps" />
					</template>
					<template #result-after="slotProps">
						<slot name="result-after" v-bind="slotProps" />
					</template>
					<template #empty>
						<slot name="empty" />
					</template>
					<template #loading>
						<slot name="loading" />
					</template>
				</BaseSearchResults>
			</div>
		</Transition>
	</component>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseModal } from '@components/BaseModal'
import BaseSearchInput from './BaseSearchInput.vue'
import { BaseButton } from '@components/BaseButton'
import { calcIconScale } from '@utils/media/iconUtils'
import BaseSearchResults from './BaseSearchResults.vue'
import { BaseSlideover } from '@components/BaseSlideover'
import { useBaseSearchOverlay } from '../model/useBaseSearchOverlay'
import type {
	BaseSearchOverlayEmits,
	BaseSearchOverlayExpose,
	BaseSearchOverlayProps,
	BaseSearchOverlaySlots,
} from '../types/BaseSearchOverlay.types'

const props = defineProps<BaseSearchOverlayProps>()

const emit = defineEmits<BaseSearchOverlayEmits>()

defineSlots<BaseSearchOverlaySlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	isOpen,
	rootRef,
	isMotionReduced,
	motionAttrs,
	dialogProps,
	onDialogToggle,
	inputRef,
	headerClass,
	inputClass,
	closeBtnClass,
	closeBtnCustomClass,
	closeIconCustomClass,
	resultsClass,
	open,
	close,
	onTriggerFocus,
	exposed,
} = useBaseSearchOverlay(props, emit)

defineExpose<BaseSearchOverlayExpose>(exposed)
</script>
