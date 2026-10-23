import type { Component } from 'vue'
import { literal } from '@/stories/helpers'
import { computed, onMounted, ref } from 'vue'
import type { BaseNotificationExpose, BaseNotificationProps } from '../types/BaseNotification.types'

export const STORY_DURATION = 600_000

export const TYPE_EXAMPLES: BaseNotificationProps[] = [
	{ type: 'success', title: 'Серия опубликована', description: 'Серия 3 доступна подписчикам сообщества.' },
	{ type: 'error', title: 'Не удалось загрузить видео', description: 'Файл больше 4 ГБ. Сожмите его или загрузите по частям.' },
	{ type: 'warning', title: 'Заканчивается место', description: 'Занято 4,6 из 5 ГБ хранилища.' },
	{ type: 'info', title: 'Доступно обновление', description: 'Новая версия редактора субтитров вышла сегодня.' },
]

export const LIST_OWN_ARGS = ['title', 'description', 'type']

export const LIST_TEMPLATE = `
	<BaseNotification ref="list" v-bind="args" />
`

export const withStoryDuration = (items: BaseNotificationProps[]): BaseNotificationProps[] =>
	items.map(item => ({ ...item, duration: STORY_DURATION }))

export const listScript = (items: BaseNotificationProps[]): string => `
const list = ref<BaseNotificationExpose | null>(null)
const items: BaseNotificationProps[] = ${literal(items)}

onMounted(() => [...items].reverse().forEach(item => list.value?.add(item)))
`

export function listSetup(items: BaseNotificationProps[]): Record<string, unknown> {
	const list = ref<BaseNotificationExpose | null>(null)
	onMounted(() => [...items].reverse().forEach(item => list.value?.add(item)))
	return { list }
}

export function remountOnArgs(args: object, keys: readonly string[] | null, story: Component) {
	return {
		components: { Story: story },
		setup: () => ({
			key: computed(() =>
				JSON.stringify(
					Object.entries(args).filter(([name, value]) => typeof value !== 'function' && (!keys || keys.includes(name))),
				),
			),
		}),
		template: '<Story :key="key" />',
	}
}
