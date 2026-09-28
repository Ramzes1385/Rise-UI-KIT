import { ref } from 'vue'
import BaseSearch from '../ui/BaseSearch.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export type SearchArgs = InstanceType<typeof BaseSearch>['$props']

export function resultTitles(): string[] {
	return Array.from(document.querySelectorAll('.base-search__result-title')).map(el => el.textContent?.trim() ?? '')
}

export function renderWithLocalQuery(args: SearchArgs) {
	return {
		components: { BaseSearch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'onUpdate:modelValue']),
			query: ref(String(args.modelValue ?? '')),
		}),
		template: '<div class="story-narrow"><BaseSearch v-bind="props" v-model="query" /></div>',
	}
}

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
