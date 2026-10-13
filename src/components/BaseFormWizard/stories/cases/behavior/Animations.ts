import { DEMO_STEPS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseFormWizard from '../../../ui/BaseFormWizard.vue'

const motion = motionPresetsStory({
	item: `
		<BaseFormWizard v-bind="args" v-model:step="step" :steps="steps" :is-linear="false">
			<template #default="{ step: current }">
				<p>Здесь поля шага «{{ current.title }}»</p>
			</template>
		</BaseFormWizard>
	`,
	components: { BaseButton, BaseFormWizard },
	imports: ['BaseFormWizard'],
	state: { step: 'account', steps: DEMO_STEPS },
	action: 'step = steps[(steps.findIndex(item => item.id === step) + 1) % steps.length].id',
	trigger: 'Следующий шаг',
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена шага в четырёх пресетах движения: кнопка сверху или любой переход внутри мастера. Своих анимаций у мастера нет: линия',
					'и индикаторы степпера двигаются по его токенам (`--rise-duration`, `--rise-ease-in`, `--rise-ease-out`), содержимое шага меняется сразу.',
					"В `none` и при «уменьшить движение» степпер встаёт сразу. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий шаг' }))
		await waitFor(() => expect(canvas.getAllByRole('heading', { name: 'Профиль' })).toHaveLength(4))
		await userEvent.click(canvas.getAllByRole('button', { name: 'Далее' })[0])
		await waitFor(() => expect(canvas.getAllByRole('heading', { name: 'Подтверждение' }).length).toBeGreaterThan(0))
	},
}
