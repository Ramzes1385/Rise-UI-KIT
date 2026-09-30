import type meta from '../BaseMarkdown.stories'
import BaseMarkdown from '../../ui/BaseMarkdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { MARKDOWN_VARIANTS } from '../../types/BaseMarkdown.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items = MARKDOWN_VARIANTS.map(variant => ({
	variant,
	source: `**${variant}** — текст с \`кодом\` и [ссылкой](https://example.com).`,
}))

const template = `
	<div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
		<BaseMarkdown v-for="item in items" :key="item.variant" v-bind="args" :variant="item.variant" :source="item.source" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`default` — текст страницы, `soft` — подложка, `outline` — рамка, `ghost` — цвет и размер от родителя.',
			},
			source: storySource({ template, imports: ['BaseMarkdown'], script: `const items = ${literal(items)}` }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseMarkdown },
		setup: useStorySetup(args, { data: { items } }),
		template,
	}),
}
