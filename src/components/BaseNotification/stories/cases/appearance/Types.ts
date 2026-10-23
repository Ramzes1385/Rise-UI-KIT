import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseNotification from '../../../ui/BaseNotification.vue'
import { LIST_OWN_ARGS, LIST_TEMPLATE, listScript, listSetup, TYPE_EXAMPLES, withStoryDuration } from '../../shared'

const items = withStoryDuration(TYPE_EXAMPLES)

export const Types: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: 'Четыре типа: цвет иконки и полосы прогресса. Ошибка объявляется скринридером сразу (`alert`), остальные — `status`.',
			},
			source: storySource({
				template: LIST_TEMPLATE,
				imports: ['BaseNotification', 'type BaseNotificationExpose', 'type BaseNotificationProps'],
				vue: ['onMounted', 'ref'],
				script: listScript(items),
				omit: LIST_OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseNotification },
		setup: useStorySetup(args, { slots: LIST_OWN_ARGS, setup: () => listSetup(items) }),
		template: LIST_TEMPLATE,
	}),
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('alert')).toHaveTextContent('Не удалось загрузить видео')
		await expect(canvas.getAllByRole('status')).toHaveLength(3)
	},
}
