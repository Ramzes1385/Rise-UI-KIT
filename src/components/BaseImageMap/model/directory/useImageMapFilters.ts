import { computed, ref, watch } from 'vue'
import { initialFilterValues, matchesFilters } from './filterUtils'
import type { ImageMapObject } from '../../types/imageMapData.types'
import type { BaseImageMapEmits, ImageMapFilterValues, ImageMapProps } from '../../types/BaseImageMap.types'

function useSearchModel(props: ImageMapProps, emit: BaseImageMapEmits) {
	const search = ref(props.search ?? '')
	watch(
		() => props.search,
		value => {
			search.value = value ?? ''
		},
	)
	return {
		search,
		setSearch(value: string): void {
			if (search.value === value) return
			search.value = value
			emit('update:search', value)
		},
	}
}

function useValuesModel(props: ImageMapProps, emit: BaseImageMapEmits) {
	const local = ref<ImageMapFilterValues | null>(props.filters ?? null)
	watch(
		() => props.filters,
		value => {
			if (value) local.value = value
		},
	)
	function commit(next: ImageMapFilterValues): void {
		local.value = next
		emit('update:filters', next)
	}
	return { values: computed(() => local.value ?? initialFilterValues(props.data.filters ?? [])), commit }
}

export function useImageMapFilters(props: ImageMapProps, emit: BaseImageMapEmits, isOpenNow?: (id: string) => boolean) {
	const { search, setSearch } = useSearchModel(props, emit)
	const { values, commit } = useValuesModel(props, emit)
	const activeFilters = computed(() => (props.hasFilters ? (props.data.filters ?? []) : []))
	const isOpenNowOn = computed(() =>
		activeFilters.value.some(filter => filter.type === 'open-now' && Boolean(values.value[filter.id]?.length)),
	)

	return {
		search,
		setSearch,
		values,
		hasSelection: computed(() => activeFilters.value.some(filter => Boolean(values.value[filter.id]?.length))),
		isShown: (object: ImageMapObject): boolean =>
			matchesFilters(object, activeFilters.value, values.value) && (!isOpenNowOn.value || Boolean(isOpenNow?.(object.id))),
		setFilter(id: string, next: string[]): void {
			commit({ ...values.value, [id]: next })
		},
		toggleFilter(id: string, value: string, isOn: boolean): void {
			const current = (values.value[id] ?? []).filter(item => item !== value)
			commit({ ...values.value, [id]: isOn ? [...current, value] : current })
		},
		clearFilters(): void {
			setSearch('')
			if (Object.keys(values.value).length) commit({})
		},
	}
}
