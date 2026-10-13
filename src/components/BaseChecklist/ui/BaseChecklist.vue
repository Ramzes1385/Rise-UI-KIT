<template>
	<div
		:class="[
			ui('root'),
			variantClass,
			classes.root,
			{ 'base-checklist--complete': isComplete, 'base-checklist--disabled': isDisabled },
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group"
		:aria-labelledby="titleId">
		<div :class="ui('header')">
			<span :id="titleId" :class="ui('title')">{{ heading }}</span>
			<span :class="ui('count')" aria-hidden="true">{{ progressText }}</span>
		</div>
		<BaseProgress
			:class="ui('progress')"
			:value="doneCount"
			:max="items.length || 1"
			:aria-label="UI_CHECKLIST.PROGRESS_LABEL"
			:aria-valuetext="progressText"
			:size-scale="sizeScale" />
		<TransitionGroup tag="ol" :class="ui('list')" name="base-checklist__item" @before-leave="holdLeavingPlace">
			<li
				v-for="row in rows"
				:key="row.item.id"
				:class="[ui('item'), classes.item, { 'base-checklist__item--done': row.isDone, 'base-checklist__item--next': row.isNext }]">
				<BaseCheckbox
					:class="ui('checkbox')"
					:model-value="row.isDone"
					:is-disabled="isDisabled"
					:input-attrs="{ id: row.checkboxId, 'aria-describedby': row.describedBy }"
					:size-scale="sizeScale"
					@change="toggle(row.item.id)" />
				<div :class="ui('body')">
					<div :class="ui('line')">
						<label :for="row.checkboxId" :class="ui('label')">{{ row.item.title }}</label>
						<span v-if="row.isNext" :id="row.nextId" :class="ui('next')">{{ UI_CHECKLIST.NEXT }}</span>
					</div>
					<p v-if="row.item.description" :id="row.descriptionId" :class="ui('description')">
						{{ row.item.description }}
					</p>
					<BaseButton
						v-if="row.item.actionLabel && !row.isDone"
						:class="ui('action')"
						:variant="row.isNext ? 'default' : 'outline'"
						:size-scale="sizeScale"
						:is-disabled="isDisabled"
						@click="runAction(row.item)">
						{{ row.item.actionLabel }}
					</BaseButton>
				</div>
			</li>
		</TransitionGroup>
		<Transition name="base-checklist__done">
			<p v-if="isComplete" :class="ui('done')" role="status">
				<BaseIcon name="check-circle" />
				<slot name="done">{{ UI_CHECKLIST.DONE }}</slot>
			</p>
		</Transition>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseChecklist.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHECKLIST } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseCheckbox } from '@components/BaseCheckbox'
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
	ui,
	holdLeavingPlace,
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
