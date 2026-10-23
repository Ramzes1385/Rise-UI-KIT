import { expect } from 'storybook/test'
import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseSlideover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../../ui/BaseSlideover.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items = [
	{ title: 'Из стилей', padding: undefined },
	{ title: 'padding: 32', padding: 32 },
	{ title: '{ x: 12, y: 8 }', padding: { x: 12, y: 8 } },
]

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'padding']

const template = `
	<div class="story-stack">
		<div v-for="item in items" :key="item.title" class="story-frame" style="height: 160px;">
			<BaseSlideover v-bind="args" :is-open="true" is-contained :padding="item.padding" :title="item.title">
				<BaseText>Содержимое панели.</BaseText>
			</BaseSlideover>
		</div>
	</div>
`

export const Padding: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Отступы шапки, тела и подвала — `padding`. Без него — 16px по вертикали и 20px по горизонтали из стилей;',
					'число задаёт только горизонталь, объект `{ x, y, top, right, bottom, left }` — стороны напрямую.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSlideover', 'BaseText'],
				script: `const items = ${literal(items)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: useStorySetup(args, { data: { items }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas }) => {
		const [themed, numeric, object] = canvas.getAllByRole('dialog')
		await expect(themed?.getAttribute('style')).toBeNull()
		await expect(numeric?.style.getPropertyValue('--slideover-pad-left')).toBe('32px')
		await expect(numeric?.style.getPropertyValue('--slideover-pad-top')).toBe('')
		await expect(object?.style.getPropertyValue('--slideover-pad-top')).toBe('8px')
	},
}
