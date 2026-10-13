import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { isStoryBranded, literal, storySource } from '@/stories/helpers'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const ui = { root: 'story-themed-manager', entry: 'story-themed-entry' }

const options: ManagerCaseOptions = {
	template: `
<div class="story-stack">
${managerTag({ tabs: 1, attrs: ['aria-label="Базовый"', ':height="260"'] })}
	<div style="--rise-file-manager-bg: var(--rise-primary-soft); --rise-file-manager-border: var(--rise-primary); --rise-file-manager-radius: var(--rise-radius-2xl); --rise-file-manager-entry-bg-selected: var(--rise-primary-soft-hover); --rise-file-manager-entry-text-selected: var(--rise-primary-text); --rise-file-manager-sidebar-width: 160px;">
${managerTag({ tabs: 2, attrs: ['aria-label="Токены"', ':height="260"'] })}
	</div>
${managerTag({ tabs: 1, attrs: ['aria-label="Класс ui"', ':height="260"', ':ui="ui"'] })}
</div>
`,
	data: { ui },
	script: `const ui = ${literal(ui)}`,
}

const source = storySource(managerSource(options))

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-file-manager-*` кит только читает: `bg`, `border`, `radius`, `entry-radius`, `entry-bg-hover`, `entry-bg-selected`,',
					'`entry-text-selected`, `sidebar-width`, `tile-min-width` — задайте их на `:root`, в теме или на контейнере, как во втором примере.',
					'Проп `ui` добавляет классы к частям (`root`, `sidebar`, `toolbar`, `entry`, `name`, `status`…); глобально — `defaults.BaseFileManager.ui` плагина.',
					'Панель, кнопки и дерево внутри перекрашиваются своими токенами.',
				].join('\n'),
			},
			source,
		},
	},
	render: managerRender(options),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-file-manager')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		await expect(classed).toHaveClass('base-file-manager', 'story-themed-manager')
		await expect(classed.querySelector('[role="option"]')).toHaveClass('story-themed-entry')
	},
}
