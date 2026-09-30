import BaseSearch from '../ui/BaseSearch.vue'

export type SearchArgs = InstanceType<typeof BaseSearch>['$props']

export function resultTitles(): string[] {
	return Array.from(document.querySelectorAll('.base-search__result-title')).map(el => el.textContent?.trim() ?? '')
}

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
