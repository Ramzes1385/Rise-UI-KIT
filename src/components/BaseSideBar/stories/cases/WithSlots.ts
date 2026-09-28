import { expect } from 'storybook/test'
import type meta from '../BaseSideBar.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseSideBar from '../../ui/BaseSideBar.vue'
import { BaseAvatar } from '@components/BaseAvatar'
import type { StoryObj } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'
import { BASIC_ITEMS, SLOT_KEYS, USER, FRAME_STYLE, PROFILE_FOOTER } from '../shared'

export const WithSlots: StoryObj<typeof meta> = {
	args: { items: BASIC_ITEMS, activePath: '/inbox' },
	parameters: {
		docs: {
			description: {
				story: [
					'Слоты панели: `header` заменяет заголовок, слот по умолчанию — тело под навигацией, `footer` — подвал,',
					'`collapsedContent` — содержимое свёрнутой панели.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseSideBar :items="items">',
					'  <template #header>…логотип и название…</template>',
					'  Свободное место: 2,4 ГБ из 10 ГБ',
					'  <template #footer>…профиль…</template>',
					'</BaseSideBar>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg('isCollapsed')
		return {
			components: { BaseSideBar, BaseAvatar, BaseIcon },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate, user: USER, frameStyle: FRAME_STYLE }),
			template: `
				<div :style="frameStyle">
					<BaseSideBar v-bind="props" @update:is-collapsed="onUpdate">
						<template #header>
							<div class="story-row" style="flex-wrap: nowrap; gap: 8px;">
								<BaseIcon name="star" />
								<strong>Rise Studio</strong>
							</div>
						</template>
						Свободное место: 2,4 ГБ из 10 ГБ
						${PROFILE_FOOTER}
					</BaseSideBar>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Rise Studio')).toBeVisible()
		await expect(canvas.getByText('Свободное место: 2,4 ГБ из 10 ГБ')).toBeVisible()
	},
}
