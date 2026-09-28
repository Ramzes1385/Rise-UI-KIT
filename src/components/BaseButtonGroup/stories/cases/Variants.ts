import type meta from '../BaseButtonGroup.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseButtonGroup from '../../ui/BaseButtonGroup.vue'
import { BUTTON_VARIANTS } from '@components/BaseButton/types/BaseButton.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты кнопок в группе: вариант задают сами кнопки.' } },
		controls: { include: ['sizeScale', 'orientation'] },
	},
	render: args => ({
		components: { BaseButtonGroup, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['ariaLabel']), variants: BUTTON_VARIANTS }),
		template: `
			<div class="story-stack">
				<BaseButtonGroup v-for="variant in variants" :key="variant" v-bind="props" :aria-label="variant">
					<BaseButton :variant="variant">Назад</BaseButton>
					<BaseButton :variant="variant">Сегодня</BaseButton>
					<BaseButton :variant="variant">Вперёд</BaseButton>
				</BaseButtonGroup>
			</div>
		`,
	}),
}
