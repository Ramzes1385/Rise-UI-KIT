import { BaseText } from '@components/BaseText'
import { expect, screen } from 'storybook/test'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseHoverCard.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseHoverCard from '../../../ui/BaseHoverCard.vue'
import { docsFrame, literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => ['sm', 'md', 'lg'].includes(preset.name)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'sizeScale']

const template = `
	<div class="story-row" style="gap: 96px;">
		<BaseHoverCard v-for="preset in presets" :key="preset.name" v-bind="args" :is-open="true" :size-scale="preset.sizeScale">
			<template #trigger>
				<BaseButton variant="outline" :size-scale="preset.sizeScale">{{ preset.label }}</BaseButton>
			</template>
			<BaseText>Карточка {{ preset.name }}</BaseText>
		</BaseHoverCard>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		layout: 'padded',
		controls: { include: ['variant'] },
		docs: {
			...docsFrame(180),
			description: {
				story: 'Размеры через `sizeScale`: пропорционально меняются отступы, кегль, стрелка и ширина карточки (до 320px при 100).',
			},
			source: storySource({
				template,
				imports: ['BaseHoverCard', 'BaseButton', 'BaseText'],
				script: `const presets = ${literal(presets)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseHoverCard, BaseButton, BaseText },
		setup: useStorySetup(args, { data: { presets }, slots: OWN_ARGS }),
		template,
	}),
	play: async () => {
		const sizes: number[] = []
		for (const preset of presets) {
			const inner = (await screen.findByText(`Карточка ${preset.name}`)).closest('.base-hover-card__inner') as HTMLElement
			sizes.push(parseFloat(getComputedStyle(inner).fontSize))
		}
		await expect(sizes[0]).toBeLessThan(sizes[1])
		await expect(sizes[1]).toBeLessThan(sizes[2])
	},
}
