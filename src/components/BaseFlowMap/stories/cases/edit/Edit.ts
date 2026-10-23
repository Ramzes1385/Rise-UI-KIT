import { flowNode } from '../../shared'
import type meta from '../../BaseFlowMap.stories'
import { MAIN_MAP } from '../../fixtures/services'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'
import { editArgs, isNarrowMap, expectEditCompact, editModels, editTemplate, expectStatus } from './editShared'

export const Edit: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['mode', 'modes', 'isDisabled', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Режим «Правка» (мокап FlowEditor): `mode: "edit"` превращает карту в редактор. Сверху по центру — инструменты (выбор `V`, рука `H`, связь `C`, узел `N`, заметка `T`, группа `G`), отмена и повтор, история изменений, раскладка, сетка и привязка; слева — палитра видов нотации; справа — панель свойств с вкладками «Свойства · Стиль · Данные · Хуки»; внизу — строка состояния и проверка правил нотации.',
					'Правка идёт командами: перемещение с привязкой и направляющими, соединение за порт, подпись на месте (F2 или двойной щелчок), копирование, группировка. Каждое действие — один шаг истории (Ctrl+Z / Ctrl+Shift+Z), отказ правила нотации или хука приходит уведомлением «Нельзя: …» и озвучивается. Изменённые данные возвращает `v-model:data`.',
					'Панели карты в режиме `edit` скрыты сами, как на мокапе: легенда и мини-карта вне compact не показываются, панель уровней стоит ниже панели инструментов. «Готово» в шапке возвращает режим «Просмотр» (`v-model:mode`). Compact включается, когда ширина корня за вычетом боковых панелей «Правки» (564 px) меньше `compactBreakpoint` (640), то есть при корне уже 1204 px: тогда «Правка» сводится к свойствам элемента в BaseDrawer — см. `EditCompact`.',
				].join('\n'),
			},
			source: storySource({ template: editTemplate, imports: ['BaseFlowMap'], models: editModels }),
		},
	},
	args: { ...editArgs, data: MAIN_MAP },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { models: editModels }),
		template: editTemplate,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		if (isNarrowMap(canvasElement)) return expectEditCompact({ canvas, canvasElement, userEvent })
		await expect(await canvas.findByRole('toolbar', { name: 'Инструменты правки' })).toBeVisible()
		await expect(canvas.getByRole('complementary', { name: 'Палитра элементов' })).toBeVisible()
		await expectStatus(canvas, /Выделено: 0.*Узлов: 12 · связей: 11/)
		await userEvent.click(flowNode(canvas, 'Orders'))
		await expectStatus(canvas, 'Выделено: 1')
		const inspector = await canvas.findByRole('region', { name: 'Свойства и хуки' })
		for (const tab of ['Свойства', 'Стиль', 'Данные', 'Хуки']) {
			await expect(await within(inspector).findByRole('tab', { name: tab })).toBeVisible()
		}
		await userEvent.click(canvas.getAllByRole('button', { name: /^Добавить: / })[0])
		await expectStatus(canvas, /Изменений: 1.*Узлов: 13/)
		await userEvent.click(canvas.getByRole('button', { name: 'Отменить, Ctrl+Z' }))
		await expectStatus(canvas, /Изменений: 0.*Узлов: 12/)
		await userEvent.click(canvas.getByRole('button', { name: 'Готово' }))
		await waitFor(() => expect(canvas.queryByRole('toolbar', { name: 'Инструменты правки' })).toBeNull())
		const modes = canvas.getByRole('group', { name: 'Режим карты' })
		await expect(within(modes).getByRole('button', { name: 'Просмотр' })).toHaveAttribute('aria-pressed', 'true')
		await userEvent.click(within(modes).getByRole('button', { name: 'Правка' }))
		await waitFor(() => expect(canvas.getByRole('toolbar', { name: 'Инструменты правки' })).toBeVisible())
	},
}
