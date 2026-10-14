import { BaseText } from '@components/BaseText'
import { expect, screen } from 'storybook/test'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseHoverCard.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseHoverCard from '../../../ui/BaseHoverCard.vue'
import { HOVER_CARD_VARIANTS } from '../../../types/BaseHoverCard.types'
import { literal, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const variants = HOVER_CARD_VARIANTS

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'variant']

const template = `
	<div class="story-col" style="gap: 24px;">
		<BaseHoverCard v-for="variant in variants" :key="variant" v-bind="args" :is-open="true" :variant="variant">
			<template #trigger>
				<BaseButton variant="outline">{{ variant }}</BaseButton>
			</template>
			<BaseText>Карточка {{ variant }}</BaseText>
		</BaseHoverCard>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	args: { position: 'right' },
	parameters: {
		controls: { include: ['position', 'sizeScale'] },
		docs: {
			...docsFrame(340),
			description: {
				story: [
					'Пять вариантов — те же, что у панели `BaseDropdown`. `default` — рамка и тень; `outline` — рамка заметнее, без тени;',
					'`shadow` — только тень; `soft` — мягкий нейтральный фон; `ghost` — без фона, рамки и стрелки (оформление даёт содержимое).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseHoverCard', 'BaseButton', 'BaseText'],
				script: `const variants = ${literal(variants)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseHoverCard, BaseButton, BaseText },
		setup: useStorySetup(args, { data: { variants }, slots: OWN_ARGS }),
		template,
	}),
	play: async () => {
		for (const variant of variants) {
			const panel = (await screen.findByText(`Карточка ${variant}`)).closest('.base-dropdown__panel') as HTMLElement
			await expect(panel).toHaveClass(`base-hover-card__panel--${variant}`)
		}
		await expect(document.querySelectorAll('.base-dropdown__arrow')).toHaveLength(variants.length - 1)
	},
}
