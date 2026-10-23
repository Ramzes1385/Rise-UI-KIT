import { defineComponent } from 'vue'
import BaseApp from '../../../ui/BaseApp.vue'
import type meta from '../../BaseApp.stories'
import { BaseButton } from '@components/BaseButton'
import { useToast } from '@composables/app/useToast'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { expect, screen, waitFor, within } from 'storybook/test'

const connectionTemplate = `
	<BaseButton variant="outline" @click="notify">Сохранить и проверить связь</BaseButton>
`

const connectionScript = `
const toast = useToast()

function notify(): void {
	toast.add({ title: 'Черновик сохранён', type: 'success' })
	toast.add({
		title: 'Нет связи с сервером',
		description: 'Повторим через минуту.',
		type: 'warning',
		position: 'bottom-left',
		sizeScale: 90,
		duration: 8000,
		customClass: 'story-toast-offline',
	})
}
`

const Connection = defineComponent({
	components: { BaseButton },
	setup() {
		const toast = useToast()
		const notify = (): void => {
			toast.add({ title: 'Черновик сохранён', type: 'success' })
			toast.add({
				title: 'Нет связи с сервером',
				description: 'Повторим через минуту.',
				type: 'warning',
				position: 'bottom-left',
				sizeScale: 90,
				duration: 8000,
				customClass: 'story-toast-offline',
			})
		}
		return { notify }
	},
	template: connectionTemplate,
})

const template = `
	<BaseApp v-bind="args"><Connection /></BaseApp>
`

export const ToastOptions: StoryObj<typeof meta> = {
	name: 'Параметры уведомления',
	parameters: {
		controls: { include: ['toaster'] },
		docs: {
			description: {
				story: [
					'`position`, `sizeScale`, `color` и `customClass` в `toast.add()` оформляют только это уведомление, остальные берут настройки',
					'`toaster`. Уведомления с разными углами лежат в отдельных областях: у каждой область-имя с положением, например «Уведомления:',
					'внизу слева».',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseApp'],
				components: {
					Connection: { template: connectionTemplate, imports: ['BaseButton', 'useToast'], script: connectionScript },
				},
			}),
		},
	},
	render: args => ({
		components: { BaseApp, Connection },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сохранить и проверить связь' }))

		const corner = await screen.findByRole('region', { name: 'Уведомления: внизу слева' })
		await waitFor(() => expect(within(corner).getByText('Нет связи с сервером')).toBeVisible())
		await waitFor(() => expect(corner.querySelector('.base-notification-item')).toHaveClass('story-toast-offline'))

		const common = screen.getByRole('region', { name: 'Уведомления: вверху справа' })
		await waitFor(() => expect(within(common).getByText('Черновик сохранён')).toBeVisible())
		await expect(common.querySelector('.base-notification-item')).not.toHaveClass('story-toast-offline')
	},
}
