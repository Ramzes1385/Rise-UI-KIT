import type meta from '../../BaseInput.stories'
import BaseInput from '../../../ui/BaseInput.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { query: '', filter: '' }

const template = `
	<div class="story-col story-narrow">
		<BaseInput v-bind="args" v-model="query" type="search" label="Поиск" placeholder="Найти компонент" />
		<BaseInput v-bind="args" v-model="filter" type="search" aria-label="Фильтр списка" placeholder="Фильтр без подписи" icon="" />
	</div>
`

export const Search: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`type="search"` — поле поиска: нативный `type="search"` (роль `searchbox`, кнопка очистки браузера) и иконка лупы слева. `icon=""` убирает иконку, `icon="имя"` ставит свою — у любого типа поля.',
			},
			source: storySource({
				template,
				imports: ['BaseInput'],
				state,
				omit: ['modelValue', 'label', 'placeholder', 'type', 'onUpdate:modelValue'],
			}),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseInput },
		setup: useStorySetup(args, { state, slots: ['modelValue', 'label', 'placeholder', 'type', 'onUpdate:modelValue'] }),
		template,
	}),
}
