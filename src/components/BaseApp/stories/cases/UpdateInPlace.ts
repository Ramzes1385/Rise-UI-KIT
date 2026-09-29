import { defineComponent } from 'vue'
import BaseApp from '../../ui/BaseApp.vue'
import type meta from '../BaseApp.stories'
import { BaseButton } from '@components/BaseButton'
import { useToast } from '@composables/app/useToast'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, waitFor } from 'storybook/test'

const ReportExport = defineComponent({
	components: { BaseButton },
	setup() {
		const toast = useToast()
		function exportReport() {
			const id = toast.add({ title: 'Готовим отчёт…', description: 'Собираем просмотры за сентябрь.', isPersistent: true })
			setTimeout(() => {
				toast.update(id, {
					type: 'success',
					title: 'Отчёт готов',
					description: 'Файл «Просмотры, сентябрь.xlsx» в загрузках.',
					isPersistent: false,
				})
			}, 1200)
		}
		return { exportReport }
	},
	template: '<BaseButton variant="outline" @click="exportReport">Выгрузить отчёт</BaseButton>',
})

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
			source: {
				code: [
					'const toast = useToast()',
					"const id = toast.add({ title: 'Готовим отчёт…', isPersistent: true })",
					'await api.exportReport()',
					"toast.update(id, { type: 'success', title: 'Отчёт готов', isPersistent: false })",
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseApp, ReportExport },
		setup: () => ({ args }),
		template: '<BaseApp v-bind="args"><ReportExport /></BaseApp>',
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
