import { formatMessage } from '@/locales/state'
import { UI_FILTER_BUILDER } from '@/locales/messages'
import { computed, nextTick, ref, shallowRef, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { operatorLabel, operatorsFor, valueKind } from './filters/filterOperators'
import type {
	BaseFilterBuilderEmits,
	BaseFilterBuilderProps,
	FilterBuilderCondition,
	FilterBuilderRow,
	FilterBuilderField,
	FilterBuilderGroup,
	FilterBuilderOperator,
} from '../types/BaseFilterBuilder.types'

const EMPTY_GROUP: FilterBuilderGroup = { match: 'all', conditions: [] }

function conditionView(condition: FilterBuilderCondition, fields: readonly FilterBuilderField[]): FilterBuilderRow {
	const field = fields.find(item => item.key === condition.field)
	const type = field?.type ?? 'text'
	return {
		condition,
		field,
		operators: operatorsFor(type).map(value => ({ value, label: operatorLabel(value) })),
		valueKind: valueKind(condition.operator),
		inputType: type === 'boolean' ? 'text' : type,
	}
}

function useFilterGroup(props: BaseFilterBuilderProps, emit: BaseFilterBuilderEmits) {
	const group = shallowRef<FilterBuilderGroup>(props.modelValue ?? EMPTY_GROUP)
	watch(
		() => props.modelValue,
		value => {
			group.value = value ?? EMPTY_GROUP
		},
	)
	const commit = (next: FilterBuilderGroup): void => {
		group.value = next
		emit('update:modelValue', next)
	}
	const patch = (id: string, change: Partial<FilterBuilderCondition>): void =>
		commit({ ...group.value, conditions: group.value.conditions.map(item => (item.id === id ? { ...item, ...change } : item)) })
	return { group, commit, patch }
}

function useFilterFocus(rootRef: { value: HTMLElement | null }) {
	return (selector: string): void => {
		nextTick(() => rootRef.value?.querySelector<HTMLElement>(selector)?.focus())
	}
}

export function useBaseFilterBuilder(props: BaseFilterBuilderProps, emit: BaseFilterBuilderEmits) {
	const { group, commit, patch } = useFilterGroup(props, emit)
	const rootRef = ref<HTMLElement | null>(null)
	const focus = useFilterFocus(rootRef)
	const idPrefix = `rise-filter-${useId()}`
	let counter = 0
	const conditions = computed(() => group.value.conditions)
	return {
		...useStandardBaseComponent('base-filter-builder', props, ['root', 'row', 'actions']),
		rootRef,
		matchId: `${idPrefix}-match`,
		match: computed(() => group.value.match),
		rows: computed(() => conditions.value.map(condition => conditionView(condition, props.fields))),
		conditionLabel: (index: number): string => formatMessage(UI_FILTER_BUILDER.CONDITION, { n: index + 1 }),
		removeLabel: (index: number): string => formatMessage(UI_FILTER_BUILDER.REMOVE, { n: index + 1 }),
		joiner: (index: number): string => {
			if (index === 0) return UI_FILTER_BUILDER.WHERE
			return group.value.match === 'all' ? UI_FILTER_BUILDER.AND : UI_FILTER_BUILDER.OR
		},
		setMatch: (event: Event): void =>
			commit({ ...group.value, match: (event.target as HTMLSelectElement).value as FilterBuilderGroup['match'] }),
		addCondition(): void {
			const field = props.fields[0]
			const id = `${idPrefix}-${(counter += 1)}`
			commit({
				...group.value,
				conditions: [...conditions.value, { id, field: field.key, operator: operatorsFor(field.type)[0], value: '' }],
			})
			focus(`[data-condition-id="${id}"] select`)
		},
		removeCondition(id: string): void {
			const index = conditions.value.findIndex(item => item.id === id)
			const next = conditions.value[index + 1] ?? conditions.value[index - 1]
			commit({ ...group.value, conditions: conditions.value.filter(item => item.id !== id) })
			focus(next ? `[data-condition-id="${next.id}"] select` : '.base-filter-builder__add')
		},
		clear(): void {
			commit({ ...group.value, conditions: [] })
			focus('.base-filter-builder__add')
		},
		setField(id: string, key: string): void {
			const field = props.fields.find(item => item.key === key) as FilterBuilderField
			patch(id, { field: key, operator: operatorsFor(field.type)[0], value: '', valueTo: undefined })
		},
		setOperator: (id: string, operator: FilterBuilderOperator): void => patch(id, { operator }),
		setValue: (id: string, change: Partial<Pick<FilterBuilderCondition, 'value' | 'valueTo'>>): void => patch(id, change),
	}
}
