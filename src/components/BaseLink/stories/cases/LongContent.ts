import { expect } from 'storybook/test'
import type meta from '../BaseLink.stories'
import BaseLink from '../../ui/BaseLink.vue'
import { BaseText } from '@components/BaseText'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseText style="max-width: 280px;">
		Перед публикацией проверьте
		<BaseLink v-bind="args" label="требования к субтитрам, звуковым дорожкам и обложкам серий для каталога сообщества" />
		— иначе модерация вернёт серию на доработку.
	</BaseText>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинный текст переносится по словам вместе с окружающим текстом.' },
			source: storySource({ template, imports: ['BaseLink', 'BaseText'], omit: ['linkComponent'] }),
		},
	},
	render: args => ({
		components: { BaseLink, BaseText },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link')
		await expect(link.getClientRects().length).toBeGreaterThan(1)
	},
}
