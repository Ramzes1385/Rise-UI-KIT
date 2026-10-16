import { SLOT_KEYS, STEPS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const HIDDEN = [...SLOT_KEYS, 'items']

const template = `
	<div class="story-stack" style="gap: 32px">
		<div class="story-narrow">
			<BaseStepper v-bind="args" :items="steps" summary="titled" />
		</div>
		<div class="story-narrow">
			<BaseStepper v-bind="args" :items="steps" summary="count" />
		</div>
		<div class="story-narrow">
			<BaseStepper v-bind="args" :items="steps" summary="none" />
		</div>
	</div>
`

export const Summary: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Подпись текущего шага под лентой в компактном виде (до 480px): `titled` — «Шаг N из M: подпись» (по умолчанию),',
					'`count` — только «Шаг N из M» (так делает BaseFormWizard: заголовок шага стоит ниже, повтор не нужен), `none` — без подписи.',
					'Подпись только для глаз, доступные имена шагов от режима не зависят.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseStepper'],
				script: `const steps = ${literal(STEPS)}`,
				omit: HIDDEN,
			}),
		},
		controls: { include: ['modelValue', 'sizeScale'] },
	},
	args: { modelValue: 2, clickable: 'none' },
	render: args => ({
		components: { BaseStepper },
		setup: useStorySetup(args, { data: { steps: STEPS }, slots: HIDDEN }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [titled, count, none] = [...canvasElement.querySelectorAll<HTMLElement>('.base-stepper')]
		await waitFor(() => expect(getComputedStyle(titled, '::after').content).toContain('Шаг 2 из 4: Доставка'))
		await expect(getComputedStyle(count, '::after').content).toContain('Шаг 2 из 4"')
		await expect(getComputedStyle(none, '::after').content).toBe('none')
	},
}
