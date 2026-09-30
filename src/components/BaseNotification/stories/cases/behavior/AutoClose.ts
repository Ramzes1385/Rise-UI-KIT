import { ref } from 'vue'
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
		<div><BaseButton variant="outline" @click="show">Скопировать ссылку</BaseButton></div>
		<BaseNotification ref="list" v-bind="args" />
	</div>
`

const script = `
const list = ref<BaseNotificationExpose | null>(null)

function show(): void {
	list.value?.add({ type: 'success', title: 'Ссылка скопирована', duration: 1500 })
}
`

export const AutoClose: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Автозакрытие: уведомление исчезает через `duration` (здесь 1,5 с), после последнего — событие `close`.',
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
				const show = (): void => {
					list.value?.add({ type: 'success', title: 'Ссылка скопирована', duration: 1500 })
				}
				return { list, show }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Скопировать ссылку' }))
		await expect(await canvas.findByRole('status')).toHaveTextContent('Ссылка скопирована')
		await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument(), { timeout: 4000 })
		await expect(args.onClose).toHaveBeenCalledOnce()
	},
}
