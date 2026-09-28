import { Sample } from '../shared'
import type meta from '../Theming.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Radius: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Скругления: база `--rise-radius` на контейнере — 0 для строгого интерфейса и 8px для мягкого (по умолчанию 4px).',
			},
			source: { code: ':root {\n  --rise-radius: 0px; /* или 8px */\n}' },
		},
	},
	render: () => ({
		components: { Sample },
		template: `
			<div class="fnd-themes">
				<div class="fnd-themes__panel" data-theme="light" style="--rise-radius: 0px;"><span class="story-label">--rise-radius: 0px</span><Sample /></div>
				<div class="fnd-themes__panel" data-theme="light" style="--rise-radius: 8px;"><span class="story-label">--rise-radius: 8px</span><Sample /></div>
			</div>
		`,
	}),
}
