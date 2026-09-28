import { Sample } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../Theming.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LightAndDark: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Светлая и тёмная тема рядом. Каждая панель задаёт свой `data-theme`, поэтому показывает свою тему',
					'независимо от переключателя на панели инструментов.',
				].join('\n'),
			},
			source: {
				code: [
					'<!-- тема всего приложения -->',
					'<html data-theme="dark">',
					'',
					'<!-- тема части интерфейса -->',
					'<section data-theme="light">…</section>',
				].join('\n'),
			},
		},
	},
	render: () => ({
		components: { Sample },
		template: `
			<div class="fnd-themes">
				<div class="fnd-themes__panel" data-theme="light"><span class="story-label">data-theme="light"</span><Sample /></div>
				<div class="fnd-themes__panel" data-theme="dark"><span class="story-label">data-theme="dark"</span><Sample /></div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [light, dark] = [...canvasElement.querySelectorAll<HTMLElement>('.fnd-themes__panel')]
		await expect(getComputedStyle(light).backgroundColor).toBe('rgb(255, 255, 255)')
		await expect(getComputedStyle(dark).backgroundColor).toBe('rgb(24, 24, 27)')
	},
}
