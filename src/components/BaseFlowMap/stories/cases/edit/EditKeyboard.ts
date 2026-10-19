import type meta from '../../BaseFlowMap.stories'
import { MAIN_MAP } from '../../fixtures/services'
import { flowNode, flowNodes } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'
import { editArgs, isNarrowMap, editModels, editNotices, editTemplate, expectStatus } from '../../editShared'

export const EditKeyboard: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['mode', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'«Правка» с клавиатуры: всё, что делает мышь, доступно клавишами; нажатие в поле ввода (подпись, поиск в палитре) не перехватывается, если в нём нет Ctrl или Alt. Справка по клавишам — кнопка на панели или `?`.',
					'Инструменты: `V` выбор, `H` рука, `C` соединить выбранный узел с другим (список целей, недопустимые неактивны с причиной), `N` узел по умолчанию нотации, `T` заметка, `G` группа из выделенного, `Esc` — снять инструмент, затем выделение.',
					'Действия: `Delete` / `Backspace` удалить, `Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y` отменить и повторить, `Ctrl+C` / `X` / `V` / `D` копировать, вырезать, вставить, дублировать, `Ctrl+A` выделить всё, `F2` подпись на месте, стрелки с `Shift` — сдвиг на шаг сетки, с `Shift+Alt` — на 1 px, `Пробел` выделяет элемент в фокусе, `+`, `-`, `0` — масштаб и вписать.',
					'Каждое действие озвучивается в live-регионе; отмена и повтор показывают уведомление «Отменено: … · Ctrl Z».',
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
		if (isNarrowMap(canvasElement)) return
		await userEvent.click(flowNode(canvas, 'Orders'))
		await expectStatus(canvas, 'Выделено: 1')
		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
		await expectStatus(canvas, 'Изменений: 1')
		await userEvent.keyboard('{Control>}z{/Control}')
		await waitFor(() => expect(editNotices(canvas)).toHaveTextContent(/Отменено: .* · Ctrl Z/))
		await expectStatus(canvas, 'Изменений: 0')
		await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
		await waitFor(() => expect(editNotices(canvas)).toHaveTextContent(/Повторено: /))
		await userEvent.keyboard('{Control>}z{/Control}')
		await userEvent.keyboard('h')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Рука, H' })).toHaveAttribute('aria-pressed', 'true'))
		await userEvent.keyboard('v')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Выделение, V' })).toHaveAttribute('aria-pressed', 'true'))
		await userEvent.keyboard('{Delete}')
		await waitFor(() => expect(flowNodes(canvas)).toHaveLength(11))
		await userEvent.click(canvas.getByRole('button', { name: 'Отменить, Ctrl+Z' }))
		await waitFor(() => expect(flowNodes(canvas)).toHaveLength(12))
		await userEvent.click(flowNode(canvas, 'Orders'))
		await userEvent.keyboard('?')
		await waitFor(() => expect(screen.getByText('Сдвиг на шаг сетки, с Alt — на 1 px')).toBeVisible())
		await userEvent.keyboard('?')
		await waitFor(() => expect(screen.queryByText('Сдвиг на шаг сетки, с Alt — на 1 px')).toBeNull())
	},
}
