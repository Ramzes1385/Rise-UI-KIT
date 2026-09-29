<template>
	<template v-for="(block, index) in blocks" :key="index">
		<component :is="`h${block.level}`" v-if="block.type === 'heading'" class="base-markdown__heading">
			<MarkdownInline :nodes="block.children" />
		</component>
		<p v-else-if="block.type === 'paragraph'" class="base-markdown__paragraph"><MarkdownInline :nodes="block.children" /></p>
		<blockquote v-else-if="block.type === 'blockquote'" class="base-markdown__quote">
			<MarkdownBlocks :blocks="block.children" />
		</blockquote>
		<component
			:is="block.ordered ? 'ol' : 'ul'"
			v-else-if="block.type === 'list'"
			class="base-markdown__list"
			:start="block.ordered && block.start !== 1 ? block.start : undefined">
			<li
				v-for="(item, itemIndex) in block.items"
				:key="itemIndex"
				class="base-markdown__item"
				:class="{ 'base-markdown__item--task': item.checked !== null }">
				<span
					v-if="item.checked !== null"
					class="base-markdown__check"
					:class="{ 'base-markdown__check--done': item.checked }"
					role="img"
					:aria-label="item.checked ? UI_MARKDOWN.TASK_DONE : UI_MARKDOWN.TASK_TODO">
					<BaseIcon v-if="item.checked" name="check" />
				</span>
				<MarkdownInline v-if="item.inline" :nodes="item.inline" />
				<MarkdownBlocks v-else :blocks="item.children" />
			</li>
		</component>
		<MarkdownCode v-else-if="block.type === 'code'" :block="block" />
		<hr v-else-if="block.type === 'hr'" class="base-markdown__rule" />
		<div v-else class="base-markdown__table-wrap">
			<table class="base-markdown__table">
				<thead>
					<tr>
						<th
							v-for="(cell, cellIndex) in block.head"
							:key="cellIndex"
							:style="{ textAlign: block.align[cellIndex] ?? undefined }">
							<MarkdownInline :nodes="cell" />
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
						<td v-for="(cell, cellIndex) in row" :key="cellIndex" :style="{ textAlign: block.align[cellIndex] ?? undefined }">
							<MarkdownInline :nodes="cell" />
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</template>
</template>

<script setup lang="ts">
import MarkdownCode from './MarkdownCode.vue'
import { BaseIcon } from '@components/BaseIcon'
import { UI_MARKDOWN } from '@/locales/messages'
import MarkdownInline from './MarkdownInline.vue'
import type { MarkdownBlocksProps } from '../types/MarkdownParts.types'

defineProps<MarkdownBlocksProps>()
</script>
