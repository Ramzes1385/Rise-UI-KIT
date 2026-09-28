import { ref } from 'vue'
import { TYPE_EXAMPLES } from '../shared'
import type meta from '../BaseNotification.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseNotification from '../../ui/BaseNotification.vue'
import type { BaseNotificationExpose, BaseNotificationProps, NOTIFICATION_TYPES } from '../../types/BaseNotification.types'

const TYPE_LABELS: Record<(typeof NOTIFICATION_TYPES)[number], string> = {
	success: 'Успех',
	error: 'Ошибка',
	warning: 'Предупреждение',
	info: 'Информация',
}

export const ShowFromCode: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'position', 'isContained'] },
		docs: {
			description: {
				story: [
					'Вызов из кода: `ref.add({ type, title, description, duration })` показывает уведомление, новое — сверху.',
					'Уведомления закрываются кнопкой или сами через 3 секунды. Без play-функции: story открывают e2e-тесты.',
				].join('\n'),
			},
			source: {
				code: [
					"<BaseButton @click=\"notifications.add({ type: 'success', title: 'Сохранено' })\">Показать</BaseButton>",
					'<BaseNotification ref="notifications" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseNotification, BaseButton },
		setup: () => {
			const list = ref<BaseNotificationExpose | null>(null)
			const show = (item: BaseNotificationProps) => list.value?.add(item)
			return {
				props: useArgsWithoutSlots(args, ['title', 'description', 'type', 'duration']),
				list,
				show,
				examples: TYPE_EXAMPLES,
				labels: TYPE_LABELS,
			}
		},
		template: `
			<div class="story-stack">
				<div class="story-row">
					<BaseButton v-for="item in examples" :key="item.type" variant="outline" @click="show(item)">
						{{ labels[item.type] }}
					</BaseButton>
				</div>
				<BaseNotification ref="list" v-bind="props" />
			</div>
		`,
	}),
}
