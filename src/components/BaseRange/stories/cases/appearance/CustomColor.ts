import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import type { StoryObj } from '@storybook/vue3-vite'

function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg` красит заполнение и кольцо бегунка, `text` — значение в подписи.',
					'Для текста взят токен роли: он контрастен и в светлой, и в тёмной теме.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: 70, hasLabel: true, color: { bg: { base: '#16a34a' }, text: { base: 'var(--rise-success)' } } },
	play: async ({ canvas }) => {
		const thumb = canvas.getByRole('slider', { name: 'Громкость' })
		await expect(getComputedStyle(thumb).borderTopColor).toBe('rgb(22, 163, 74)')
		await expect(getComputedStyle(thumb).backgroundColor).toBe(resolveColor('var(--rise-bg)'))
	},
}
