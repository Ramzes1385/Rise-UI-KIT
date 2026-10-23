import { computed, ref } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BasePopover } from '@components/BasePopover'
import { expect, waitFor, within } from 'storybook/test'
import type meta from '../BaseNotificationCenter.stories'
import { SAMPLE_NOTIFICATIONS } from '../sampleNotifications'
import BaseNotificationCenter from '../../ui/BaseNotificationCenter.vue'
import { literal, STORY_TODAY, staticStorySource } from '@/stories/helpers'

const now = STORY_TODAY

const template = `
	<div style="display: flex; align-items: flex-start; justify-content: center; min-height: 520px; max-width: 520px">
		<BasePopover position="bottom">
			<template #trigger>
				<BaseButton variant="ghost" :aria-label="unread ? 'Уведомления, новых: ' + unread : 'Уведомления'">
					<template #left><BaseIcon name="bell" /></template>
					<BaseBadge v-if="unread" :label="String(unread)" aria-hidden="true" />
				</BaseButton>
			</template>
			<div style="width: 320px; max-width: 100%">
				<BaseNotificationCenter v-model:items="items" variant="ghost" :now="now" :max-height="260" />
			</div>
		</BasePopover>
	</div>
`

const script = `
const now = ${literal(now)}
const items = ref<NotificationCenterItem[]>(${literal(SAMPLE_NOTIFICATIONS)})
const unread = computed(() => items.value.filter(item => !item.isRead).length)
`

export const InPopover: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Колокольчик в шапке: BaseButton с BaseBadge открывает BasePopover, в нём — центр уведомлений в варианте ghost.',
			},
			source: staticStorySource({
				template,
				imports: ['BaseNotificationCenter', 'BasePopover', 'BaseButton', 'BaseBadge', 'BaseIcon', 'type NotificationCenterItem'],
				vue: ['computed', 'ref'],
				script,
			}),
		},
		controls: { disable: true },
	},
	render: () => ({
		components: { BaseNotificationCenter, BasePopover, BaseButton, BaseBadge, BaseIcon },
		setup: () => {
			const items = ref(SAMPLE_NOTIFICATIONS)
			const unread = computed(() => items.value.filter(item => !item.isRead).length)
			return { items, unread, now }
		},
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Уведомления, новых: 3' }))
		const region = await within(canvasElement.ownerDocument.body).findByRole('region', { name: 'Уведомления' })
		await waitFor(() => expect(region).toBeVisible())
	},
}
