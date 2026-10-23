import { expect } from 'storybook/test'
import type meta from '../Theming.stories'
import { Sample, SAMPLE_SOURCE } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, resolveColor, staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="fnd-themes">
		<div class="fnd-themes__panel" data-theme="light"><span class="story-label">data-theme="light"</span><Sample /></div>
		<div class="fnd-themes__panel" data-theme="dark"><span class="story-label">data-theme="dark"</span><Sample /></div>
	</div>
`

export const LightAndDark: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Светлая и тёмная тема рядом. Каждая панель — контейнер `bg-muted` со своим `data-theme`, поэтому показывает свою тему',
					'независимо от переключателя на панели инструментов.',
					'',
					'```html',
					'<!-- тема всего приложения -->',
					'<html data-theme="dark">',
					'',
					'<!-- тема части интерфейса -->',
					'<section data-theme="light">…</section>',
					'```',
				].join('\n'),
			},
			source: staticStorySource({ template, imports: [], components: { Sample: SAMPLE_SOURCE } }),
		},
	},
	render: args => ({
		components: { Sample },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [light, dark] = [...canvasElement.querySelectorAll<HTMLElement>('.fnd-themes__panel')]
		await expect(getComputedStyle(light).backgroundColor).not.toBe(getComputedStyle(dark).backgroundColor)
		if (isStoryBranded()) return
		await expect(getComputedStyle(light).backgroundColor).toBe(resolveColor('#f5f6f9'))
	},
}
