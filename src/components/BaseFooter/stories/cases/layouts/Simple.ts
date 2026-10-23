import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseFooter.stories'
import BaseFooter from '../../../ui/BaseFooter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFooter container-size="lg">
		<template #start>© 2026 Rise Studio</template>
		<template #end>
			<nav aria-label="Документы" class="story-row" style="gap: 16px">
				<BaseLink href="#terms">Условия</BaseLink>
				<BaseLink href="#privacy">Конфиденциальность</BaseLink>
			</nav>
		</template>
	</BaseFooter>
`

export const Simple: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Простой: копирайт слева, две ссылки справа — одна строка на ширину `lg`.' },
			source: staticStorySource({ template, imports: ['BaseFooter', 'BaseLink'] }),
		},
		controls: { disable: true },
	},
	render: args => ({ components: { BaseFooter, BaseLink }, setup: useStorySetup(args), template }),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('contentinfo')).toHaveTextContent('© 2026 Rise Studio')
		await expect(canvas.getAllByRole('link')).toHaveLength(2)
	},
}
