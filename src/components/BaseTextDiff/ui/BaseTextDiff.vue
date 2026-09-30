<template>
	<figure
		class="base-text-diff"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="label">
		<figcaption class="base-text-diff__summary">
			<span class="base-text-diff__hidden">{{ summary }}</span>
			<span class="base-text-diff__count base-text-diff__count--added" aria-hidden="true">+{{ counts.added }}</span>
			<span class="base-text-diff__count base-text-diff__count--removed" aria-hidden="true">−{{ counts.removed }}</span>
			<span v-if="!hasChanges" class="base-text-diff__same">{{ UI_TEXT_DIFF.NO_CHANGES }}</span>
		</figcaption>
		<table v-if="mode === 'split'" class="base-text-diff__table base-text-diff__table--split" :class="classes.table">
			<thead>
				<tr>
					<th scope="col" colspan="2">{{ beforeLabel ?? UI_TEXT_DIFF.BEFORE }}</th>
					<th scope="col" colspan="2">{{ afterLabel ?? UI_TEXT_DIFF.AFTER }}</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(row, index) in rows" :key="index" class="base-text-diff__row">
					<td class="base-text-diff__number" :class="cellClass(row.left)">{{ row.left?.before }}</td>
					<td class="base-text-diff__text" :class="cellClass(row.left)">
						<span class="base-text-diff__hidden">{{ changeText(row.left) }}</span>
						<TextDiffText v-if="row.left" :parts="row.left.parts" />
					</td>
					<td class="base-text-diff__number" :class="cellClass(row.right)">{{ row.right?.after }}</td>
					<td class="base-text-diff__text" :class="cellClass(row.right)">
						<span class="base-text-diff__hidden">{{ changeText(row.right) }}</span>
						<TextDiffText v-if="row.right" :parts="row.right.parts" />
					</td>
				</tr>
			</tbody>
		</table>
		<table v-else class="base-text-diff__table" :class="classes.table">
			<thead class="base-text-diff__head">
				<tr>
					<th scope="col">
						<span class="base-text-diff__hidden">{{ UI_TEXT_DIFF.BEFORE }}</span>
					</th>
					<th scope="col">
						<span class="base-text-diff__hidden">{{ UI_TEXT_DIFF.AFTER }}</span>
					</th>
					<th scope="col">
						<span class="base-text-diff__hidden">{{ UI_TEXT_DIFF.CHANGE }}</span>
					</th>
					<th scope="col">
						<span class="base-text-diff__hidden">{{ UI_TEXT_DIFF.TEXT }}</span>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(line, index) in lines" :key="index" class="base-text-diff__row" :class="cellClass(line)">
					<td class="base-text-diff__number">{{ line.before }}</td>
					<td class="base-text-diff__number">{{ line.after }}</td>
					<td class="base-text-diff__sign">
						<span aria-hidden="true">{{ signOf(line) }}</span>
						<span class="base-text-diff__hidden">{{ changeText(line) }}</span>
					</td>
					<td class="base-text-diff__text"><TextDiffText :parts="line.parts" /></td>
				</tr>
			</tbody>
		</table>
	</figure>
</template>

<script setup lang="ts">
import '../styles/BaseTextDiff.style.scss'
import TextDiffText from './TextDiffText.vue'
import { UI_TEXT_DIFF } from '@/locales/messages'
import { useBaseTextDiff } from '../model/useBaseTextDiff'
import type { BaseTextDiffProps } from '../types/BaseTextDiff.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(defineProps<BaseTextDiffProps>(), {
	variant: 'default',
	mode: 'unified',
	beforeLabel: undefined,
	afterLabel: undefined,
	isWordDiff: true,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	lines,
	rows,
	counts,
	hasChanges,
	summary,
	signOf,
	changeText,
	cellClass,
} = useBaseTextDiff(props)
</script>
