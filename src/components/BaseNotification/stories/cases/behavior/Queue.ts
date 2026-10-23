import { ref } from 'vue'
import { STORY_DURATION } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseNotification from '../../../ui/BaseNotification.vue'
import type { BaseNotificationExpose } from '../../../types/BaseNotification.types'

const OWN_ARGS = ['title', 'description', 'type', 'duration']

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="addNext">Добавить уведомление</BaseButton>
			<BaseButton variant="outline" @click="reportProgress">Обновить по ключу</BaseButton>
		</div>
		<BaseNotification ref="list" v-bind="args" />
	</div>
`

const script = `
const list = ref<BaseNotificationExpose | null>(null)
const counter = ref(0)
const progress = ref(0)

function addNext(): void {
	counter.value += 1
	list.value?.add({ title: 'Уведомление ' + counter.value, duration: ${STORY_DURATION} })
}

function reportProgress(): void {
	progress.value += 25
	list.value?.add({ notificationKey: 'upload', title: 'Загрузка видео: ' + progress.value + '%', duration: ${STORY_DURATION} })
}
`

export const Queue: StoryObj<typeof meta> = {
	args: { maxVisible: 2, position: 'top-right' },
	parameters: {
		controls: { include: ['maxVisible', 'position', 'variant'] },
		docs: {
			description: {
				story: [
					'Очередь и обновление на месте. `maxVisible` задаёт, сколько уведомлений видно на одной позиции: остальные ждут',
					'и появляются, когда видимое закрывается; таймер ожидающего стартует с появления. «Обновить по ключу» вызывает',
					'`add()` с одним и тем же `notificationKey`: уведомление меняется на месте, а не дублируется, таймер начинается заново.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseNotification', 'BaseButton', 'type BaseNotificationExpose'],
				vue: ['ref'],
				script,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseNotification, BaseButton },
		setup: useStorySetup(args, {
			slots: OWN_ARGS,
			setup: () => {
				const list = ref<BaseNotificationExpose | null>(null)
				const counter = ref(0)
				const progress = ref(0)
				const addNext = (): void => {
					counter.value += 1
					list.value?.add({ title: 'Уведомление ' + counter.value, duration: STORY_DURATION })
				}
				const reportProgress = (): void => {
					progress.value += 25
					list.value?.add({
						notificationKey: 'upload',
						title: 'Загрузка видео: ' + progress.value + '%',
						duration: STORY_DURATION,
					})
				}
				return { list, addNext, reportProgress }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const update = await canvas.findByRole('button', { name: 'Обновить по ключу' })
		await userEvent.click(update)
		await userEvent.click(update)
		await waitFor(() => expect(canvas.getAllByRole('status')).toHaveLength(1))
		await expect(canvas.getByText('Загрузка видео: 50%')).toBeInTheDocument()

		const add = canvas.getByRole('button', { name: 'Добавить уведомление' })
		await userEvent.click(add)
		await userEvent.click(add)
		await userEvent.click(add)
		await waitFor(() => expect(canvas.getAllByRole('status')).toHaveLength(2))
		await expect(canvas.queryByText('Уведомление 2')).not.toBeInTheDocument()

		await userEvent.click(canvas.getAllByRole('button', { name: 'Закрыть' })[0])
		await waitFor(() => expect(canvas.getByText('Уведомление 2')).toBeInTheDocument())
	},
}
