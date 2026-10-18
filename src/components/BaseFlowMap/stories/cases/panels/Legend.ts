import { expect, within } from 'storybook/test'
import { isCompact } from '../../scenarioShared'
import type meta from '../../BaseFlowMap.stories'
import { LEGEND_MAP } from '../../fixtures/legend'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap v-bind="args" :panels="['toolbar', 'legend']" />
`

export const Legend: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Легенда (мокап Main): образцы только тех видов узлов, видов связей и статусов, которые есть в данных, — «Клиент», «Шлюз», «Сервис», «Внешняя система», «Кеш», «База данных», «Очередь», «Вызов» (сплошная линия), «Событие» (пунктир) и статусы.',
					'Статус различим не только цветом: у каждого свой значок и подпись. Свой статус объявляется в `statuses` данных (`{ id, label, icon, color }`) и попадает в легенду сам — здесь Kafka на «Обслуживании». На узком экране легенда сворачивается в кнопку.',
					'Своё содержимое — слот `legend`, панель выключается без `legend` в `panels`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'] }),
		},
	},
	args: { data: LEGEND_MAP, height: '560px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		if (await isCompact(canvasElement)) {
			const toggle = canvas.getByRole('button', { name: /обозначения/ })
			await expect(toggle).toHaveAttribute('aria-expanded', 'false')
			await userEvent.click(toggle)
			await expect(toggle).toHaveAttribute('aria-expanded', 'true')
			await expect(within(canvas.getByRole('group', { name: 'Обозначения' })).getByText('Обслуживание')).toBeVisible()
			return
		}
		const legend = within(canvas.getByRole('group', { name: 'Обозначения' }))
		await expect(legend.getByText('Шлюз')).toBeVisible()
		await expect(legend.getByText('База данных')).toBeVisible()
		await expect(legend.getByText('Внешняя система')).toBeVisible()
		await expect(legend.getByText('Вызов')).toBeVisible()
		await expect(legend.getByText('Событие')).toBeVisible()
		await expect(legend.getByText('Задержки')).toBeVisible()
		await expect(legend.getByText('Обслуживание')).toBeVisible()
		await expect(legend.queryByText('Балансировщик')).toBeNull()
	},
}
