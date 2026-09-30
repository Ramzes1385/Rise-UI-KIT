import { defineComponent } from 'vue'
import BaseApp from '../../ui/BaseApp.vue'
import type meta from '../BaseApp.stories'
import { BaseButton } from '@components/BaseButton'
import { useToast } from '@composables/app/useToast'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const EXPORT_DELAY = 1200

const reportExportTemplate = `
	<BaseButton variant="outline" @click="exportReport">Выгрузить отчёт</BaseButton>
`

const reportExportScript = `
const toast = useToast()

function exportReport(): void {
	const id = toast.add({ title: 'Готовим отчёт…', description: 'Собираем просмотры за сентябрь.', isPersistent: true })
	setTimeout(() => {
		toast.update(id, {
			type: 'success',
			title: 'Отчёт готов',
			description: 'Файл «Просмотры, сентябрь.xlsx» в загрузках.',
			isPersistent: false,
		})
	}, ${EXPORT_DELAY})
}
`

const ReportExport = defineComponent({
	components: { BaseButton },
	setup() {
		const toast = useToast()
		const exportReport = (): void => {
			const id = toast.add({ title: 'Готовим отчёт…', description: 'Собираем просмотры за сентябрь.', isPersistent: true })
			setTimeout(() => {
				toast.update(id, {
					type: 'success',
					title: 'Отчёт готов',
					description: 'Файл «Просмотры, сентябрь.xlsx» в загрузках.',
					isPersistent: false,
				})
			}, EXPORT_DELAY)
		}
		return { exportReport }
	},
	template: reportExportTemplate,
})

const template = `
	<BaseApp v-bind="args"><ReportExport /></BaseApp>
`

export const UpdateInPlace: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['toaster'] },
		docs: {
			description: {
				story: [
					'Обновление на месте: `add({ isPersistent: true })` показывает уведомление без автозакрытия, `update(id, …)`',
					'меняет его текст и тип. Автозакрытие начинается, когда `isPersistent` снят.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseApp'],
				components: {
					ReportExport: { template: reportExportTemplate, imports: ['BaseButton', 'useToast'], script: reportExportScript },
				},
			}),
		},
	},
	render: args => ({
		components: { BaseApp, ReportExport },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Выгрузить отчёт' }))
		const item = await screen.findByRole('status')
		await expect(item).toHaveTextContent('Готовим отчёт…')
		await expect(item.querySelector('.base-notification-item__progress')).toBeNull()

		await waitFor(() => expect(item).toHaveTextContent('Отчёт готов'))
		await expect(screen.getAllByRole('status')).toHaveLength(1)
		await expect(item.querySelector('.base-notification-item__progress')).not.toBeNull()
	},
}
