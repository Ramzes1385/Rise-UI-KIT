import type meta from '../BaseButtonGroup.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseButtonGroup from '../../ui/BaseButtonGroup.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { BUTTON_VARIANTS } from '@components/BaseButton/types/BaseButton.types'

const variants = BUTTON_VARIANTS

const template = `
	<div class="story-stack">
		<BaseButtonGroup v-for="variant in variants" :key="variant" v-bind="args" :aria-label="variant">
			<BaseButton :variant="variant">Назад</BaseButton>
			<BaseButton :variant="variant">Сегодня</BaseButton>
			<BaseButton :variant="variant">Вперёд</BaseButton>
		</BaseButtonGroup>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты кнопок в группе: вариант задают сами кнопки.' },
			source: storySource({
				template,
				imports: ['BaseButtonGroup', 'BaseButton'],
				script: `const variants = ${literal(variants)}`,
				omit: ['ariaLabel'],
			}),
		},
		controls: { include: ['sizeScale', 'orientation'] },
	},
	render: args => ({
		components: { BaseButtonGroup, BaseButton },
		setup: useStorySetup(args, { data: { variants }, slots: ['ariaLabel'] }),
		template,
	}),
}
