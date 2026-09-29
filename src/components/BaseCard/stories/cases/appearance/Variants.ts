import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isHoverable'] },
		docs: {
			description: { story: 'Пять вариантов оформления. `soft` и `ghost` — для карточек внутри других поверхностей.' },
			source: {
				code: ['default', 'outline', 'soft', 'ghost', 'shadow']
					.map(variant => `<BaseCard variant="${variant}" title="${variant}">…</BaseCard>`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle']),
			variants: ['default', 'outline', 'soft', 'ghost', 'shadow'],
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseCard v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :title="variant" subtitle="Обновлён 15 мая">
					Выручка выросла на 12% к апрелю.
				</BaseCard>
			</div>
		`,
	}),
}
