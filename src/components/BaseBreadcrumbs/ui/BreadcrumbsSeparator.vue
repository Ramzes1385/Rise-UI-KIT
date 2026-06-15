<template>
	<BaseIcon
		v-if="separator === 'chevron'"
		name="chevron-right"
		:size-scale="calcIconScale('xs', sizeScale)"
		:custom-class="separatorIconClass" />
	<BaseText v-else-if="separator === 'slash'" :size-scale="sizeScale" :custom-class="separatorTextClass"
		>/</BaseText
	>
	<BaseText v-else-if="separator === 'dot'" :size-scale="sizeScale" :custom-class="separatorTextClass"
		>•</BaseText
	>
	<BaseIcon
		v-else
		name="chevron-right"
		:size-scale="calcIconScale('xs', sizeScale)"
		:custom-class="separatorIconClass" />
</template>

<script setup lang="ts">
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'

interface BreadcrumbsSeparatorProps {
	separator: string
	sizeScale: number
	separatorIconClass?: string
	separatorTextClass?: string
}

defineProps<BreadcrumbsSeparatorProps>()
</script>
