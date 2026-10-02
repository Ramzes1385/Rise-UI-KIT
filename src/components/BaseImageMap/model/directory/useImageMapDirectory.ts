import { computed } from 'vue'
import { getLocale, pluralize } from '@/locales/state'
import { directorySections } from './directorySections'
import { UI_IMAGE_MAP, UI_TEXT } from '@/locales/messages'
import type { ImageMapProps } from '../../types/BaseImageMap.types'
import { filterOptions, matchesSearch, searchText } from './filterUtils'
import type { DirectoryContext } from '../../types/imageMapInternal.types'
import type { ResolvedImageMapObject } from '../../types/imageMapModel.types'
import type { ImageMapDirectoryEntry, ImageMapFilterControl } from '../../types/ImageMapDirectory.types'

function useDirectoryEntries(props: ImageMapProps, context: DirectoryContext) {
	const layerTitles = computed(
		() => new Map<string | undefined, string>(props.data.layers.map(layer => [layer.id, layer.shortTitle ?? layer.title])),
	)
	const isMultiLayer = computed(() => props.directoryScope === 'all' && props.data.layers.length > 1)

	const indexed = computed(() =>
		context
			.resolved()
			.filter(item => !item.object.isHiddenInDirectory)
			.map(item => ({ item, text: searchText(item), layer: context.layerOf(item.object.id) })),
	)

	const matched = computed((): ResolvedImageMapObject[] => {
		const layer = context.getLayer()?.id
		const query = context.filters.search.value
		return indexed.value
			.filter(entry => props.directoryScope === 'all' || entry.layer === layer)
			.filter(entry => context.filters.isShown(entry.item.object) && matchesSearch(entry.text, query))
			.map(entry => entry.item)
	})

	const entries = computed((): ImageMapDirectoryEntry[] =>
		matched.value.map(item => ({
			item,
			layerTitle: isMultiLayer.value ? layerTitles.value.get(context.layerOf(item.object.id)) : undefined,
			isActive: context.getActive() === item.object.id,
			isHovered: context.getHover() === item.object.id,
		})),
	)

	return { entries }
}

export function useImageMapDirectory(props: ImageMapProps, context: DirectoryContext) {
	const { entries } = useDirectoryEntries(props, context)
	const { filters } = context

	return {
		sections: computed(() =>
			directorySections({
				entries: entries.value,
				groupBy: props.directoryGroupBy,
				groups: props.data.groups ?? [],
				locale: getLocale().intl,
				otherTitle: UI_IMAGE_MAP.OTHER_GROUP,
			}),
		),
		controls: computed((): ImageMapFilterControl[] =>
			(props.hasFilters ? (props.data.filters ?? []) : []).map(filter => ({
				filter,
				type: filter.type ?? 'checkbox',
				options: filterOptions(filter, props.data),
				selected: filters.values.value[filter.id] ?? [],
			})),
		),
		statusText: computed((): string => {
			if (!filters.search.value.trim() && !filters.hasSelection.value) return ''
			const count = entries.value.length
			return count ? pluralize(getLocale().plural.SEARCH_RESULTS, count) : UI_TEXT.NO_RESULTS
		}),
		hasClear: computed(() => Boolean(filters.search.value) || filters.hasSelection.value),
		legend: computed(() => (props.hasLegend ? (props.data.groups ?? []) : [])),
	}
}
