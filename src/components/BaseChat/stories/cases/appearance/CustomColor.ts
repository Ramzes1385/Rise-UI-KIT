import { expect } from 'storybook/test'
import type meta from '../../BaseChat.stories'
import BaseChat from '../../../ui/BaseChat.vue'
import { useStoryMessages } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

export const CustomColor: StoryObj<typeof meta> = {
	render: (args, { globals }) => ({
		components: { BaseChat },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['messages', 'color']),
			color:
				globals.theme === 'dark'
					? { bg: { base: '#0c1a2b' }, text: { base: '#e0f2fe' } }
					: { bg: { base: '#f0f9ff' }, text: { base: '#0c4a6e' } },
			...useStoryMessages(args),
		}),
		template: '<div class="story-medium"><BaseChat v-bind="props" :messages="messages" :color="color" v-on="listeners" /></div>',
	}),
	parameters: {
		docs: {
			description: {
				story: [
					'Проп `color` красит фон окна и заголовок, например под бренд. Кнопки, поле ввода и аватары внутри не перекрашиваются:',
					'«Отправить» остаётся цвета `--rise-primary`. Для тёмной темы пример подставляет тёмный брендовый фон.',
				].join('\n'),
			},
		},
		controls: { exclude: ['color'] },
	},
	play: async ({ canvas, canvasElement, globals }) => {
		const root = canvasElement.querySelector('.base-chat') as HTMLElement
		const brand = globals.theme === 'dark' ? '#0c1a2b' : '#f0f9ff'
		await expect(getComputedStyle(root).backgroundColor).toBe(resolveColor(brand))
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Отправить сообщение' })).backgroundColor).toBe(
			resolveColor('var(--rise-primary)'),
		)
	},
}
