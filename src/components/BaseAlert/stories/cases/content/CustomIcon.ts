import { expect } from 'storybook/test'
import type meta from '../../BaseAlert.stories'
import BaseAlert from '../../../ui/BaseAlert.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { avatarImage, literal, storySource, useStorySetup } from '@/stories/helpers'

const avatar = avatarImage(210)

const template = `
	<div class="story-stack story-medium">
		<BaseAlert v-bind="args" icon="calendar" title="Встреча перенесена на 16:00" description="Ссылка на звонок прежняя." />
		<BaseAlert v-bind="args" title="Иван Петров оставил комментарий">
			<template #icon>
				<img :src="avatar" alt="" width="20" height="20" style="border-radius: var(--rise-radius-full);" />
			</template>
			«Проверь, пожалуйста, цифры за май»
		</BaseAlert>
	</div>
`

export const CustomIcon: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Своя иконка: проп `icon` (имя из спрайта) или слот `icon` — например, аватар автора.' },
			source: storySource({
				template,
				imports: ['BaseAlert'],
				script: `const avatar = ${literal(avatar)}`,
				omit: ['default', 'title', 'description', 'icon'],
			}),
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: useStorySetup(args, { data: { avatar }, slots: ['default', 'title', 'description', 'icon'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [first] = canvasElement.querySelectorAll('.base-alert')
		await expect(first.querySelector('use')).toHaveAttribute('href', 'icons.svg#calendar')
	},
}
