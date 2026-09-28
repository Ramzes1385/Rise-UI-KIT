import type meta from '../BasePopover.stories'
import { BaseText } from '@components/BaseText'
import BasePopover from '../../ui/BasePopover.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { docsFrame, SHOWCASE_OWN_ARGS } from '../shared'
import { POPOVER_VARIANTS } from '../../types/BasePopover.types'

export const Variants: StoryObj<typeof meta> = {
	args: { position: 'right' },
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Пять вариантов — те же, что у панели `BaseDropdown`. `default` — рамка и тень; `outline` — рамка заметнее, без тени;',
					'`shadow` — только тень; `soft` — мягкий нейтральный фон; `ghost` — без фона, рамки и стрелки.',
				].join('\n'),
			},
			...docsFrame(340),
			source: {
				code: POPOVER_VARIANTS.map(variant => `<BasePopover v-model:is-open="isOpen" variant="${variant}">…</BasePopover>`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'variant']), variants: POPOVER_VARIANTS }),
		template: `
			<div class="story-col" style="gap: 24px;">
				<BasePopover v-for="variant in variants" :key="variant" v-bind="props" :is-open="true" :variant="variant">
					<template #trigger>
						<BaseButton variant="outline">{{ variant }}</BaseButton>
					</template>
					<BaseText>Поповер {{ variant }}</BaseText>
				</BasePopover>
			</div>
		`,
	}),
}
