import { flowNode } from '../../shared'
import { expect } from 'storybook/test'
import { setup } from './LiveStatus.setup'
import type meta from '../../BaseFlowMap.stories'
import setupSource from './LiveStatus.setup.ts?raw'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { scriptImports, scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const kit = scriptImports(setupSource, { imports: ['BaseFlowMap', 'BaseButton'] })

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="degrade">Сбой оплаты</BaseButton>
			<BaseButton variant="outline" @click="peak">Пик нагрузки</BaseButton>
			<BaseButton variant="outline" @click="recover">Восстановить</BaseButton>
		</div>
		<BaseFlowMap v-bind="args" :live="live" />
	</div>
`

export const LiveStatus: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Живые данные `live`: статусы, метрики, значки и трафик связей приходят от приложения (телеметрия) и ложатся поверх данных карты — в документ и историю отмены они не попадают.',
					'«Сбой оплаты» красит Payments в «Ошибка», Банк — в «Недоступен», связь с банком гасит; «Пик нагрузки» ускоряет частицы на входе и меняет метрику шлюза; «Восстановить» возвращает «Работает».',
					'Статус различим не только цветом: значок, текст в подробностях и имя узла для скринридера («статус: Ошибка»).',
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
	render: args => ({
		components: { BaseFlowMap, BaseButton },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(flowNode(canvas, 'Payments')).toHaveAccessibleName(/статус: Предупреждение/)
		await userEvent.click(canvas.getByRole('button', { name: 'Сбой оплаты' }))
		await expect(flowNode(canvas, 'Payments')).toHaveAccessibleName(/статус: Ошибка/)
		await expect(flowNode(canvas, 'Банк')).toHaveAccessibleName(/статус: Недоступен/)
		await userEvent.click(canvas.getByRole('button', { name: 'Восстановить' }))
		await expect(flowNode(canvas, 'Payments')).toHaveAccessibleName(/статус: Работает/)
		await expect(flowNode(canvas, 'Банк')).toHaveAccessibleName(/статус: Работает/)
	},
}
