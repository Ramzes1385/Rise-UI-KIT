import type meta from '../BaseMarkdown.stories'
import BaseMarkdown from '../../ui/BaseMarkdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { MARKDOWN_VARIANTS } from '../../types/BaseMarkdown.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`default` — текст страницы, `soft` — подложка, `outline` — рамка, `ghost` — цвет и размер от родителя.',
			},
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseMarkdown },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			items: MARKDOWN_VARIANTS.map(variant => ({
				variant,
				source: `**${variant}** — текст с \`кодом\` и [ссылкой](https://example.com).`,
			})),
		}),
		template: `
			<div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
				<BaseMarkdown v-for="item in items" :key="item.variant" v-bind="props" :variant="item.variant" :source="item.source" />
			</div>`,
	}),
}
