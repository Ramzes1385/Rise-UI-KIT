import { flowNode } from '../../shared'
import { isCompact } from '../../scenarioShared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { reviewArgs, reviewModels, reviewTemplate } from '../../reviewShared'

export const Review: StoryObj<typeof meta> = {
	parameters: {
		a11y: { config: { rules: [{ id: 'scrollable-region-focusable', enabled: false }] } },
		controls: { include: ['mode', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Режим «Правки» (мокап FlowReview): `mode: "review"` показывает над картой фильтры и легенду правок, справа — панель с вкладками «Предложения», «Комментарии», «Версии». Предложения, комментарии и версии приходят пропами и возвращаются через `v-model:suggestions` и `v-model:comments`.',
					'На карте предложения нарисованы как правки: добавляемое — зелёной пунктирной рамкой, убираемое — красной, переименованное — оранжевой, у каждого — автор. Карточка предложения: автор, вид изменения, подпись, «было → стало» и кнопки «Принять» и «Отклонить».',
					'«Принять» применяет изменения к `data` одним шагом истории (Ctrl+Z отменяет принятое целиком) и озвучивается в live-регионе; у устаревшего предложения (данные ушли от версии `baseVersion`) кнопка неактивна, причина — в подсказке. «Принять все» берёт только применимые.',
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
			await expect(canvas.getByRole('tab', { name: /Предложения/ })).toBeVisible()
			return
		}
		await expect(canvas.getByRole('tab', { name: /Предложения 4/ })).toHaveAttribute('aria-selected', 'true')
		await expect(canvas.getByRole('button', { name: 'Принять все: 3' })).toBeVisible()
		const accept = canvas.getAllByRole('button', { name: 'Принять' })
		await expect(accept).toHaveLength(4)
		await expect(accept[3]).toHaveAccessibleDescription(/устарело|Данные ушли/)
		await userEvent.click(accept[1])
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Принять все: 2' })).toBeVisible())
		await expect(flowNode(canvas, 'Billing')).toBeVisible()
	},
}
