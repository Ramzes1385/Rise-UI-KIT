<template>
	<template v-for="(block, index) in blocks" :key="index">
		<component :is="`h${block.level}`" v-if="block.type === 'heading'" :class="ui('heading')">
			<MarkdownInline :nodes="block.children" />
		</component>
		<p v-else-if="block.type === 'paragraph'" :class="ui('paragraph')"><MarkdownInline :nodes="block.children" /></p>
		<blockquote v-else-if="block.type === 'blockquote'" :class="ui('quote')">
			<MarkdownBlocks :blocks="block.children" />
		</blockquote>
		<component
			:is="block.ordered ? 'ol' : 'ul'"
			v-else-if="block.type === 'list'"
			:class="ui('list')"
			:start="block.ordered && block.start !== 1 ? block.start : undefined">
			<li
				v-for="(item, itemIndex) in block.items"
				:key="itemIndex"
				:class="[ui('item'), { 'base-markdown__item--task': item.checked !== null }]">
				<BaseCheckbox
					v-if="item.checked !== null"
					:class="[ui('check'), { 'base-markdown__check--done': item.checked }]"
					:model-value="item.checked"
					is-readonly
					:aria-label="item.checked ? UI_MARKDOWN.TASK_DONE : UI_MARKDOWN.TASK_TODO"
					:input-attrs="{ tabindex: -1 }"
					:size-scale="getSizeScale()" />
				<MarkdownInline v-if="item.inline" :nodes="item.inline" />
				<MarkdownBlocks v-else :blocks="item.children" />
			</li>
		</component>
		<MarkdownCode v-else-if="block.type === 'code'" :block="block" />
		<hr v-else-if="block.type === 'hr'" :class="ui('rule')" />
		<div v-else :class="ui('table-wrap')">
			<table :class="ui('table')">
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
import { UI_MARKDOWN } from '@/locales/messages'
import MarkdownInline from './MarkdownInline.vue'
import { BaseCheckbox } from '@components/BaseCheckbox'
import type { MarkdownBlocksProps } from '../types/MarkdownParts.types'
import { useMarkdownSizeScale, useMarkdownUi } from '../model/useMarkdownUi'

defineProps<MarkdownBlocksProps>()

const ui = useMarkdownUi()
const getSizeScale = useMarkdownSizeScale()
</script>
