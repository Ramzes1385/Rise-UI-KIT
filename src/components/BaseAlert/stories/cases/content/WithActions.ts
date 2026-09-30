import { MESSAGES } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseAlert.stories'
import BaseAlert from '../../../ui/BaseAlert.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-medium">
		<BaseAlert v-bind="args">
			<template #actions>
				<BaseButton variant="outline" :size-scale="87.5">Продлить</BaseButton>
			</template>
		</BaseAlert>
	</div>
`

export const WithActions: StoryObj<typeof meta> = {
	args: {
		type: 'warning',
		variant: 'soft',
		title: MESSAGES.warning.title,
		description: MESSAGES.warning.description,
		isClosable: true,
	},
	parameters: {
		docs: {
			description: { story: 'Слот `actions`: кнопки справа от текста. Вместе с `isClosable` кнопка «Закрыть» идёт последней.' },
			source: storySource({ template, imports: ['BaseAlert', 'BaseButton'] }),
		},
	},
	render: args => ({
		components: { BaseAlert, BaseButton },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const [renew, close] = canvas.getAllByRole('button')
		await expect(renew).toHaveAccessibleName('Продлить')
		await expect(close).toHaveAccessibleName('Закрыть')
	},
}
