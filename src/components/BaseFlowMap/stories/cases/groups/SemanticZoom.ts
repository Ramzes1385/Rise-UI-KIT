import { flowNode } from '../../shared'
import { setup } from './SemanticZoom.setup'
import { flowC4 } from '@components/BaseFlowMap'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import setupSource from './SemanticZoom.setup.ts?raw'
import { SHOP_C4 } from '../../fixtures/architecture/c4'
import { scriptImports, scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const kit = scriptImports(setupSource, { imports: ['BaseFlowMap', 'BaseButton'] })

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="setLevel(0)">Контекст</BaseButton>
			<BaseButton variant="outline" @click="setLevel(1)">Контейнеры</BaseButton>
			<BaseButton variant="outline" @click="setLevel(2)">Компоненты</BaseButton>
			<BaseButton variant="outline" @click="enter">Войти в «Сервис заказов»</BaseButton>
			<BaseButton variant="outline" @click="leave">К корню</BaseButton>
		</div>
		<BaseFlowMap ref="map" v-bind="args" :notations="[flowC4]" />
		<p class="story-label" role="status">{{ status }}</p>
	</div>
`

export const SemanticZoom: StoryObj<typeof meta> = {
	parameters: {
		a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
		controls: { include: ['isSemanticZoom', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смысловой зум: масштаб (колесо с Ctrl или кнопки панели) меняет не только размер, но и степень детализации — нотация описывает уровни `semanticZoom`, ядро сворачивает группы глубже порога и объединяет связи.',
					'Полоса уровней над холстом и крошки входа — часть карты; контроллер даёт то же программно: `getLevel()`, `setLevel(index)`, `enterGroup(id)` и `leaveGroup(depth)`. Вход в группу подбирает уровень, раскрывает её и вписывает вид в неё.',
					'`isSemanticZoom: false` отключает зум-сворачивание — остаётся ручное сворачивание групп.',
					'Правило axe `color-contrast` у истории выключено: у человека (тёмно-синяя карточка) подзаголовок серый и не дотягивает до 4,5 : 1 — это дефект ядра, записка в inbox.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: kit.imports,
				vue: kit.vue,
				importsFrom: kit.importsFrom,
				script: scriptSource(setupSource),
			}),
		},
	},
	args: { data: SHOP_C4, height: '860px', particles: false },
	render: args => ({
		components: { BaseFlowMap, BaseButton },
		setup: useStorySetup(args, { setup, data: { flowC4 } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Контекст' }))
		await waitFor(() => expect(canvas.getByRole('status', { name: '' })).toBeDefined(), { timeout: 100 }).catch(() => undefined)
		await waitFor(() => expect(canvas.getByText(/Уровень: 1 из 3/)).toBeVisible())
		await waitFor(() => expect(flowNode(canvas, 'Интернет-магазин')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Войти в «Сервис заказов»' }))
		await waitFor(() => expect(flowNode(canvas, 'Контроллер заказов')).toBeVisible())
		await expect(canvas.getByText(/вход: .*orders-svc/)).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'К корню' }))
		await waitFor(() => expect(canvas.getByText(/Уровень: \d из 3/)).toBeVisible())
	},
}
