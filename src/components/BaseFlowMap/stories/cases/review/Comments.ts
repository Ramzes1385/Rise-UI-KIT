import { isCompact } from '../../scenarioShared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { reviewArgs, reviewModels, reviewTemplate } from '../../reviewShared'

export const Comments: StoryObj<typeof meta> = {
	parameters: {
		a11y: { config: { rules: [{ id: 'scrollable-region-focusable', enabled: false }] } },
		controls: { include: ['mode', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Комментарии к элементам карты: цепочка привязана к узлу, связи или группе (`target`) либо к точке холста (`point`). На карте — булавка с инициалами автора и числом комментариев; непрочитанная цепочка пульсирует (при reduced motion — без пульса).',
					'Вкладка «Комментарии» — список цепочек в формате BaseCommentThread: ответы вложены, «Решено» скрывает цепочку (решённые возвращает переключатель «Показывать решённые»), «Показать» вписывает элемент в экран. Изменения идут через `v-model:comments`.',
					'Правило axe `scrollable-region-focusable` у истории выключено: на узком экране легенда правок (`.base-flow-map__review-legend`) прокручивается горизонтально, но не фокусируется с клавиатуры — это дефект ядра, записка в inbox.',
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
	play: async ({ canvas, canvasElement, userEvent }) => {
		if (await isCompact(canvasElement)) {
			await expect(canvas.getByRole('tab', { name: /Комментарии/ })).toBeVisible()
			return
		}
		await userEvent.click(canvas.getByRole('tab', { name: /Комментарии/ }))
		await waitFor(() => expect(canvas.getByRole('tab', { name: /Комментарии/ })).toHaveAttribute('aria-selected', 'true'))
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Решено' })).toHaveLength(2))
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Вернуть' })).toBeVisible())
		await userEvent.click(canvas.getAllByRole('button', { name: 'Решено' })[0])
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Решено' })).toHaveLength(1))
	},
}
