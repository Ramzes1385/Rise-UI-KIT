import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BasePopover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { POPOVER_VARIANTS } from '../../../types/BasePopover.types'
import { literal, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const variants = POPOVER_VARIANTS

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'variant']

const template = `
	<div class="story-col" style="gap: 24px;">
		<BasePopover v-for="variant in variants" :key="variant" v-bind="args" :is-open="true" :variant="variant">
			<template #trigger>
				<BaseButton variant="outline">{{ variant }}</BaseButton>
			</template>
			<BaseText>Поповер {{ variant }}</BaseText>
		</BasePopover>
	</div>
`

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
			source: storySource({
				template,
				imports: ['BasePopover', 'BaseButton', 'BaseText'],
				script: `const variants = ${literal(variants)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText },
		setup: useStorySetup(args, { data: { variants }, slots: OWN_ARGS }),
		template,
	}),
}
