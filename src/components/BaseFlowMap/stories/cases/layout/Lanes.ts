import { flowNode } from '../../shared'
import { expect, within } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import supportSource from '../../fixtures/support.ts?raw'
import { SUPPORT_MAP, SUPPORT_NOTATION } from '../../fixtures/support'
import { scriptImports, scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const kit = scriptImports(supportSource, { imports: ['BaseFlowMap'] })

const template = `
	<div class="story-stack">
		<div>
			<span class="story-label">Ярусы (tier): узлы яруса в одном ряду, лишние переносятся (wrap)</span>
			<BaseFlowMap v-bind="args" :layout="{ wrap: 3 }" aria-label="Ярусы" height="520px" :panels="['toolbar']" />
		</div>
		<div>
			<span class="story-label">Дорожки вокруг узлов (byLanes: false): раскладка не привязана к дорожкам</span>
			<BaseFlowMap v-bind="args" :layout="{ byLanes: false }" aria-label="Дорожки без раскладки" height="440px" :panels="['toolbar']" />
		</div>
		<div>
			<span class="story-label">Полосы (band): дорожки через все слои потока</span>
			<BaseFlowMap :notations="[SUPPORT_NOTATION]" :data="SUPPORT_MAP" aria-label="Полосы" height="460px" :panels="['toolbar']" />
		</div>
	</div>
`

export const Lanes: StoryObj<typeof meta> = {
	parameters: {
		a11y: {
			config: {
				rules: [
					{ id: 'landmark-unique', enabled: false },
					{ id: 'scrollable-region-focusable', enabled: false },
				],
			},
		},
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Группы в раскладке. Ярус (`tier`) — дорожка поперёк потока: узлы яруса стоят в одном ряду, `layout.wrap` переносит лишние следующим рядом, связь внутри яруса горизонтальна (так устроена «Карта сервисов»).',
					'Полоса (`band`) — дорожка вдоль потока через все слои (дорожки BPMN и своя нотация «Поддержка» ниже): узел остаётся в своей полосе, пока идёт слева направо.',
					'`byLanes: false` рисует дорожки вокруг узлов, но раскладку они не задают.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: kit.imports,
				vue: kit.vue,
				importsFrom: kit.importsFrom,
				script: scriptSource(supportSource),
				omit: ['layout', 'height', 'panels'],
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { SUPPORT_MAP, SUPPORT_NOTATION } }),
		template,
	}),
	play: async ({ canvas }) => {
		const center = (map: string, label: string) => {
			const rect = flowNode(within(canvas.getByRole('region', { name: map })), label).getBoundingClientRect()
			return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
		}
		const web = center('Ярусы', 'Web')
		const mobile = center('Ярусы', 'Mobile')
		await expect(Math.abs(web.y - mobile.y)).toBeLessThan(2)
		const pay = center('Ярусы', 'Payments')
		const bank = center('Ярусы', 'Банк')
		await expect(Math.abs(pay.y - bank.y)).toBeLessThan(2)
		const reply = center('Полосы', 'Ответ клиенту')
		const fix = center('Полосы', 'Исправить дефект')
		await expect(fix.y).toBeGreaterThan(reply.y)
	},
}
