import { ref } from 'vue'
import type meta from '../../BaseInput.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseInput from '../../../ui/BaseInput.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const WithSlots: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Слоты `prefix`, `postfix` и `suffix` — для иконок и кнопок внутри поля.' } },
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseInput, BaseIcon },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'placeholder', 'type', 'onUpdate:modelValue']),
			query: ref(''),
		}),
		template: `
			<div class="story-narrow">
				<BaseInput v-bind="props" v-model="query" label="Поиск" placeholder="Название проекта">
					<template #prefix>
						<span style="display: flex; align-items: center; padding-left: 10px; color: var(--rise-text-dimmed);">
							<BaseIcon name="search" :size-scale="80" />
						</span>
					</template>
				</BaseInput>
			</div>
		`,
	}),
}
