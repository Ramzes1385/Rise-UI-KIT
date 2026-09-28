import { ref } from 'vue'
import BaseForm from '../ui/BaseForm.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseForm, BaseInput, BaseButton },
	setup: () => ({ props: useArgsWithoutSlots(args), name: ref('Анна'), email: ref('anna@example.com') }),
	template: `
			<div class="story-narrow">
				<BaseForm v-bind="props" aria-label="Подписка на рассылку">
					<div class="story-col">
						<BaseInput v-model="name" label="Имя" placeholder="Как к вам обращаться" />
						<BaseInput v-model="email" type="email" label="Email" placeholder="name@example.com" />
						<BaseButton type="submit">Подписаться</BaseButton>
					</div>
				</BaseForm>
			</div>
		`,
})) satisfies Meta<typeof BaseForm>['render']
