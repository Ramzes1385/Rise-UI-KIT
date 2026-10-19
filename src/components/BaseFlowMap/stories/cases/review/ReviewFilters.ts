import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { reviewArgs, reviewModels, reviewTemplate } from '../../reviewShared'

export const ReviewFilters: StoryObj<typeof meta> = {
	parameters: {
		a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
		controls: { include: ['mode', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Фильтры правок над картой: «Авторы» — кнопки с аватарами (нажатая показывает автора, «{имя} — скрыт» убирает его предложения и комментарии с карты и из панели), «Показывать» — «Всё», «Только мои» (автор `currentUser`) и «Неразрешённые», переключатель «Только изменения» приглушает всё, кроме затронутого правками.',
					'Фильтры меняют только показ: данные, предложения и счётчики вкладок не меняются.',
					'Правило axe `color-contrast` у истории выключено: принятое предложение рисуется приглушённым, и у его автора и времени контраст ниже 4,5 : 1 — это дефект ядра, записка в inbox.',
				].join('\n'),
			},
			source: storySource({ template: reviewTemplate, imports: ['BaseFlowMap'], models: reviewModels }),
		},
	},
	args: reviewArgs,
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { models: reviewModels }),
		template: reviewTemplate,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('radio', { name: 'Только мои' }))
		await waitFor(() => expect(canvas.queryByRole('button', { name: 'Уточнить подпись Notifications' })).toBeNull())
		await expect(canvas.getByRole('button', { name: 'Переименовать Payments в Billing' })).toBeVisible()
		await userEvent.click(canvas.getByRole('radio', { name: 'Всё' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Иван — показан' }))
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Иван — скрыт' })).toHaveAttribute('aria-pressed', 'false'))
		await waitFor(() => expect(canvas.queryByRole('button', { name: 'Добавить кеш каталога' })).toBeNull())
	},
}
