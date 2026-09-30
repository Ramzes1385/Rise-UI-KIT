import type meta from '../../BaseChip.stories'
import BaseChip from '../../../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = ['default', 'soft', 'outline', 'ghost', 'shadow']

const template = `
	<div class="story-row" style="gap: 32px; padding: 12px;">
		<div v-for="variant in variants" :key="variant" class="story-col" style="align-items: center;">
			<BaseChip v-bind="args" :variant="variant" :content="3">
				<BaseButton variant="outline" aria-label="Уведомления" :padding="{ x: 5, y: 5 }">
					<BaseIcon name="inbox" />
				</BaseButton>
			</BaseChip>
			<span class="story-label" style="min-width: 0;">{{ variant }}</span>
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'placement'] },
		docs: {
			description: { story: 'Пять вариантов оформления индикатора. Размер и расположение из Controls применяются ко всем примерам.' },
			source: storySource({
				template,
				imports: ['BaseChip', 'BaseButton', 'BaseIcon'],
				script: `const variants = ${literal(variants)}`,
			}),
		},
	},
	render: args => ({
		components: { BaseChip, BaseButton, BaseIcon },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
