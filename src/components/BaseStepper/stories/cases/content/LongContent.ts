import { expect } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseStepperStep } from '../../../types/BaseStepper.types'

const LONG_STEPS: BaseStepperStep[] = [
	{ label: 'Заполнение анкеты участника программы', description: 'Контактные данные, опыт работы и образование' },
	{ label: 'Загрузка подтверждающих документов', description: 'Скан паспорта, диплом и сертификаты о повышении квалификации' },
	{ label: 'Собеседование с комиссией', description: 'Онлайн, около 30 минут' },
]

export const LongContent: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Длинные подписи и описания переносятся по словам в пределах своего шага.' } } },
	args: { items: LONG_STEPS, modelValue: 2 },
	play: async ({ canvas }) => {
		for (const step of canvas.getAllByRole('button')) {
			await expect(step.scrollWidth).toBeLessThanOrEqual(step.clientWidth)
		}
	},
}
