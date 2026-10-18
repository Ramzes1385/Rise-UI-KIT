import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { CHOICE_MAP } from '../../fixtures/scenarios'
import { storySource, useStorySetup } from '@/stories/helpers'
import { scenarioPanel, scenarioStep, scenarioSteps } from '../../scenarioShared'

const template = `
	<div class="story-stack">
		<div class="story-row" role="group" aria-label="Исход оплаты">
			<BaseButton
				:variant="branch === 'paid' ? 'soft' : 'ghost'"
				:aria-pressed="branch === 'paid'"
				@click="branch = 'paid'">
				Оплата прошла
			</BaseButton>
			<BaseButton
				:variant="branch === 'declined' ? 'soft' : 'ghost'"
				:aria-pressed="branch === 'declined'"
				@click="branch = 'declined'">
				Отказ банка
			</BaseButton>
		</div>
		<BaseFlowMap v-bind="args" :choices="{ payment: branch }" />
	</div>
`

export const Choice: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Ветвление по условию (`type: "choice"`): идёт одна ветка — выбранная проп `choices` (`{ payment: "declined" }`), хук `resolveChoice` или `defaultBranch`.',
					'Переключатель выбирает исход оплаты: «Оплата прошла» — заказ сохраняется и уходит письмо (9 шагов), «Отказ банка» — Payments помечен ошибкой (7 шагов). Ошибка отмечена словом «ошибка» и значком, а не только цветом.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'BaseButton'], state: { branch: 'paid' } }),
		},
	},
	args: { data: CHOICE_MAP, height: '600px' },
	render: args => ({
		components: { BaseFlowMap, BaseButton },
		setup: useStorySetup(args, { state: { branch: 'paid' } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(scenarioSteps(canvas)).toHaveLength(7)
		await expect(scenarioPanel(canvas)).not.toHaveTextContent('ошибка')
		await userEvent.click(canvas.getByRole('button', { name: 'Отказ банка' }))
		await expect(canvas.getByRole('button', { name: 'Отказ банка' })).toHaveAttribute('aria-pressed', 'true')
		await expect(scenarioSteps(canvas)).toHaveLength(5)
		await expect(scenarioStep(canvas, /банк отклонил платёж/)).toHaveTextContent('ошибка')
		await userEvent.click(canvas.getByRole('button', { name: 'Оплата прошла' }))
		await expect(scenarioSteps(canvas)).toHaveLength(7)
		await expect(scenarioStep(canvas, /письмо клиенту/)).toBeVisible()
	},
}
