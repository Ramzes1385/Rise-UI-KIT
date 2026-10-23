import { flowNode } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import supportSource from '../../fixtures/support.ts?raw'
import { SUPPORT_MAP, SUPPORT_NOTATION } from '../../fixtures/support'
import { scriptImports, scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const kit = scriptImports(supportSource, { imports: ['BaseFlowMap'] })

const template = `
	<BaseFlowMap v-bind="args" :notations="[SUPPORT_NOTATION]" :data="SUPPORT_MAP" />
`

export const CustomNotation: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Своя нотация «Поддержка»: `defineFlowNotation` описывает виды узлов (карточка кита, ромб-решение, овал «Закрыто»), виды связей (переход, эскалация — штриховая красная), полосы-дорожки и раскладку по умолчанию.',
					'Нотация подключается пропом `notations` и выбирается полем `notation` данных; её виды попадают в легенду, подписи для скринридера и палитру режима «Правка».',
					'Набор нотаций приложения целиком — `defaults.BaseFlowMap.notations` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: kit.imports,
				vue: kit.vue,
				importsFrom: kit.importsFrom,
				script: scriptSource(supportSource),
				omit: ['data', 'notations'],
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { SUPPORT_MAP, SUPPORT_NOTATION } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('region', { name: 'Обработка обращения' })).toBeVisible()
		await expect(flowNode(canvas, 'Решаем сами?')).toHaveAccessibleName(/Решение/)
		await expect(flowNode(canvas, 'Обращение клиента')).toHaveAccessibleName(/Обращение/)
		await expect(flowNode(canvas, 'Закрыто')).toHaveAccessibleName(/Закрыто/)
		await expect(canvas.getByRole('graphics-symbol', { name: /Эскалация «нет»/ })).toBeVisible()
	},
}
