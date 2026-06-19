<template>
	<div
		class="base-search"
		:class="[variantClass, { 'base-search--disabled': isDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseInput
			:model-value="modelValue"
			:placeholder="triggerPlaceholder"
			:variant="variant"
			:size-scale="sizeScale"
			:is-disabled="isDisabled"
			:error="error"
			class="base-search__trigger"
			:custom-class="classes.trigger"
			readonly
			type="text"
			@focus="open">
			<template #prefix>
				<BaseIcon
					v-if="hasIcon"
					name="search"
					class="base-search__icon"
					:custom-class="classes.icon"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</template>
		</BaseInput>
	</div>
	<Teleport to="body">
		<Transition :name="`base-search-${panel}`">
			<div
				v-if="isOpen"
				:class="overlayClass"
				@click.self="close">
				<div :class="panelClass" :style="sizeScaleStyle">
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
							@update:model-value="emit('update:modelValue', $event)"
							@keydown="emit('keydown', $event)"
							@clear="emit('clear')" />
						<BaseButton
							variant="ghost"
							:class="closeBtnClass"
							:custom-class="closeBtnCustomClass"
							:size-scale="sizeScale"
							@click="close">
							<BaseIcon
								name="close"
								:custom-class="closeIconCustomClass"
								:size-scale="calcIconScale('sm', sizeScale)" />
						</BaseButton>
					</div>
					<div v-if="shouldShowResults && modelValue" :class="resultsClass">
						<BaseSearchResults
							:visible-results="visibleResults"
							:query="modelValue"
							:is-loading="isLoading"
							:size-scale="sizeScale"
							:highlighted-index="highlightedIndex"
							:classes="classes"
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
import { computed, nextTick, ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useScrollLock } from '@composables/useScrollLock'
import { calcIconScale } from '@utils/iconUtils'
import BaseSearchInput from './BaseSearchInput.vue'
import BaseSearchResults from './BaseSearchResults.vue'
import type { BaseSearchOverlayEmits, BaseSearchOverlayProps } from '../model/BaseSearchOverlay.types'

const props = defineProps<BaseSearchOverlayProps>()

const emit = defineEmits<BaseSearchOverlayEmits>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle } = useStandardBaseComponent('base-search', props)

const isOpen = ref(false)
const inputRef = ref<InstanceType<typeof BaseSearchInput> | null>(null)

const { lock: lockScroll, unlock: unlockScroll } = useScrollLock()

useEscapeKey({
	isActive: () => isOpen.value,
	callback: () => close(),
})

const prefix = computed(() => props.panel)

const overlayClass = computed(() => `base-search__${prefix.value}-overlay`)
const panelClass = computed(() => [`base-search__${prefix.value}`, props.classes[prefix.value]])
const headerClass = computed(() => [`base-search__${prefix.value}-header`, props.classes[`${prefix.value}Header`]])
const inputClass = computed(() => props.classes[`${prefix.value}Input`])
const closeBtnClass = computed(() => `base-search__${prefix.value}-close`)
const closeBtnCustomClass = computed(() => props.classes[`${prefix.value}Close`])
const closeIconCustomClass = computed(() => props.classes[`${prefix.value}CloseIcon`])
const resultsClass = computed(() => [`base-search__${prefix.value}-results`, props.classes[`${prefix.value}Results`]])

function open(): void {
	if (props.isDisabled) return
	isOpen.value = true
	lockScroll()
	nextTick(() => {
		inputRef.value?.focus()
	})
}

function close(): void {
	isOpen.value = false
	unlockScroll()
	emit('close')
}

function focus(): void {
	inputRef.value?.focus()
}

defineExpose<{
	focus: () => void
	open: () => void
	close: () => void
}>({ focus, open, close })
</script>
