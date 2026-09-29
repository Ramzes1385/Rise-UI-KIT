<template>
	<div
		class="base-search"
		:class="[variantClass, `base-search--${panel}`, { 'base-search--disabled': isDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseInput
			:model-value="modelValue"
			:label="triggerPlaceholder"
			:placeholder="triggerPlaceholder"
			:variant="variant"
			:size-scale="sizeScale"
			:is-disabled="isDisabled"
			:error="error"
			class="base-search__trigger base-search__field"
			:custom-class="classes.trigger"
			readonly
			type="text"
			@focus="open">
			<template v-if="hasIcon" #prefix>
				<BaseIcon
					name="search"
					class="base-search__icon"
					:custom-class="classes.icon"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</template>
		</BaseInput>
	</div>
	<Teleport defer :to="teleportTarget">
		<Transition :name="`base-search-${panel}`">
			<div v-if="isOpen" :class="[overlayClass, classes[`${prefix}Overlay`]]" :style="layerStyle" @click.self="close">
				<div :class="panelClass" :style="sizeScaleStyle" role="dialog" :aria-label="UI_ARIA.SEARCH">
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
					<span class="base-search__live" role="status">{{ resultsStatus }}</span>
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
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import BaseSearchInput from './BaseSearchInput.vue'
import { BaseButton } from '@components/BaseButton'
import { calcIconScale } from '@utils/media/iconUtils'
import BaseSearchResults from './BaseSearchResults.vue'
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
	teleportTarget,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	isOpen,
	layerStyle,
	inputRef,
	prefix,
	overlayClass,
	panelClass,
	headerClass,
	inputClass,
	closeBtnClass,
	closeBtnCustomClass,
	closeIconCustomClass,
	resultsClass,
	open,
	close,
	exposed,
} = useBaseSearchOverlay(props, emit)

defineExpose<BaseSearchOverlayExpose>(exposed)
</script>
