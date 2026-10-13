import { expect } from 'storybook/test'
import { storySource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const options: ManagerCaseOptions = {
	template: `
${managerTag({ attrs: [':height="320"'] })}
`,
}

const source = storySource(managerSource(options))

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: фон и текст области. Для обычных менеджеров хватает токенов `--rise-file-manager-*` (история Theming).',
			},
			source,
		},
	},
	args: { color: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } } },
	render: managerRender(options),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('.base-file-manager') as HTMLElement
		await expect(root.style.getPropertyValue('--custom-bg')).toBe('var(--rise-primary-soft)')
		await expect(root.style.getPropertyValue('--custom-text')).toBe('var(--rise-primary-text)')
	},
}
