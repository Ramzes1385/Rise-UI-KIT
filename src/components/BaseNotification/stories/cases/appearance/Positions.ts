import { ref } from 'vue'
import { remountOnArgs } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'
import { screen, waitFor, expect } from 'storybook/test'
import BaseNotification from '../../../ui/BaseNotification.vue'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'
import type { BaseNotificationExpose } from '../../../types/BaseNotification.types'

const template = `
	<BaseButton variant="outline" @click="showMore">Показать ещё</BaseButton>
	<BaseNotification ref="list" v-bind="args" />
`

const script = `
const list = ref<BaseNotificationExpose | null>(null)

function showMore(): void {
	list.value?.add({ type: 'info', title: 'Ещё одно уведомление', duration: 3000 })
}
`

export const Positions: StoryObj<typeof meta> = {
	args: { isContained: false, position: 'top-right' },
	parameters: {
		controls: { include: ['position', 'variant'] },
		docs: {
			description: {
				story: [
					'Позиция на экране — `position` (без `isContained`): контейнер закреплён в углу или у края экрана с отступом 16px.',
					'Меняйте значение в Controls; «Показать ещё» добавляет уведомление в стопку (исчезает через 3 секунды).',
				].join('\n'),
			},
			...docsFrame(240),
			source: storySource({
				template,
				imports: ['BaseNotification', 'BaseButton', 'type BaseNotificationExpose'],
				vue: ['ref'],
				script,
			}),
		},
	},
	render: args =>
		remountOnArgs(args, ['position', 'variant'], {
			components: { BaseNotification, BaseButton },
			setup: useStorySetup(args, {
				slots: [],
				setup: () => {
					const list = ref<BaseNotificationExpose | null>(null)
					const showMore = (): void => {
						list.value?.add({ type: 'info', title: 'Ещё одно уведомление', duration: 3000 })
					}
					return { list, showMore }
				},
			}),
			template,
		}),
	play: async () => {
		const item = await screen.findByRole('status')
		await waitFor(() => expect(item.getBoundingClientRect().right).toBeCloseTo(document.documentElement.clientWidth - 16, 0))
		await expect(item.getBoundingClientRect().top).toBeCloseTo(16, 0)
	},
}
