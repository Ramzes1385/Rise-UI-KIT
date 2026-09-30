import { docsFrame } from '../../shared'
import { screen, expect } from 'storybook/test'
import type meta from '../../BaseTooltip.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTooltip from '../../../ui/BaseTooltip.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseTooltip v-bind="args">
		<BaseButton variant="outline">Субтитры</BaseButton>
	</BaseTooltip>
`

function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

export const CustomColor: StoryObj<typeof meta> = {
	args: {
		isAlwaysVisible: true,
		text: 'Новая функция',
		color: { bg: { base: 'var(--rise-primary)' }, text: { base: 'var(--rise-on-primary)' } },
	},
	parameters: {
		controls: { include: ['color', 'position'] },
		docs: {
			...docsFrame(120),
			description: {
				story: [
					'Кастомный цвет через `color`: фон подсказки и стрелки, цвет текста. Подойдёт любой CSS-цвет; токены `var(--rise-…)`',
					'сохраняют контраст в обеих темах. Кнопка в слоте цвет не наследует.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTooltip', 'BaseButton'] }),
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		const tooltip = await screen.findByRole('tooltip')
		const primary = resolveColor('var(--rise-primary)')
		await expect(getComputedStyle(tooltip).backgroundColor).toBe(primary)
		await expect(getComputedStyle(tooltip, '::after').backgroundColor).toBe(primary)
		await expect(getComputedStyle(tooltip).color).toBe(resolveColor('var(--rise-on-primary)'))
		const button = canvas.getByRole('button', { name: 'Субтитры' })
		await expect(getComputedStyle(button).backgroundColor).toBe(resolveColor('var(--rise-bg)'))
	},
}
