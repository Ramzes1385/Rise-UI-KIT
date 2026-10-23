import { flowNode } from '../../shared'
import { setup } from './setup/EditHooks.setup'
import type meta from '../../BaseFlowMap.stories'
import { MAIN_MAP } from '../../fixtures/services'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import setupSource from './setup/EditHooks.setup.ts?raw'
import { expect, screen, waitFor, within } from 'storybook/test'
import { scriptImports, scriptSource, storySource, useStorySetup } from '@/stories/helpers'
import { editArgs, isNarrowMap, expectEditCompact, editNotices, expectStatus } from './editShared'

const kit = scriptImports(setupSource, { imports: ['BaseFlowMap', 'BaseButton'] })
const models = { data: 'data', mode: 'mode' }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" :is-disabled="!request" @click="answer(true)">Одобрить</BaseButton>
			<BaseButton variant="outline" :is-disabled="!request" @click="answer(false)">Отклонить</BaseButton>
			<p class="story-label" role="status">{{ request ? 'Приложение решает: ' + request.label : 'Запросов нет' }}</p>
		</div>
		<BaseFlowMap v-bind="args" v-model:data="data" v-model:mode="mode" :before-delete="guardDelete" :before-connect="approveConnect" />
	</div>
`

export const EditHooks: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['mode', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Хуки «Правки»: приложение вмешивается в команды до того, как они изменят данные. Хук — проп (`beforeDelete`, `beforeConnect`, `beforeCreate`, `beforeEditLabel`, `beforeChange`) или `controller.on(name, handler, { priority })`; `false` отменяет, объект подменяет результат, `Promise` заставляет карту ждать.',
					'Здесь `beforeDelete` не даёт удалить «Банк»: узел остаётся выделенным, внизу появляется уведомление «Нельзя: Отменено обработчиком «beforeDelete»», причину озвучивает live-регион, событие `reject` содержит `by: "hook"`. `beforeConnect` асинхронный: пока приложение думает, команда не применена (при соединении перетаскиванием за порт или клавишей `C` со списком целей карта показывает «Ждём ответ приложения»; клавиатурный путь — `C`, выбор цели в списке), а кнопки «Одобрить» и «Отклонить» над картой отвечают за него.',
					'Вкладка «Хуки» на панели свойств показывает привязки приложения: имя хука, обработчик, число вызовов, итог последнего вызова и переключатель, который временно отключает обработчик. Служебные обработчики самой «Правки» и «Правок» в списке не видны; события приложения (`ready`, `change`, `reject`, `update:data`) показаны рядом с хуками.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: kit.imports,
				vue: kit.vue,
				importsFrom: kit.importsFrom,
				models,
				script: scriptSource(setupSource),
			}),
		},
	},
	args: { ...editArgs, data: MAIN_MAP },
	render: args => ({
		components: { BaseFlowMap, BaseButton },
		setup: useStorySetup(args, { setup, models }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		if (isNarrowMap(canvasElement)) return expectEditCompact({ canvas, canvasElement, userEvent })
		await userEvent.click(flowNode(canvas, 'Банк'))
		await expectStatus(canvas, 'Выделено: 1')
		await userEvent.keyboard('{Delete}')
		await waitFor(() => expect(editNotices(canvas)).toHaveTextContent('Нельзя: Отменено обработчиком «beforeDelete»'))
		await expect(flowNode(canvas, 'Банк')).toBeVisible()
		await expectStatus(canvas, 'Изменений: 0')
		const inspector = await canvas.findByRole('region', { name: 'Свойства и хуки' })
		await userEvent.click(within(inspector).getByRole('tab', { name: 'Хуки' }))
		await waitFor(() => expect(within(inspector).getByText(/guardDelete · вызван 1/)).toBeVisible())
		await expect(within(inspector).getByRole('switch', { name: 'Включить обработчик «guardDelete»' })).toBeChecked()
		await userEvent.click(flowNode(canvas, 'Orders'))
		await userEvent.keyboard('c')
		await userEvent.click(await screen.findByPlaceholderText('Найти узел'))
		await userEvent.click(await screen.findByRole('option', { name: /Redis/ }))
		await expect(await canvas.findByText('Приложение решает: Orders → Redis')).toBeVisible()
		await expect(await canvas.findByLabelText('Ждём ответ приложения')).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Одобрить' })).toBeEnabled()
		await expectStatus(canvas, /связей: 11/)
		await userEvent.click(canvas.getByRole('button', { name: 'Одобрить' }))
		await expectStatus(canvas, /Изменений: 1.*связей: 12/)
		await expect(canvas.getByText('Запросов нет')).toBeVisible()
	},
}
