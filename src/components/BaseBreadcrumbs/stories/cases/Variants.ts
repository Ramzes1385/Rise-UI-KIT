import { SLOT_KEYS } from '../shared'
import type meta from '../BaseBreadcrumbs.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseBreadcrumbs from '../../ui/BaseBreadcrumbs.vue'
import { BREADCRUMBS_VARIANTS } from '../../types/BaseBreadcrumbs.types'

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			description: {
				story: [
					'Пять вариантов. `default` и `ghost` — для шапки страницы, контейнерные `outline`, `shadow`, `soft` — для тулбаров и карточек.',
					'Если на странице несколько крошек, дайте каждой своё имя через `aria-label` — так ориентиры различимы для скринридера.',
				].join('\n'),
			},
			source: { code: BREADCRUMBS_VARIANTS.map(variant => `<BaseBreadcrumbs :items="items" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), variants: BREADCRUMBS_VARIANTS }),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseBreadcrumbs v-bind="props" :variant="variant" :aria-label="'Хлебные крошки: ' + variant" />
				</div>
			</div>
		`,
	}),
}
