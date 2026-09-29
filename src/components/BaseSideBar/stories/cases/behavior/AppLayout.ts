import { expect } from 'storybook/test'
import type meta from '../../BaseSideBar.stories'
import { BaseAvatar } from '@components/BaseAvatar'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { SLOT_KEYS, USER, PROFILE_FOOTER } from '../../shared'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const AppLayout: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Раскладка приложения: сайдбар на всю высоту области, рядом — основное содержимое.' } } },
	render: args => {
		const onUpdate = useModelArg('isCollapsed')
		return {
			components: { BaseSideBar, BaseAvatar },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate, user: USER }),
			template: `
				<div style="display: flex; height: 420px;">
					<BaseSideBar v-bind="props" @update:is-collapsed="onUpdate">${PROFILE_FOOTER}</BaseSideBar>
					<main style="flex: 1; padding: 24px;">Основное содержимое страницы</main>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		const sidebar = canvas.getByRole('complementary')
		const frame = sidebar.parentElement as HTMLElement
		await expect(Math.round(sidebar.getBoundingClientRect().height)).toBe(Math.round(frame.getBoundingClientRect().height))
	},
}
