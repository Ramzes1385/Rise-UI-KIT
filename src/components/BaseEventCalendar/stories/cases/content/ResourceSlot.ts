import { models } from '../../render'
import { expect } from 'storybook/test'
import { BaseAvatar } from '@components/BaseAvatar'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'
import BaseEventCalendar from '../../../ui/BaseEventCalendar.vue'
import type { EventCalendarResource } from '../../../types/BaseEventCalendar.types'
import { STORY_USERS, literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseEventCalendar v-bind="args" v-model:view="view" v-model:date="date" :resources="people">
		<template #resource="{ resource }">
			<span class="story-row">
				<BaseAvatar :src="avatars[resource.id]" :name="resource.title" :size-scale="60" />
				{{ resource.title }}
			</span>
		</template>
		<template #resource-oleg="{ resource, days }">{{ resource.title }} — дежурный, {{ days.length }} дн.</template>
	</BaseEventCalendar>
`

const users = STORY_USERS.slice(0, 4)
const people: EventCalendarResource[] = users.map(user => ({ id: user.email.split('@')[0], title: user.name }))
const avatars: Record<string, string> = Object.fromEntries(users.map(user => [user.email.split('@')[0], user.avatar]))
const events = [
	{ id: 'design', title: 'Макеты профиля', start: '2026-10-02T10:00', end: '2026-10-02T12:00', resourceId: 'anna' },
	{ id: 'api', title: 'API платежей', start: '2026-10-02T11:00', end: '2026-10-02T13:30', resourceId: 'ivan' },
	{ id: 'sprint', title: 'Планирование спринта', start: '2026-10-02T14:00', end: '2026-10-02T15:00', resourceId: 'maria' },
	{ id: 'duty', title: 'Дежурство', start: '2026-10-02', allDay: true, resourceId: 'oleg' },
]

const script = `
const people: EventCalendarResource[] = ${literal(people)}

const avatars: Record<string, string> = ${literal(Object.fromEntries(Object.keys(avatars).map(id => [id, 'data:image/svg+xml,…'])))}
`

export const ResourceSlot: StoryObj<typeof meta> = {
	args: { view: 'day', events },
	parameters: {
		docs: {
			description: {
				story: [
					'Ресурсы-сотрудники и слоты заголовка ресурса: `resource` — заголовок любого ресурса (здесь аватар и имя),',
					'`resource-<id>` — одного ресурса, он важнее `resource`. Данные слота — `{ resource, days }`: ресурс и его дни',
					'в показанном периоде.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAvatar', 'BaseEventCalendar', 'type EventCalendarResource'],
				models,
				script,
			}),
		},
	},
	render: args => ({
		components: { BaseAvatar, BaseEventCalendar },
		setup: useStorySetup(args, { models, slots: [], data: { people, avatars } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Олег Соколов — дежурный, 1 дн.')).toBeVisible()
		await expect(canvas.getByText('Анна Смирнова')).toBeVisible()
		await expect(canvas.getByRole('button', { name: /^API платежей, .*Иван Петров$/ })).toBeVisible()
	},
}
