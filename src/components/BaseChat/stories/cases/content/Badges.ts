import type meta from '../../BaseChat.stories'
import BaseChat from '../../../ui/BaseChat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { expect, screen, waitFor, within } from 'storybook/test'
import { ANNA, GROUP_CHAT, GROUP_MESSAGES, MEMBER_BADGES } from '../../shared'

const template = `
	<div class="story-medium">
		<BaseChat v-bind="args" />
	</div>
`

const HIDDEN = 'Ещё 2 значка: 100 дней подряд в чате, Выпустила 10 релизов'

export const Badges: StoryObj<typeof meta> = {
	args: { ...GROUP_CHAT, messages: GROUP_MESSAGES },
	parameters: {
		docs: {
			description: {
				story: [
					'Значки участников (`members[].badges`): «подтверждён» — иконкой кита с цветом, достижения — эмодзи. В группе',
					'значки стоят рядом с именем отправителя (по `senderId`) и в списке участников; видны первые `maxBadges`',
					'(по умолчанию 3), остальные — счётчиком «+N». Подсказка при наведении называет значок, скринридер читает',
					'название; полный список с подписями — в профиле участника.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseChat'] }),
		},
	},
	render: args => ({
		components: { BaseChat },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByRole('img', { name: 'Подтверждённый аккаунт' }).length).toBeGreaterThan(0)
		const [more] = canvas.getAllByRole('img', { name: HIDDEN })
		await expect(more).toHaveTextContent('+2')
		await userEvent.hover(more)
		await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent(HIDDEN))
		await userEvent.unhover(more)

		const [annaName] = canvas.getAllByRole('button', { name: ANNA.name })
		await userEvent.click(annaName)
		const profile = await canvas.findByRole('dialog', { name: 'Профиль' })
		const badges = within(profile).getByRole('region', { name: 'Значки' })
		for (const badge of MEMBER_BADGES.u1) await expect(within(badges).getByText(badge.label)).toBeInTheDocument()
	},
}
