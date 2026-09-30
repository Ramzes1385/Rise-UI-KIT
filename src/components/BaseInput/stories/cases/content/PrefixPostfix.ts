import type meta from '../../BaseInput.stories'
import BaseInput from '../../../ui/BaseInput.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { site: 'rise-ui.dev', price: '1 490' }

const template = `
	<div class="story-col story-narrow">
		<BaseInput v-bind="args" v-model="site" label="Сайт" prefix="https://" />
		<BaseInput v-bind="args" v-model="price" label="Цена" postfix="₽" />
	</div>
`

export const PrefixPostfix: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Префикс и постфикс — неизменяемый текст внутри поля: протокол, единицы измерения, валюта.' },
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
