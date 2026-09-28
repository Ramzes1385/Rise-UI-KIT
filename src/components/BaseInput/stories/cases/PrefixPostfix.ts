import { ref } from 'vue'
import type meta from '../BaseInput.stories'
import BaseInput from '../../ui/BaseInput.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const PrefixPostfix: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Префикс и постфикс — неизменяемый текст внутри поля: протокол, единицы измерения, валюта.' } },
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseInput },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'placeholder', 'type', 'onUpdate:modelValue']),
			site: ref('rise-ui.dev'),
			price: ref('1 490'),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseInput v-bind="props" v-model="site" label="Сайт" prefix="https://" />
				<BaseInput v-bind="props" v-model="price" label="Цена" postfix="₽" />
			</div>
		`,
	}),
}
