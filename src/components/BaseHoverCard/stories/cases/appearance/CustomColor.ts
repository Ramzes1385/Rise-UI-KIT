import { panelOf } from '../../shared'
import { expect } from 'storybook/test'
import { BaseText } from '@components/BaseText'
import type meta from '../../BaseHoverCard.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseHoverCard from '../../../ui/BaseHoverCard.vue'
import { storySource, useStorySetup, docsFrame, resolveColor } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<BaseHoverCard v-bind="args" v-model:is-open="isOpen">
		<template #trigger>
			<BaseButton variant="outline">Что нового</BaseButton>
		</template>
		<BaseText>Субтитры теперь можно сдвигать горячими клавишами.</BaseText>
	</BaseHoverCard>
`

export const CustomColor: StoryObj<typeof meta> = {
	args: {
		isOpen: true,
		color: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	},
	parameters: {
		controls: { include: ['color', 'position'] },
		docs: {
			...docsFrame(200),
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст карточки, стрелка того же цвета. Подойдёт любой CSS-цвет; токены `var(--rise-…)`',
					'сохраняют контраст в обеих темах.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseHoverCard', 'BaseButton', 'BaseText'], models }),
		},
	},
	render: args => ({
		components: { BaseHoverCard, BaseButton, BaseText },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async () => {
		const panel = await panelOf(/Субтитры теперь/)
		const arrow = panel.querySelector('.base-dropdown__arrow') as HTMLElement
		await expect(getComputedStyle(panel).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(arrow).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(panel).color).toBe(resolveColor('var(--rise-primary-text)'))
	},
}
