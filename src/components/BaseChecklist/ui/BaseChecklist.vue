<template>
	<div
		class="base-checklist"
		:class="[variantClass, classes.root, { 'base-checklist--complete': isComplete, 'base-checklist--disabled': isDisabled }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group"
		:aria-labelledby="titleId">
		<div class="base-checklist__header">
			<span :id="titleId" class="base-checklist__title">{{ heading }}</span>
			<span class="base-checklist__count" aria-hidden="true">{{ progressText }}</span>
		</div>
		<BaseProgress
			:value="doneCount"
			:max="items.length || 1"
			:aria-label="UI_CHECKLIST.PROGRESS_LABEL"
			:aria-valuetext="progressText"
			:size-scale="sizeScale" />
		<ol class="base-checklist__list">
			<li
				v-for="row in rows"
				:key="row.item.id"
				class="base-checklist__item"
				:class="[classes.item, { 'base-checklist__item--done': row.isDone, 'base-checklist__item--next': row.isNext }]">
				<input
					:id="row.checkboxId"
					type="checkbox"
					class="base-checklist__checkbox"
					:checked="row.isDone"
					:disabled="isDisabled"
					:aria-describedby="row.describedBy"
					@change="toggle(row.item.id)" />
				<div class="base-checklist__body">
					<div class="base-checklist__line">
						<label :for="row.checkboxId" class="base-checklist__label">{{ row.item.title }}</label>
						<span v-if="row.isNext" :id="row.nextId" class="base-checklist__next">{{ UI_CHECKLIST.NEXT }}</span>
					</div>
					<p v-if="row.item.description" :id="row.descriptionId" class="base-checklist__description">
						{{ row.item.description }}
					</p>
					<BaseButton
						v-if="row.item.actionLabel && !row.isDone"
						class="base-checklist__action"
						:variant="row.isNext ? 'default' : 'outline'"
						:size-scale="sizeScale"
						:is-disabled="isDisabled"
						@click="runAction(row.item)">
						{{ row.item.actionLabel }}
					</BaseButton>
				</div>
			</li>
		</ol>
		<p v-if="isComplete" class="base-checklist__done" role="status">
			<BaseIcon name="check-circle" />
			<slot name="done">{{ UI_CHECKLIST.DONE }}</slot>
		</p>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseChecklist.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHECKLIST } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseProgress } from '@components/BaseProgress'
import { useBaseChecklist } from '../model/useBaseChecklist'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseChecklistEmits, BaseChecklistProps, BaseChecklistSlots } from '../types/BaseChecklist.types'

const props = withDefaults(defineProps<BaseChecklistProps>(), {
	completed: undefined,
	title: undefined,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseChecklistEmits>()

defineSlots<BaseChecklistSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	titleId,
	heading,
	doneCount,
	progressText,
	isComplete,
	rows,
	toggle,
	runAction,
} = useBaseChecklist(props, emit)
</script>
