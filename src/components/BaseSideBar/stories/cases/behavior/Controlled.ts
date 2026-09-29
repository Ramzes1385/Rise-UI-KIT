import { ref } from 'vue'
import { expect } from 'storybook/test'
import { SLOT_KEYS } from '../../shared'
import type meta from '../../BaseSideBar.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Controlled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Управляемый режим: `v-model:isCollapsed` связывает панель с состоянием приложения — например, с кнопкой в шапке',
					'страницы. Кнопка сворачивания внутри панели меняет то же значение.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseSideBar v-model:is-collapsed="isCollapsed" :items="items" />',
					'<BaseButton @click="isCollapsed = !isCollapsed">Переключить панель</BaseButton>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSideBar, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SLOT_KEYS, 'isCollapsed', 'onUpdate:isCollapsed']), isCollapsed: ref(false) }),
		template: `
			<div style="display: flex; gap: 16px; height: 420px;">
				<BaseSideBar v-bind="props" v-model:is-collapsed="isCollapsed" />
				<div class="story-col">
					<BaseButton variant="outline" @click="isCollapsed = !isCollapsed">Переключить панель</BaseButton>
					<span class="story-label">isCollapsed: {{ isCollapsed }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('isCollapsed: false')).toBeVisible()
		await expect(canvas.getByRole('complementary')).not.toHaveClass('base-side-bar--collapsed')
	},
}
