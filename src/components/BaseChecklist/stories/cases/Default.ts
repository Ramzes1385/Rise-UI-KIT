import { ref } from 'vue'
import type meta from '../BaseChecklist.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseChecklist from '../../ui/BaseChecklist.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { expect, waitFor, within } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Первые шаги с китом: отмечайте шаги флажками, кнопка действия шлёт `action`. Следующий шаг подсвечен.',
			},
		},
	},
	render: args => ({
		components: { BaseChecklist },
		setup: () => ({ props: useArgsWithoutSlots(args), completed: ref([...(args.completed ?? [])]) }),
		template: '<div style="max-width: 480px"><BaseChecklist v-bind="props" v-model:completed="completed" /></div>',
	}),
	play: async ({ canvas, userEvent, args }) => {
		const plugin = canvas.getByRole('checkbox', { name: 'Подключить плагин' })
		await expect(plugin).toHaveAccessibleDescription('app.use(RiseUiKit) и стили в main.ts Следующий шаг')
		await expect(canvas.getByRole('progressbar', { name: 'Выполнено шагов' })).toHaveAttribute('aria-valuetext', '1 из 4')
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть инструкцию' }))
		await expect(args.onAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'plugin' }))
		plugin.focus()
		await userEvent.keyboard(' ')
		await expect(plugin).toBeChecked()
		await waitFor(() => expect(canvas.getByRole('checkbox', { name: 'Выбрать тему' })).toHaveAccessibleDescription(/Следующий шаг$/))
		await expect(within(canvas.getByRole('group', { name: 'Первые шаги' })).getByText('2 из 4')).toBeInTheDocument()
	},
}
