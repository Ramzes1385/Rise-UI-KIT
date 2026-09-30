import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseSlideover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../../ui/BaseSlideover.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const sides = ['left', 'right'] as const

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'side']

const template = `
	<div class="story-stack">
		<div v-for="side in sides" :key="side" class="story-frame" style="height: 200px;">
			<BaseSlideover v-bind="args" :is-open="true" is-contained :side="side" :title="side === 'left' ? 'Слева' : 'Справа'">
				<BaseText>Панель открыта внутри рамки.</BaseText>
			</BaseSlideover>
		</div>
	</div>
`

export const Sides: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['width', 'sizeScale', 'hasOverlay'] },
		docs: {
			description: { story: 'Сторона появления `side`: скругление у панели только со стороны страницы, у края экрана углы прямые.' },
			source: storySource({
				template,
				imports: ['BaseSlideover', 'BaseText'],
				script: `const sides = ${literal(sides)} as const`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: useStorySetup(args, { data: { sides }, slots: OWN_ARGS }),
		template,
	}),
}
