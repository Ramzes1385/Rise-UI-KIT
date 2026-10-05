import { expect } from 'storybook/test'
import type meta from '../../BaseTagGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTagGroup from '../../../ui/BaseTagGroup.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-group', tag: 'story-themed-tag' }
const models = { selected: 'modelValue' }

const template = `
	<div class="story-stack">
		<BaseTagGroup v-bind="args" v-model="selected" label="По умолчанию" />
		<div style="--rise-tag-group-gap: calc(var(--rise-control-gap) * 2);">
			<BaseTagGroup v-bind="args" v-model="selected" label="Токены на контейнере" />
		</div>
		<BaseTagGroup v-bind="args" v-model="selected" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'tone', 'selectionMode', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своё у группы — расстояние между метками: токен `--rise-tag-group-gap` (6px). Кит его только читает: задайте его на `:root`,',
					'в теме или на контейнере — как здесь. Вид меток — токены `--rise-tag-*` BaseTag. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root` — группа, `tag` — каждая метка); глобально — `defaults.BaseTagGroup.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTagGroup'],
				models,
				types: { selected: 'TagGroupModelValue' },
				script: `const ui = ${literal(ui)}`,
				omit: ['label'],
			}),
		},
	},
	render: args => ({
		components: { BaseTagGroup },
		setup: useStorySetup(args, { models, data: { ui }, slots: ['tag'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('group', { name: 'По умолчанию' })
		const themed = canvas.getByRole('group', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('group', { name: 'Классы через ui' })

		if (!isStoryBranded()) await expect(getComputedStyle(plain).columnGap).toBe('6px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).columnGap).toBe('12px')
		await expect(classed).toHaveClass('base-tag-group', 'story-themed-group')
		for (const tag of classed.querySelectorAll('.base-tag')) await expect(tag).toHaveClass('base-tag-group__tag', 'story-themed-tag')
	},
}
