import { expect } from 'storybook/test'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { clicks: 0 }

const template = `
	<div class="story-row">
		<BaseAvatar v-bind="args" alt="Профиль Анны Смирновой" @click="clicks++" />
		<span class="story-label" role="status">Нажатий: {{ clicks }}</span>
	</div>
`

export const Clickable: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['name', 'variant', 'shape', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Кликабельный аватар: с обработчиком `@click` он работает как кнопка — `role="button"`, фокус с Tab, Enter и Space.',
					'Имя кнопки — `alt`, без него — `name`, без обоих — «Аватар» из словаря (`UI_ARIA.AVATAR`).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAvatar'], state, omit: ['alt'] }),
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { state, slots: ['alt'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const avatar = canvas.getByRole('button', { name: 'Профиль Анны Смирновой' })
		await tabTo(avatar, userEvent)
		await expect(getComputedStyle(avatar).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('status')).toHaveTextContent('Нажатий: 2')
	},
}
