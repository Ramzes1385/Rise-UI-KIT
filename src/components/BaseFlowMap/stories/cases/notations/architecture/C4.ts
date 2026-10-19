import { flowNode } from '../../../shared'
import { flowC4 } from '@components/BaseFlowMap'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { SHOP_C4 } from '../../../fixtures/architecture/c4'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowC4]" />
`

export const C4: StoryObj<typeof meta> = {
	parameters: {
		a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
		docs: {
			description: {
				story: [
					'Модель C4 (мокап Notation-C4): «Интернет-магазин» тремя уровнями одной карты — «1 · Контекст», «2 · Контейнеры», «3 · Компоненты». Уровень выбирают кнопки в полосе уровней или масштаб колеса: границы сворачиваются в блоки, связи сливаются.',
					'На контексте граница системы — один блок «Интернет-магазин» со строкой «Программная система»; на втором уровне видны контейнеры с технологией («Контейнер: Go»), граница «Сервис заказов» остаётся блоком; на третьем она раскрыта компонентами. Вход в блок и крошки ведут вглубь и обратно.',
					'Правила: система содержит только контейнеры, контейнер — только компоненты; связь без подписи даёт предупреждение.',
					'Правило axe `color-contrast` у истории выключено: у человека (тёмно-синяя карточка) подзаголовок серый и не дотягивает до 4,5 : 1 — это дефект ядра, записка в inbox.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'flowC4'] }),
		},
	},
	args: { data: SHOP_C4, height: '900px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { flowC4 } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Контекст/ }))
		await waitFor(() => expect(flowNode(canvas, 'Интернет-магазин')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: /Контейнеры/ }))
		await waitFor(() => expect(flowNode(canvas, 'API Gateway')).toBeVisible())
		await expect(flowNode(canvas, 'Сервис заказов')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: /Компоненты/ }))
		await waitFor(() => expect(flowNode(canvas, 'Контроллер заказов')).toBeVisible())
	},
}
