import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-medium">
		<BaseCard v-bind="args">
			<template #actions>
				<BaseButton variant="outline"><template #left><BaseIcon name="download" /></template>Скачать</BaseButton>
				<BaseButton variant="ghost" aria-label="Ещё" :padding="{ x: 5, y: 5 }"><BaseIcon name="menu" /></BaseButton>
			</template>
			{{ slots.default }}
		</BaseCard>
	</div>
`

export const WithActions: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Слот `actions` — кнопки справа в шапке. Кнопки высотой 32px стоят на строке заголовка и не увеличивают шапку.',
			},
			source: storySource({ template, imports: ['BaseCard', 'BaseButton', 'BaseIcon'] }),
		},
	},
	render: args => ({
		components: { BaseCard, BaseButton, BaseIcon },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const download = canvas.getByRole('button', { name: 'Скачать' })
		const header = download.closest('.base-card__header') as HTMLElement
		await expect(header.getBoundingClientRect().height).toBe(81)
		await expect(canvas.getByRole('button', { name: 'Ещё' })).toBeVisible()
	},
}
