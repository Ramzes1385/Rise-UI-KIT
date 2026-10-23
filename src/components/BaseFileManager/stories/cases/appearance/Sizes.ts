import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { literal, SIZE_PRESETS, sizeLabel, storySource } from '@/stories/helpers'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const options: ManagerCaseOptions = {
	template: `
<div class="story-stack">
	<div v-for="preset in presets" :key="preset.name">
		<span class="story-label">{{ preset.label }}</span>
${managerTag({ tabs: 2, attrs: [':aria-label="preset.label"', ':size-scale="preset.sizeScale"', ':height="300"'] })}
	</div>
</div>
`,
	data: { presets },
	script: `const presets = ${literal(presets)}`,
}

const source = storySource(managerSource(options))

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. Масштабируются строки, иконки, панель, дерево и кнопки; высота области задана в пикселях и остаётся прежней.',
			},
			source,
		},
	},
	render: managerRender(options),
	play: async ({ canvasElement }) => {
		const heights = [...canvasElement.querySelectorAll('.base-file-manager')].map(
			root => root.querySelector('[role="option"]')?.getBoundingClientRect().height ?? 0,
		)
		await expect(heights).toHaveLength(presets.length)
		await expect(heights[0]).toBeLessThan(heights[heights.length - 1])
	},
}
