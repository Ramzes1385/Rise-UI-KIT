import { SEPARATORS, SLOT_KEYS } from '../shared'
import type meta from '../BaseBreadcrumbs.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseBreadcrumbs from '../../ui/BaseBreadcrumbs.vue'

export const Separators: StoryObj<typeof meta> = {
	argTypes: { separator: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Разделители: `chevron` (по умолчанию), `arrow`, `slash`, `dot`. Своё содержимое — через слот `separator`.',
			},
			source: { code: SEPARATORS.map(separator => `<BaseBreadcrumbs :items="items" separator="${separator}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), separators: SEPARATORS }),
		template: `
			<div class="story-stack">
				<div v-for="separator in separators" :key="separator" class="story-col">
					<span class="story-label">{{ separator }}</span>
					<BaseBreadcrumbs v-bind="props" :separator="separator" :aria-label="'Хлебные крошки: ' + separator" />
				</div>
			</div>
		`,
	}),
}
