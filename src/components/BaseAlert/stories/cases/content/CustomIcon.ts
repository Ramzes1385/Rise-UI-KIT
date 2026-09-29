import { expect } from 'storybook/test'
import type meta from '../../BaseAlert.stories'
import BaseAlert from '../../../ui/BaseAlert.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, avatarImage } from '@/stories/helpers'

export const CustomIcon: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Своя иконка: проп `icon` (имя из спрайта) или слот `icon` — например, аватар автора.' },
			source: {
				code: [
					'<BaseAlert icon="calendar" title="Встреча перенесена на 16:00" />',
					'<BaseAlert title="Иван Петров оставил комментарий">',
					'  <template #icon><img :src="avatar" alt="" class="avatar" /></template>',
					'  «Проверь, пожалуйста, цифры за май»',
					'</BaseAlert>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'title', 'description', 'icon']), avatar: avatarImage(210) }),
		template: `
			<div class="story-stack story-medium">
				<BaseAlert v-bind="props" icon="calendar" title="Встреча перенесена на 16:00" description="Ссылка на звонок прежняя." />
				<BaseAlert v-bind="props" title="Иван Петров оставил комментарий">
					<template #icon>
						<img :src="avatar" alt="" width="20" height="20" style="border-radius: var(--rise-radius-full);" />
					</template>
					«Проверь, пожалуйста, цифры за май»
				</BaseAlert>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [first] = canvasElement.querySelectorAll('.base-alert')
		await expect(first.querySelector('use')).toHaveAttribute('href', 'icons.svg#calendar')
	},
}
