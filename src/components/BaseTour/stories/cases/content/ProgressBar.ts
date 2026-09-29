import type meta from '../../BaseTour.stories'
import { docsFrame, STEPS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, within } from 'storybook/test'
import type { TourStep } from '../../../types/BaseTour.types'

const MANY_STEPS: TourStep[] = Array.from({ length: 10 }, (_, index) => ({
	...STEPS[index % STEPS.length]!,
	title: `Шаг ${index + 1}. ${STEPS[index % STEPS.length]!.title}`,
}))

export const ProgressBar: StoryObj<typeof meta> = {
	args: { isOpen: true, steps: MANY_STEPS, step: 4 },
	parameters: { docs: { ...docsFrame(320), description: { story: 'Больше восьми шагов: вместо точек — полоса прогресса.' } } },
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Шаг 5. Импорт' })
		await expect(await within(dialog).findByText('5 / 10')).toBeInTheDocument()
	},
}
