import { ref } from 'vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseNotification from '../../../ui/BaseNotification.vue'
import type { BaseNotificationExpose } from '../../../types/BaseNotification.types'

export const AutoClose: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Автозакрытие: уведомление исчезает через `duration` (здесь 1,5 с), после последнего — событие `close`.',
			},
			source: {
				code: [
					"<BaseButton @click=\"notifications.add({ type: 'success', title: 'Ссылка скопирована', duration: 1500 })\">",
					'\tСкопировать ссылку',
					'</BaseButton>',
					'<BaseNotification ref="notifications" @close="onAllClosed" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseNotification, BaseButton },
		setup: () => {
			const list = ref<BaseNotificationExpose | null>(null)
			const show = () => list.value?.add({ type: 'success', title: 'Ссылка скопирована', duration: 1500 })
			return { props: useArgsWithoutSlots(args, ['title', 'description', 'type', 'duration']), list, show }
		},
		template: `
			<div class="story-stack">
				<div><BaseButton variant="outline" @click="show">Скопировать ссылку</BaseButton></div>
				<BaseNotification ref="list" v-bind="props" />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Скопировать ссылку' }))
		await expect(await canvas.findByRole('status')).toHaveTextContent('Ссылка скопирована')
		await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument(), { timeout: 4000 })
		await expect(args.onClose).toHaveBeenCalledOnce()
	},
}
