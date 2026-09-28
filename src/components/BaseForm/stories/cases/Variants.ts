import { ref } from 'vue'
import type meta from '../BaseForm.stories'
import BaseForm from '../../ui/BaseForm.vue'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { FORM_VARIANTS } from '../../types/BaseForm.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isLoading', 'isDisabled'] },
		docs: {
			description: {
				story: 'Варианты: `default` и `ghost` — без оформления, `outline` — рамка, `soft` — мягкий фон, `shadow` — рамка и тень.',
			},
			source: { code: FORM_VARIANTS.map(variant => `<BaseForm variant="${variant}" @submit="save">…</BaseForm>`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'variant']),
			variants: FORM_VARIANTS,
			values: ref<Record<string, string>>(Object.fromEntries(FORM_VARIANTS.map(variant => [variant, '']))),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 260px;">
				<BaseForm v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :aria-label="'Форма ' + variant">
					<div class="story-col">
						<BaseInput v-model="values[variant]" :label="variant" placeholder="name@example.com" />
						<BaseButton type="submit">Подписаться</BaseButton>
					</div>
				</BaseForm>
			</div>
		`,
	}),
}
