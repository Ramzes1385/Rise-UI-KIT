import { expect } from 'storybook/test'
import { flowBpmn } from '@components/BaseFlowMap'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { RETURN_PROCESS_PLAIN } from '../../../fixtures/process/bpmn'
import { compactTotal, isCompact, scenarioPanel, scenarioSteps } from '../../../scenarioShared'

const template = `
	<div class="story-stack">
		<div class="story-row" role="group" aria-label="Решение шлюза «Заявка корректна?»">
			<BaseButton :variant="answer === 'да' ? 'soft' : 'ghost'" :aria-pressed="answer === 'да'" @click="answer = 'да'">
				Заявка корректна
			</BaseButton>
			<BaseButton :variant="answer === 'нет' ? 'soft' : 'ghost'" :aria-pressed="answer === 'нет'" @click="answer = 'нет'">
				Нужно уточнение
			</BaseButton>
		</div>
		<BaseFlowMap v-bind="args" :notations="[flowBpmn]" :choices="{ g1: answer }" />
	</div>
`

export const BpmnSimulation: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Симуляция BPMN: в данных нет `scenarios`, и панель строит сценарий по схеме (метка «Построен по схеме»). Токен идёт по потокам управления и сообщений, параллельный шлюз делит поток и ждёт обе ветки, исключающий выбирает один выход.',
					'Какой выход берёт шлюз, задаёт проп `choices` (id шлюза → условие выхода) или флаг `isDefault` у потока. Переключатель решает шлюз «Заявка корректна?»: «да» — полный путь до возврата денег, «нет» — процесс останавливается на уточнении клиента.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'BaseButton', 'flowBpmn'], state: { answer: 'да' } }),
		},
	},
	args: { data: RETURN_PROCESS_PLAIN, height: '640px', particles: false },
	render: args => ({
		components: { BaseFlowMap, BaseButton },
		setup: useStorySetup(args, { state: { answer: 'да' }, data: { flowBpmn } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		if (await isCompact(canvasElement)) {
			const full = await compactTotal(canvas, userEvent)
			await expect(full).toBeGreaterThan(10)
			await userEvent.click(canvas.getByRole('button', { name: 'Нужно уточнение' }))
			await expect(await compactTotal(canvas, userEvent)).toBeLessThan(full)
			await userEvent.click(canvas.getByRole('button', { name: 'Заявка корректна' }))
			await expect(await compactTotal(canvas, userEvent)).toBe(full)
			return
		}
		await expect(scenarioPanel(canvas)).toHaveTextContent('Построен по схеме')
		const full = scenarioSteps(canvas).length
		await expect(full).toBeGreaterThan(10)
		await userEvent.click(canvas.getByRole('button', { name: 'Нужно уточнение' }))
		await expect(canvas.getByRole('button', { name: 'Нужно уточнение' })).toHaveAttribute('aria-pressed', 'true')
		await expect(scenarioSteps(canvas).length).toBeLessThan(full)
		await userEvent.click(canvas.getByRole('button', { name: 'Заявка корректна' }))
		await expect(scenarioSteps(canvas)).toHaveLength(full)
	},
}
