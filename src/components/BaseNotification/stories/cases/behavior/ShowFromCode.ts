import { ref } from 'vue'
import { TYPE_EXAMPLES } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'
import BaseNotification from '../../../ui/BaseNotification.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import type { BaseNotificationExpose, BaseNotificationProps } from '../../../types/BaseNotification.types'

const TYPE_LABELS: Record<string, string> = {
	success: 'Успех',
	error: 'Ошибка',
	warning: 'Предупреждение',
	info: 'Информация',
}

const examples = TYPE_EXAMPLES.map(notification => ({ label: TYPE_LABELS[notification.type ?? 'info'], notification }))

const OWN_ARGS = ['title', 'description', 'type', 'duration']

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton v-for="example in examples" :key="example.label" variant="outline" @click="show(example.notification)">
				{{ example.label }}
			</BaseButton>
		</div>
		<BaseNotification ref="list" v-bind="args" />
	</div>
`

const script = `
const examples: { label: string; notification: BaseNotificationProps }[] = ${literal(examples)}
const list = ref<BaseNotificationExpose | null>(null)

function show(notification: BaseNotificationProps): void {
	list.value?.add(notification)
}
`

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
			source: storySource({
				template,
				imports: ['BaseNotification', 'BaseButton', 'type BaseNotificationExpose', 'type BaseNotificationProps'],
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
			data: { examples },
			setup: () => {
				const list = ref<BaseNotificationExpose | null>(null)
				const show = (notification: BaseNotificationProps): void => {
					list.value?.add(notification)
				}
				return { list, show }
			},
		}),
		template,
	}),
}
