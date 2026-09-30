import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMegaMenu from '../../../ui/BaseMegaMenu.vue'
import { SLOT_KEYS, VARIANT_ITEMS } from '../../shared'
import { MEGA_MENU_VARIANTS } from '../../../types/BaseMegaMenu.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items = VARIANT_ITEMS

const template = `
	<div class="story-stack">
		<div v-for="variant in MEGA_MENU_VARIANTS" :key="variant" class="story-stack">
			<span class="story-label">{{ variant }}</span>
			<BaseMegaMenu v-bind="args" :variant="variant" :items="items" :aria-label="'Меню: ' + variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale', 'trigger'] },
		docs: {
			description: {
				story: [
					'Варианты строки: `default` — рамка и фон; `outline` — рамка accented; `shadow` — рамка и тень;',
					'`soft` — мягкий фон без рамки; `ghost` — без фона и рамки, для шапки со своим фоном. Панель у всех одна.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMegaMenu', 'MEGA_MENU_VARIANTS'],
				script: `const items = ${literal(items)}`,
				omit: [...SLOT_KEYS, 'items', 'openKey'],
			}),
		},
	},
	render: args => ({
		components: { BaseMegaMenu },
		setup: useStorySetup(args, { data: { items, MEGA_MENU_VARIANTS }, slots: [...SLOT_KEYS, 'items', 'openKey'] }),
		template,
	}),
}
