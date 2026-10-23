import { SLOT_KEYS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'
import BaseBreadcrumbs from '../../../ui/BaseBreadcrumbs.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { BREADCRUMBS_VARIANTS } from '../../../types/BaseBreadcrumbs.types'

const template = `
	<div class="story-stack">
		<div v-for="variant in BREADCRUMBS_VARIANTS" :key="variant" class="story-col">
			<span class="story-label">{{ variant }}</span>
			<BaseBreadcrumbs v-bind="args" :variant="variant" :aria-label="'Хлебные крошки: ' + variant" />
		</div>
	</div>
`

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
			source: storySource({ template, imports: ['BaseBreadcrumbs', 'BREADCRUMBS_VARIANTS'], omit: ['linkComponent'] }),
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: useStorySetup(args, { data: { BREADCRUMBS_VARIANTS }, slots: SLOT_KEYS }),
		template,
	}),
}
