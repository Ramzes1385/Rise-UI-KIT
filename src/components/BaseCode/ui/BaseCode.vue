<template>
	<div
		:class="[ui('root'), variantClass, { 'base-code--wrapped': isWrapped, 'base-code--numbered': hasLineNumbers }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, numberWidth]">
		<div v-if="hasHeader" :class="[ui('header'), classes.header]">
			<span :class="ui('title')">
				<slot name="header">{{ title || languageName }}</slot>
			</span>
			<slot name="actions" />
			<BaseButton
				v-if="hasCopyButton && !isEmpty"
				variant="ghost"
				:class="ui('copy')"
				:size-scale="sizeScale"
				:aria-label="copyLabel"
				@click="copy">
				<template #left>
					<Transition name="base-code__copy-icon" mode="out-in">
						<BaseIcon :key="copyIcon" :name="copyIcon" />
					</Transition>
				</template>
				{{ isCopied ? UI_CODE.COPIED : UI_CODE.COPY }}
			</BaseButton>
		</div>
		<div
			ref="preRef"
			:class="[ui('pre'), classes.pre]"
			:style="preStyle"
			:tabindex="isScrollable ? 0 : undefined"
			:role="isScrollable ? 'region' : undefined"
			:aria-label="isScrollable ? regionLabel : undefined">
			<p v-if="isEmpty" :class="ui('empty')">{{ UI_CODE.EMPTY }}</p>
			<code v-else :class="ui('code')">
				<span
					v-for="line in lines"
					:key="line.number"
					:class="[ui('line'), { 'base-code__line--highlighted': line.isHighlighted }, classes.line]">
					<span v-if="hasLineNumbers" :class="ui('number')" aria-hidden="true">{{ line.number }}</span>
					<span :class="ui('text')">
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
	ui,
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
	copyLabel,
	preStyle,
	numberWidth,
	isCopied,
	copyIcon,
	status,
	copy,
} = useBaseCode(props, emit)

defineExpose<BaseCodeExpose>({ copy })
</script>
