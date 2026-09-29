import { ICON_BUTTON } from '../../shared'
import type meta from '../../BaseChip.stories'
import BaseChip from '../../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'placement'] },
		docs: {
			description: { story: 'Пять вариантов оформления индикатора. Размер и расположение из Controls применяются ко всем примерам.' },
			source: {
				code: ['default', 'soft', 'outline', 'ghost', 'shadow']
					.map(variant => `<BaseChip variant="${variant}" :content="3">…</BaseChip>`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ['default', 'soft', 'outline', 'ghost', 'shadow'] }),
		template: `
			<div class="story-row" style="gap: 32px; padding: 12px;">
				<div v-for="variant in variants" :key="variant" class="story-col" style="align-items: center;">
					<BaseChip v-bind="props" :variant="variant" :content="3">${ICON_BUTTON}</BaseChip>
					<span class="story-label" style="min-width: 0;">{{ variant }}</span>
				</div>
			</div>
		`,
	}),
}
