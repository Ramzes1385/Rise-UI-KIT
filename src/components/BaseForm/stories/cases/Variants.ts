import type meta from '../BaseForm.stories'
import BaseForm from '../../ui/BaseForm.vue'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { FORM_VARIANTS } from '../../types/BaseForm.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = FORM_VARIANTS

const state = { values: Object.fromEntries(FORM_VARIANTS.map(variant => [variant, ''])) }

const template = `
	<div class="story-grid" style="--story-grid-min: 260px;">
		<BaseForm v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :aria-label="'Форма ' + variant">
			<div class="story-col">
				<BaseInput v-model="values[variant]" :label="variant" placeholder="name@example.com" />
				<BaseButton type="submit">Подписаться</BaseButton>
			</div>
		</BaseForm>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isLoading', 'isDisabled'] },
		docs: {
			description: {
				story: 'Варианты: `default` и `ghost` — без оформления, `outline` — рамка, `soft` — мягкий фон, `shadow` — рамка и тень.',
			},
			source: storySource({
				template,
				imports: ['BaseForm', 'BaseInput', 'BaseButton'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['default', 'variant'],
			}),
		},
	},
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['default', 'variant'] }),
		template,
	}),
}
