import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMegaMenu from '../../../ui/BaseMegaMenu.vue'
import { SLOT_KEYS, VARIANT_ITEMS } from '../../shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items = VARIANT_ITEMS

const sizes = [87.5, 100, 112.5]

const template = `
	<div class="story-stack">
		<BaseMegaMenu
			v-for="size in sizes"
			:key="size"
			v-bind="args"
			:size-scale="size"
			:items="items"
			:aria-label="'Меню: ' + size" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		controls: { include: ['variant', 'trigger'] },
		docs: {
			description: {
				story: 'Размер задаёт `sizeScale`: строка, панель, отступы и иконки масштабируются вместе (87.5, 100 и 112.5).',
			},
			source: storySource({
				template,
				imports: ['BaseMegaMenu'],
				script: [`const items = ${literal(items)}`, `const sizes = ${literal(sizes)}`].join('\n'),
				omit: [...SLOT_KEYS, 'items', 'openKey'],
			}),
		},
	},
	render: args => ({
		components: { BaseMegaMenu },
		setup: useStorySetup(args, { data: { items, sizes }, slots: [...SLOT_KEYS, 'items', 'openKey'] }),
		template,
	}),
}
