import { expect } from 'storybook/test'
import { storySource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { FILE_MANAGER_VARIANTS } from '../../../types/BaseFileManager.types'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const options: ManagerCaseOptions = {
	template: `
<div class="story-stack">
	<div v-for="variant in FILE_MANAGER_VARIANTS" :key="variant">
		<span class="story-label">{{ variant }}</span>
${managerTag({ tabs: 2, attrs: [':aria-label="variant"', ':variant="variant"', ':height="260"'] })}
	</div>
</div>
`,
	data: { FILE_MANAGER_VARIANTS },
	imports: ['FILE_MANAGER_VARIANTS'],
}

const source = storySource(managerSource(options))

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: 'Все варианты оформления: `default` — рамка вокруг области, `outline` — рамка `accented`, `soft` — мягкий фон без рамки, `ghost` — без фона и рамки. Размер из Controls применяется ко всем.',
			},
			source,
		},
	},
	render: managerRender(options),
	play: async ({ canvasElement }) => {
		const roots = [...canvasElement.querySelectorAll('.base-file-manager')]
		await expect(roots).toHaveLength(FILE_MANAGER_VARIANTS.length)
		await expect(roots[1]).toHaveClass('base-file-manager--outline')
		await expect(roots[2]).toHaveClass('base-file-manager--soft')
		await expect(roots[3]).toHaveClass('base-file-manager--ghost')
	},
}
