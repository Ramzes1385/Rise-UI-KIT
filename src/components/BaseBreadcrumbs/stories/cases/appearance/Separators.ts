import { SEPARATORS, SLOT_KEYS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'
import BaseBreadcrumbs from '../../../ui/BaseBreadcrumbs.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const separators = SEPARATORS

const template = `
	<div class="story-stack">
		<div v-for="separator in separators" :key="separator" class="story-col">
			<span class="story-label">{{ separator }}</span>
			<BaseBreadcrumbs v-bind="args" :separator="separator" :aria-label="'Хлебные крошки: ' + separator" />
		</div>
	</div>
`

export const Separators: StoryObj<typeof meta> = {
	argTypes: { separator: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Разделители: `chevron` (по умолчанию), `arrow`, `slash`, `dot`. Своё содержимое — через слот `separator`.',
			},
			source: storySource({
				template,
				imports: ['BaseBreadcrumbs'],
				script: `const separators = ${literal(separators)}`,
				omit: ['linkComponent'],
			}),
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: useStorySetup(args, { data: { separators }, slots: SLOT_KEYS }),
		template,
	}),
}
