<template>
	<div
		class="base-code"
		:class="[variantClass, { 'base-code--wrapped': isWrapped, 'base-code--numbered': hasLineNumbers }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, numberWidth]">
		<div v-if="hasHeader" class="base-code__header" :class="classes.header">
			<span class="base-code__title">
				<slot name="header">{{ title || languageName }}</slot>
			</span>
			<slot name="actions" />
			<BaseButton v-if="hasCopyButton && !isEmpty" variant="ghost" class="base-code__copy" :size-scale="sizeScale" @click="copy">
				<template #left><BaseIcon :name="isCopied ? 'check' : 'copy'" /></template>
				{{ isCopied ? UI_CODE.COPIED : UI_CODE.COPY }}
			</BaseButton>
		</div>
		<div
			ref="preRef"
			class="base-code__pre"
			:class="classes.pre"
			:style="preStyle"
			:tabindex="isScrollable ? 0 : undefined"
			:role="isScrollable ? 'region' : undefined"
			:aria-label="isScrollable ? regionLabel : undefined">
			<p v-if="isEmpty" class="base-code__empty">{{ UI_CODE.EMPTY }}</p>
			<code v-else class="base-code__code">
				<span
					v-for="line in lines"
					:key="line.number"
					class="base-code__line"
					:class="[{ 'base-code__line--highlighted': line.isHighlighted }, classes.line]">
					<span v-if="hasLineNumbers" class="base-code__number" aria-hidden="true">{{ line.number }}</span>
					<span class="base-code__text">
						<span
							v-for="(token, index) in line.tokens"
							:key="index"
							:class="token.type ? `base-code__token base-code__token--${token.type}` : undefined"
							>{{ token.value }}</span
						>
					</span>
				</span>
			</code>
		</div>
		<span class="base-code__status" role="status">{{ status }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseCode.style.scss'
import { UI_CODE } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseCode } from '../model/useBaseCode'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCodeEmits, BaseCodeExpose, BaseCodeProps, BaseCodeSlots } from '../types/BaseCode.types'

const props = withDefaults(
	defineProps<BaseCodeProps>(),
	kitDefaults('BaseCode', {
		variant: DEFAULT_VARIANT,
		code: '',
		hasLineNumbers: true,
		startLine: 1,
		hasCopyButton: true,
		hasHeader: true,
		isWrapped: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCodeEmits>()
defineSlots<BaseCodeSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	preRef,
	isScrollable,
	languageName,
	lines,
	isEmpty,
	regionLabel,
	preStyle,
	numberWidth,
	isCopied,
	status,
	copy,
} = useBaseCode(props, emit)

defineExpose<BaseCodeExpose>({ copy })
</script>
