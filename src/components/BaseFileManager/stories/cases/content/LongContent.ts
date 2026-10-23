import { expect } from 'storybook/test'
import { setup } from './LongContent.setup'
import { storySource } from '@/stories/helpers'
import setupSource from './LongContent.setup.ts?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const options: ManagerCaseOptions = {
	template: `
<div class="story-medium">
${managerTag({ isStatic: true, attrs: [':height="420"'] })}
</div>
`,
	setup,
	raw: setupSource,
}

const source = storySource(managerSource(options))

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'123 записи с очень длинными именами в узком контейнере: дерево папок скрывается само, имя обрезается многоточием, размер и дата остаются на месте,',
					'содержимое прокручивается внутри области (шапка сортировки закреплена), а строка состояния и панель остаются на виду. Ширина не выходит за контейнер.',
				].join('\n'),
			},
			source,
		},
	},
	render: managerRender(options),
	play: async ({ canvas, canvasElement }) => {
		const root = canvasElement.querySelector('.base-file-manager') as HTMLElement
		await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)

		const area = canvasElement.querySelector('.base-file-manager__area') as HTMLElement
		await expect(area.scrollHeight).toBeGreaterThan(area.clientHeight)

		const names = [...canvasElement.querySelectorAll<HTMLElement>('.base-file-manager__name')]
		await expect(names.some(name => name.scrollWidth > name.clientWidth)).toBe(true)
		await expect(canvas.getByRole('option', { name: /^Архив переписки/ })).toBeVisible()
		await expect(canvasElement.querySelector('.base-file-manager__status')).toHaveTextContent(/^123 элемента/)
	},
}
