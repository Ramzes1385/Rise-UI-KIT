<template>
	<div
		class="base-tabs"
		:class="[variantClass, { 'base-tabs--full-width': isFullWidth }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div class="base-tabs__list" role="tablist">
			<BaseButton
				v-for="item in items"
				:key="item.id"
				variant="ghost"
				role="tab"
				class="base-tabs__tab"
				:class="{
					'base-tabs__tab--active': modelValue === item.id,
				}"
				:is-disabled="item.isDisabled"
				:aria-selected="modelValue === item.id"
				:size-scale="sizeScale"
				@click="handleTabClick(item.id)">
				<span v-if="item.icon" class="base-tabs__icon" v-html="item.icon"></span>
				<BaseText tag="span" class="base-tabs__label" :size-scale="sizeScale">{{ item.label }}</BaseText>
			</BaseButton>
		</div>
		<div class="base-tabs__content">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseText } from '@/shared/ui/BaseText'
import './BaseTabs.style.scss'
import type { BaseTabsEmits, BaseTabsProps } from './BaseTabs.types'

const props = withDefaults(defineProps<BaseTabsProps>(), {
	variant: 'underline',
	isFullWidth: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-tabs', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseTabsEmits>()

function handleTabClick(id: string): void {
	const tab = props.items.find(item => item.id === id)
	if (tab?.isDisabled) return

	emit('update:modelValue', id)
	emit('change', id)
}
</script>
