import type meta from '../../BaseTooltip.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTooltip from '../../../ui/BaseTooltip.vue'
import { TOOLTIP_VARIANTS } from '../../../types/BaseTooltip.types'
import { literal, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const variants = TOOLTIP_VARIANTS

const OWN_ARGS = ['variant', 'text']

const template = `
	<div class="story-row" style="gap: 48px;">
		<BaseTooltip v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :text="variant">
			<BaseButton variant="outline">{{ variant }}</BaseButton>
		</BaseTooltip>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	args: { isAlwaysVisible: true },
	parameters: {
		controls: { include: ['position', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Пять вариантов. `default` — инвертированный фон (основной); `soft` — мягкий фон основного цвета;',
					'`outline` и `shadow` — светлая подсказка с рамкой и с тенью; `ghost` — приподнятый нейтральный фон без стрелки.',
				].join('\n'),
			},
			...docsFrame(140),
			source: storySource({
				template,
				imports: ['BaseTooltip', 'BaseButton'],
				script: `const variants = ${literal(variants)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: useStorySetup(args, { data: { variants }, slots: OWN_ARGS }),
		template,
	}),
}
