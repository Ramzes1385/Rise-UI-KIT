import BaseForm from '../ui/BaseForm.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { name: 'Анна', email: 'anna@example.com' }

const template = `
	<div class="story-narrow">
		<BaseForm v-bind="args" aria-label="Подписка на рассылку">
			<div class="story-col">
				<BaseInput v-model="name" label="Имя" placeholder="Как к вам обращаться" />
				<BaseInput v-model="email" type="email" label="Email" placeholder="name@example.com" />
				<BaseButton type="submit">Подписаться</BaseButton>
			</div>
		</BaseForm>
	</div>
`

export const source = storySource({ template, imports: ['BaseForm', 'BaseInput', 'BaseButton'], state })

export const render = (args => ({
	components: { BaseForm, BaseInput, BaseButton },
	setup: useStorySetup(args, { state }),
	template,
})) satisfies Meta<typeof BaseForm>['render']
