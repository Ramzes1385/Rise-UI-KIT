import { docsFrame } from '../shared'
import type meta from '../BaseTooltip.stories'
import BaseTooltip from '../../ui/BaseTooltip.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { TOOLTIP_VARIANTS } from '../../types/BaseTooltip.types'

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
			source: {
				code: TOOLTIP_VARIANTS.map(variant => `<BaseTooltip text="${variant}" variant="${variant}">…</BaseTooltip>`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'text']), variants: TOOLTIP_VARIANTS }),
		template: `
			<div class="story-row" style="gap: 48px;">
				<BaseTooltip v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :text="variant">
					<BaseButton variant="outline">{{ variant }}</BaseButton>
				</BaseTooltip>
			</div>
		`,
	}),
}
