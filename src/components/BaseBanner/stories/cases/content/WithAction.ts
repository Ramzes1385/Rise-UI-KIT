import { MESSAGES } from '../../shared'
import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseBanner.stories'
import BaseBanner from '../../../ui/BaseBanner.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseBanner v-bind="args">
		<template #action>
			<BaseLink href="#details" variant="ghost">Подробнее</BaseLink>
		</template>
	</BaseBanner>
`

export const WithAction: StoryObj<typeof meta> = {
	args: { type: 'warning', variant: 'soft', text: MESSAGES.warning, isClosable: true },
	parameters: {
		docs: {
			description: {
				story: 'Слот `action`: ссылка или кнопка справа от текста. Вместе с `isClosable` кнопка «Закрыть» идёт последней в порядке Tab.',
			},
			source: storySource({ template, imports: ['BaseBanner', 'BaseLink'] }),
		},
	},
	render: args => ({
		components: { BaseBanner, BaseLink },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const link = canvas.getByRole('link', { name: 'Подробнее' })
		await tabTo(link, userEvent)
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Закрыть' })).toHaveFocus()
	},
}
