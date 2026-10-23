import { expect } from 'storybook/test'
import type meta from '../BaseInputTags.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LongContent: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Много тегов: переносятся на новые строки, длинный тег обрезается многоточием.' } } },
	args: {
		modelValue: [
			'Vue',
			'TypeScript',
			'Pinia',
			'Vite',
			'Vitest',
			'Playwright',
			'Storybook',
			'Доступность интерфейсов по WCAG 2.2 и шаблонам APG',
		],
	},
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('listitem')).toHaveLength(8)
	},
}
