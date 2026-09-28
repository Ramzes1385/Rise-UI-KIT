import { ref, onMounted } from 'vue'
import type meta from './BaseNotification.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseNotification from '../ui/BaseNotification.vue'
import type { BaseNotificationProps, BaseNotificationExpose } from '../types/BaseNotification.types'

export const STORY_DURATION = 600_000

export const TYPE_EXAMPLES: BaseNotificationProps[] = [
	{ type: 'success', title: 'Серия опубликована', description: 'Серия 3 доступна подписчикам сообщества.' },
	{ type: 'error', title: 'Не удалось загрузить видео', description: 'Файл больше 4 ГБ. Сожмите его или загрузите по частям.' },
	{ type: 'warning', title: 'Заканчивается место', description: 'Занято 4,6 из 5 ГБ хранилища.' },
	{ type: 'info', title: 'Доступно обновление', description: 'Новая версия редактора субтитров вышла сегодня.' },
]

export function listRender(items: BaseNotificationProps[]): StoryObj<typeof meta>['render'] {
	return args => ({
		components: { BaseNotification },
		setup: () => {
			const list = ref<BaseNotificationExpose | null>(null)
			onMounted(() => [...items].reverse().forEach(item => list.value?.add({ duration: STORY_DURATION, ...item })))
			return { props: useArgsWithoutSlots(args, ['title', 'description', 'type']), list }
		},
		template: '<BaseNotification ref="list" v-bind="props" />',
	})
}
