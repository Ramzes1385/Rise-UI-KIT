import type meta from '../../BaseInput.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseInput from '../../../ui/BaseInput.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { query: '' }

const template = `
	<div class="story-narrow">
		<BaseInput v-bind="args" v-model="query" label="Поиск" placeholder="Название проекта">
			<template #prefix>
				<span style="display: flex; align-items: center; padding-left: 10px; color: var(--rise-text-dimmed);">
					<BaseIcon name="search" :size-scale="80" />
				</span>
			</template>
		</BaseInput>
	</div>
`

export const WithSlots: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Слоты `prefix`, `postfix` и `suffix` — для иконок и кнопок внутри поля.' },
			source: storySource({
				template,
				imports: ['BaseInput', 'BaseIcon'],
				state,
				omit: ['modelValue', 'label', 'placeholder', 'type', 'onUpdate:modelValue'],
			}),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseInput, BaseIcon },
		setup: useStorySetup(args, { state, slots: ['modelValue', 'label', 'placeholder', 'type', 'onUpdate:modelValue'] }),
		template,
	}),
}
