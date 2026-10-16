import { expect } from 'storybook/test'
import { SLOT_KEYS } from '../../shared'
import type meta from '../../BaseSideBar.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { isCollapsed: false }

const hidden = [...SLOT_KEYS, 'isCollapsed', 'onUpdate:isCollapsed']

const template = `
	<div style="display: flex; flex-wrap: wrap; gap: 16px;">
		<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed" style="height: 420px;" />
		<div class="story-col">
			<BaseButton variant="outline" @click="isCollapsed = !isCollapsed">Переключить панель</BaseButton>
			<span class="story-label">isCollapsed: {{ isCollapsed }}</span>
		</div>
	</div>
`

export const Controlled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Управляемый режим: `v-model:isCollapsed` связывает панель с состоянием приложения — например, с кнопкой в шапке',
					'страницы. Кнопка сворачивания внутри панели меняет то же значение.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSideBar', 'BaseButton'], state, omit: [...hidden, 'linkComponent'] }),
		},
	},
	render: args => ({
		components: { BaseSideBar, BaseButton },
		setup: useStorySetup(args, { state, slots: hidden }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('isCollapsed: false')).toBeVisible()
		await expect(canvas.getByRole('complementary')).not.toHaveClass('base-side-bar--collapsed')
	},
}
