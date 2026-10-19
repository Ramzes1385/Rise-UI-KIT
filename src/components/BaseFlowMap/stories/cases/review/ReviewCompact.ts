import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { reviewArgs, reviewModels } from '../../reviewShared'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="width: 375px; max-width: 100%">
		<BaseFlowMap v-bind="args" v-model:data="data" v-model:suggestions="suggestions" v-model:comments="comments" />
	</div>
`

export const ReviewCompact: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['compactBreakpoint', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'«Правки» на 375 px (мокап FlowMobile): область уже `compactBreakpoint`, поэтому карта остаётся сверху, а панель правок встаёт под ней листом со своей прокруткой: вкладки «Предложения», «Комментарии», «Версии» и карточки предложений. Фильтры «Авторы / Показывать» и легенда правок — двумя строками над картой, вкладок и подписей легенды карты они не закрывают.',
					'Булавки комментариев и кнопки панели — не меньше 40 px под палец.',
					'Булавки комментариев (`.base-flow-map__review-pin`) стоят в координатах холста и в RTL не зеркалятся — так задумано: точка привязки к схеме не должна уезжать от узла. Строки «было → стало», полоса сравнения и легенда в RTL зеркалятся.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'], models: reviewModels }),
		},
	},
	args: { ...reviewArgs, height: '640px' },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { models: reviewModels }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvas.getByRole('region', { name: 'Оформление заказа' })).toHaveClass('base-flow-map--compact'))
		const area = canvasElement.querySelector('.base-flow-map__viewport')!.getBoundingClientRect()
		const tab = canvas.getByRole('tab', { name: /Предложения/ })
		await expect(tab.getBoundingClientRect().top).toBeGreaterThanOrEqual(area.bottom - 1)
		const filters = canvas.getByRole('toolbar', { name: 'Фильтры правок' }).getBoundingClientRect()
		const legend = canvas.getByRole('list', { name: 'Легенда правок' }).getBoundingClientRect()
		await expect(legend.top).toBeGreaterThanOrEqual(filters.bottom - 1)
		await userEvent.click(canvas.getByRole('tab', { name: /Комментарии/ }))
		await waitFor(() => expect(canvas.getByRole('tab', { name: /Комментарии/ })).toHaveAttribute('aria-selected', 'true'))
	},
}
