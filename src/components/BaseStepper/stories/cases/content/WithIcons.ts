import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseStepperStep } from '../../../types/BaseStepper.types'

const ICON_STEPS: BaseStepperStep[] = [
	{ label: 'Документы', icon: 'file' },
	{ label: 'Проверка', icon: 'search' },
	{ label: 'Отправка', icon: 'send' },
]

export const WithIcons: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Иконка шага (`icon`) заменяет номер в индикаторе; у пройденного шага — галочка.' } } },
	args: { items: ICON_STEPS, modelValue: 2 },
}
