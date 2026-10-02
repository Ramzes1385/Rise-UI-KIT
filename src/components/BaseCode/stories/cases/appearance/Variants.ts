import type meta from '../../BaseCode.stories'
import BaseCode from '../../../ui/BaseCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CODE_VARIANTS } from '../../../types/BaseCode.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-stack"><BaseCode v-for="variant in CODE_VARIANTS" :key="variant" v-bind="args" :variant="variant" :title="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`default` — приглушённая подложка в рамке, `soft` — подложка без рамки, `outline` — фон страницы в рамке. Цвета подсветки проходят контраст 4.5:1 на всех трёх фонах в обеих темах.',
			},
			source: storySource({ template, imports: ['BaseCode', 'CODE_VARIANTS'] }),
		},
		controls: { include: ['sizeScale', 'language', 'hasLineNumbers'] },
	},
	args: { code: 'const greeting = `Привет, ${name}!`\nconsole.log(greeting) // 1 строка', language: 'js' },
	render: args => ({
		components: { BaseCode },
		setup: useStorySetup(args, { data: { CODE_VARIANTS } }),
		template,
	}),
}
