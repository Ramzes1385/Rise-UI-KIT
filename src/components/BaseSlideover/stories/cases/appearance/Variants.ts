import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseSlideover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../../ui/BaseSlideover.vue'
import { SLIDEOVER_VARIANTS } from '../../../types/BaseSlideover.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = SLIDEOVER_VARIANTS

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'variant']

const template = `
	<div class="story-grid" style="--story-grid-min: 280px;">
		<div v-for="variant in variants" :key="variant" class="story-frame" style="height: 220px;">
			<BaseSlideover v-bind="args" :is-open="true" is-contained :variant="variant" :title="variant">
				<BaseText>Панель открыта внутри рамки.</BaseText>
			</BaseSlideover>
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'width', 'hasOverlay'] },
		docs: {
			description: {
				story: [
					'Три варианта, как у BaseModal. `default` — рамка и тень; `shadow` — только тень; `ghost` — без фона, рамки и тени,',
					'когда оформление даёт содержимое. Панели открыты внутри рамок (`isContained`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSlideover', 'BaseText'],
				script: `const variants = ${literal(variants)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: useStorySetup(args, { data: { variants }, slots: OWN_ARGS }),
		template,
	}),
}
