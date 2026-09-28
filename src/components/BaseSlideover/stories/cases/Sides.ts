import { SHOWCASE_OWN_ARGS } from '../shared'
import { BaseText } from '@components/BaseText'
import type meta from '../BaseSlideover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../ui/BaseSlideover.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Sides: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['width', 'sizeScale', 'hasOverlay'] },
		docs: {
			description: { story: 'Сторона появления `side`: скругление у панели только со стороны страницы, у края экрана углы прямые.' },
			source: { code: '<BaseSlideover v-model:is-open="isOpen" side="left" title="Слева">…</BaseSlideover>' },
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'side']), sides: ['left', 'right'] as const }),
		template: `
			<div class="story-stack">
				<div v-for="side in sides" :key="side" class="story-frame" style="height: 200px;">
					<BaseSlideover v-bind="props" :is-open="true" is-contained :side="side" :title="side === 'left' ? 'Слева' : 'Справа'">
						<BaseText>Панель открыта внутри рамки.</BaseText>
					</BaseSlideover>
				</div>
			</div>
		`,
	}),
}
