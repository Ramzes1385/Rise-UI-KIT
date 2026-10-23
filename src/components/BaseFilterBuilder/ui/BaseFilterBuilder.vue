<template>
	<div
		ref="rootRef"
		:class="[ui('root'), variantClass, classes.root, { 'base-filter-builder--disabled': isDisabled }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group"
		:aria-label="UI_FILTER_BUILDER.LABEL">
		<div v-if="rows.length > 1" :class="ui('match')">
			<span :id="matchId">{{ UI_FILTER_BUILDER.MATCH }}</span>
			<span :class="[ui('select'), 'base-filter-builder__select--inline']">
				<select :aria-labelledby="matchId" :value="match" :disabled="isDisabled" @change="setMatch">
					<option value="all">{{ UI_FILTER_BUILDER.MATCH_ALL }}</option>
					<option value="any">{{ UI_FILTER_BUILDER.MATCH_ANY }}</option>
				</select>
				<BaseIcon name="chevron-down" />
			</span>
		</div>
		<p v-if="rows.length === 0" :class="ui('empty')">{{ UI_FILTER_BUILDER.EMPTY }}</p>
		<TransitionGroup v-else tag="ol" :class="ui('list')" name="base-filter-builder__item" @before-leave="holdLeavingPlace">
			<li v-for="(row, index) in rows" :key="row.condition.id" :class="ui('item')" :data-condition-id="row.condition.id">
				<div :class="[ui('row'), classes.row]" role="group" :aria-label="conditionLabel(index)">
					<span :class="ui('joiner')" aria-hidden="true">{{ joiner(index) }}</span>
					<span :class="ui('select')">
						<select
							:aria-label="UI_FILTER_BUILDER.FIELD"
							:value="row.condition.field"
							:disabled="isDisabled"
							@change="setField(row.condition.id, ($event.target as HTMLSelectElement).value)">
							<option v-for="field in fields" :key="field.key" :value="field.key">{{ field.label }}</option>
						</select>
						<BaseIcon name="chevron-down" />
					</span>
					<span :class="ui('select')">
						<select
							:aria-label="UI_FILTER_BUILDER.OPERATOR"
							:value="row.condition.operator"
							:disabled="isDisabled"
							@change="setOperator(row.condition.id, ($event.target as HTMLSelectElement).value as FilterBuilderOperator)">
							<option v-for="operator in row.operators" :key="operator.value" :value="operator.value">
								{{ operator.label }}
							</option>
						</select>
						<BaseIcon name="chevron-down" />
					</span>
					<template v-if="row.valueKind !== 'none'">
						<span v-if="row.inputType === 'select'" :class="[ui('select'), ui('value')]">
							<select
								:aria-label="UI_FILTER_BUILDER.VALUE"
								:value="row.condition.value"
								:disabled="isDisabled"
								@change="setValue(row.condition.id, { value: ($event.target as HTMLSelectElement).value })">
								<option value="">{{ UI_FILTER_BUILDER.CHOOSE }}</option>
								<option v-for="option in row.field?.options" :key="option.value" :value="option.value">
									{{ option.label }}
								</option>
							</select>
							<BaseIcon name="chevron-down" />
						</span>
						<BaseInput
							v-else
							:class="[ui('input'), ui('value')]"
							:size-scale="sizeScale"
							v-bind="valueFieldProps(row)"
							:aria-label="row.valueKind === 'range' ? UI_FILTER_BUILDER.VALUE_FROM : UI_FILTER_BUILDER.VALUE"
							:model-value="row.condition.value"
							:is-disabled="isDisabled"
							@update:model-value="setValue(row.condition.id, { value: $event })" />
						<BaseInput
							v-if="row.valueKind === 'range'"
							:class="[ui('input'), ui('value')]"
							:size-scale="sizeScale"
							v-bind="valueFieldProps(row)"
							:aria-label="UI_FILTER_BUILDER.VALUE_TO"
							:model-value="row.condition.valueTo ?? ''"
							:is-disabled="isDisabled"
							@update:model-value="setValue(row.condition.id, { valueTo: $event })" />
					</template>
					<BaseButton
						variant="ghost"
						:class="ui('remove')"
						:aria-label="removeLabel(index)"
						:is-disabled="isDisabled"
						:size-scale="sizeScale"
						@click="removeCondition(row.condition.id)">
						<BaseIcon name="x-mark" />
					</BaseButton>
				</div>
			</li>
		</TransitionGroup>
		<div :class="[ui('actions'), classes.actions]">
			<BaseButton
				variant="ghost"
				:class="[ui('button'), ui('add')]"
				:is-disabled="isDisabled || fields.length === 0"
				:size-scale="sizeScale"
				@click="addCondition">
				<template #left><BaseIcon name="plus" /></template>
				{{ UI_FILTER_BUILDER.ADD }}
			</BaseButton>
			<BaseButton
				v-if="rows.length"
				variant="ghost"
				:class="ui('button')"
				:is-disabled="isDisabled"
				:size-scale="sizeScale"
				@click="clear">
				{{ UI_FILTER_BUILDER.CLEAR }}
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseFilterBuilder.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { UI_FILTER_BUILDER } from '@/locales/messages'
import { useBaseFilterBuilder } from '../model/useBaseFilterBuilder'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFilterBuilderEmits, BaseFilterBuilderProps, FilterBuilderOperator } from '../types/BaseFilterBuilder.types'

const props = withDefaults(defineProps<BaseFilterBuilderProps>(), {
	modelValue: undefined,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseFilterBuilderEmits>()

const {
	ui,
	holdLeavingPlace,
	valueFieldProps,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootRef,
	matchId,
	match,
	rows,
	conditionLabel,
	removeLabel,
	joiner,
	setMatch,
	addCondition,
	removeCondition,
	clear,
	setField,
	setOperator,
	setValue,
} = useBaseFilterBuilder(props, emit)
</script>
