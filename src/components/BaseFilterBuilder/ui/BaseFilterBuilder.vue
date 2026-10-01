<template>
	<div
		ref="rootRef"
		class="base-filter-builder"
		:class="[variantClass, classes.root, { 'base-filter-builder--disabled': isDisabled }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group"
		:aria-label="UI_FILTER_BUILDER.LABEL">
		<div v-if="rows.length > 1" class="base-filter-builder__match">
			<span :id="matchId">{{ UI_FILTER_BUILDER.MATCH }}</span>
			<span class="base-filter-builder__select base-filter-builder__select--inline">
				<select :aria-labelledby="matchId" :value="match" :disabled="isDisabled" @change="setMatch">
					<option value="all">{{ UI_FILTER_BUILDER.MATCH_ALL }}</option>
					<option value="any">{{ UI_FILTER_BUILDER.MATCH_ANY }}</option>
				</select>
				<BaseIcon name="chevron-down" />
			</span>
		</div>
		<p v-if="rows.length === 0" class="base-filter-builder__empty">{{ UI_FILTER_BUILDER.EMPTY }}</p>
		<ol v-else class="base-filter-builder__list">
			<li v-for="(row, index) in rows" :key="row.condition.id" :data-condition-id="row.condition.id">
				<div class="base-filter-builder__row" :class="classes.row" role="group" :aria-label="conditionLabel(index)">
					<span class="base-filter-builder__joiner" aria-hidden="true">{{ joiner(index) }}</span>
					<span class="base-filter-builder__select">
						<select
							:aria-label="UI_FILTER_BUILDER.FIELD"
							:value="row.condition.field"
							:disabled="isDisabled"
							@change="setField(row.condition.id, ($event.target as HTMLSelectElement).value)">
							<option v-for="field in fields" :key="field.key" :value="field.key">{{ field.label }}</option>
						</select>
						<BaseIcon name="chevron-down" />
					</span>
					<span class="base-filter-builder__select">
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
						<span v-if="row.inputType === 'select'" class="base-filter-builder__select base-filter-builder__value">
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
						<input
							v-else
							class="base-filter-builder__input base-filter-builder__value"
							:type="row.inputType"
							:inputmode="row.inputType === 'number' ? 'decimal' : undefined"
							:aria-label="row.valueKind === 'range' ? UI_FILTER_BUILDER.VALUE_FROM : UI_FILTER_BUILDER.VALUE"
							:value="row.condition.value"
							:disabled="isDisabled"
							@input="setValue(row.condition.id, { value: ($event.target as HTMLInputElement).value })" />
						<input
							v-if="row.valueKind === 'range'"
							class="base-filter-builder__input base-filter-builder__value"
							:type="row.inputType"
							:inputmode="row.inputType === 'number' ? 'decimal' : undefined"
							:aria-label="UI_FILTER_BUILDER.VALUE_TO"
							:value="row.condition.valueTo ?? ''"
							:disabled="isDisabled"
							@input="setValue(row.condition.id, { valueTo: ($event.target as HTMLInputElement).value })" />
					</template>
					<BaseButton
						variant="ghost"
						class="base-filter-builder__remove"
						:aria-label="removeLabel(index)"
						:is-disabled="isDisabled"
						:size-scale="sizeScale"
						@click="removeCondition(row.condition.id)">
						<BaseIcon name="x-mark" />
					</BaseButton>
				</div>
			</li>
		</ol>
		<div class="base-filter-builder__actions" :class="classes.actions">
			<BaseButton
				variant="ghost"
				class="base-filter-builder__button base-filter-builder__add"
				:is-disabled="isDisabled || fields.length === 0"
				:size-scale="sizeScale"
				@click="addCondition">
				<template #left><BaseIcon name="plus" /></template>
				{{ UI_FILTER_BUILDER.ADD }}
			</BaseButton>
			<BaseButton
				v-if="rows.length"
				variant="ghost"
				class="base-filter-builder__button"
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
