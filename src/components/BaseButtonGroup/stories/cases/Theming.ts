import { expect } from 'storybook/test'
import type meta from '../BaseButtonGroup.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseButtonGroup from '../../ui/BaseButtonGroup.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-group' }

const template = `
	<div class="story-stack">
		<BaseButtonGroup v-bind="args" aria-label="По умолчанию">
			<BaseButton variant="outline">День</BaseButton>
			<BaseButton variant="outline">Неделя</BaseButton>
			<BaseButton variant="outline">Месяц</BaseButton>
		</BaseButtonGroup>
		<div style="--rise-button-group-radius: var(--rise-radius-full); --rise-button-group-gap: 4px; --rise-button-group-padding: 4px; --rise-button-group-bg: var(--rise-bg-elevated);">
			<BaseButtonGroup v-bind="args" aria-label="Токены на контейнере">
				<BaseButton variant="ghost">День</BaseButton>
				<BaseButton variant="ghost">Неделя</BaseButton>
				<BaseButton variant="ghost">Месяц</BaseButton>
			</BaseButtonGroup>
		</div>
		<BaseButtonGroup v-bind="args" aria-label="Классы через ui" :ui="ui">
			<BaseButton variant="outline">День</BaseButton>
			<BaseButton variant="outline">Неделя</BaseButton>
		</BaseButtonGroup>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['orientation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-button-group-*` кит только читает: `radius` — скругление крайних кнопок,',
					'`gap` — расстояние между кнопками (по умолчанию `-1px`: рамки соседей совпадают), `padding`, `bg` и `shadow` — подложка',
					'группы. Задайте их на `:root`, в теме или на контейнере — как здесь; отступ подложки умножается на `--rise-density`.',
					'Вид самих кнопок — токены `--rise-button-*`. Проп `ui` добавляет классы к корню (`root`); глобально — `defaults.BaseButtonGroup.ui`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButtonGroup', 'BaseButton'],
				script: `const ui = ${literal(ui)}`,
				omit: ['ariaLabel'],
			}),
		},
	},
	render: args => ({
		components: { BaseButtonGroup, BaseButton },
		setup: useStorySetup(args, { data: { ui }, slots: ['ariaLabel'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('group', { name: 'По умолчанию' })
		const themed = canvas.getByRole('group', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('group', { name: 'Классы через ui' })
		const second = (group: HTMLElement) => getComputedStyle(group.querySelectorAll('.base-button')[1])

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).paddingTop).toBe('4px')
		await expect(getComputedStyle(themed.querySelector('.base-button')!).borderTopLeftRadius).toBe('9999px')
		await expect(second(themed).marginLeft).toBe('4px')
		await expect(second(plain).marginLeft).toBe('-1px')
		await expect(classed).toHaveClass('base-button-group', 'story-themed-group')
	},
}
