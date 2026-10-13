<template>
	<div
		:class="[ui('root'), variantClass, classes.root, { 'base-markdown--streaming': isStreaming }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-busy="isStreaming ? 'true' : undefined">
		<MarkdownBlocks :blocks="blocks" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseMarkdown.style.scss'
import MarkdownBlocks from './MarkdownBlocks.vue'
import { useBaseMarkdown } from '../model/useBaseMarkdown'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseMarkdownProps } from '../types/BaseMarkdown.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseMarkdownProps>(),
	kitDefaults('BaseMarkdown', {
		source: '',
		isStreaming: false,
		hasLineBreaks: true,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const { ui, sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, blocks } = useBaseMarkdown(props)
</script>
