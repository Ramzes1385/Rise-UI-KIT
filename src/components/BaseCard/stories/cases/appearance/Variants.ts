import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = ['default', 'outline', 'soft', 'ghost', 'shadow']

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseCard v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :title="variant" subtitle="Обновлён 15 мая">
			Выручка выросла на 12% к апрелю.
		</BaseCard>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isHoverable'] },
		docs: {
			description: { story: 'Пять вариантов оформления. `soft` и `ghost` — для карточек внутри других поверхностей.' },
			source: storySource({
				template,
				imports: ['BaseCard'],
				script: `const variants = ${literal(variants)}`,
				omit: ['default', 'title', 'subtitle'],
			}),
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: useStorySetup(args, { data: { variants }, slots: ['default', 'title', 'subtitle'] }),
		template,
	}),
}
