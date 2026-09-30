import { expect } from 'storybook/test'
import { SLOT_KEYS, USER } from '../../shared'
import type meta from '../../BaseSideBar.stories'
import { BaseAvatar } from '@components/BaseAvatar'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const user = USER

const models = { isCollapsed: 'isCollapsed' }

const template = `
	<div style="display: flex; height: 420px;">
		<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed">
			<template #footer>
				<div class="story-row" style="flex-wrap: nowrap; gap: 8px;">
					<BaseAvatar :src="user.avatar" :name="user.name" :size-scale="80" />
					<span v-if="!isCollapsed">{{ user.name }}</span>
				</div>
			</template>
		</BaseSideBar>
		<main style="flex: 1; padding: 24px;">Основное содержимое страницы</main>
	</div>
`

export const AppLayout: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Раскладка приложения: сайдбар на всю высоту области, рядом — основное содержимое.' },
			source: storySource({
				template,
				imports: ['BaseSideBar', 'BaseAvatar'],
				script: `const user = ${literal(user)}`,
				models,
				omit: [...SLOT_KEYS, 'linkComponent'],
			}),
		},
	},
	render: args => ({
		components: { BaseSideBar, BaseAvatar },
		setup: useStorySetup(args, { models, data: { user }, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas }) => {
		const sidebar = canvas.getByRole('complementary')
		const frame = sidebar.parentElement as HTMLElement
		await expect(Math.round(sidebar.getBoundingClientRect().height)).toBe(Math.round(frame.getBoundingClientRect().height))
	},
}
