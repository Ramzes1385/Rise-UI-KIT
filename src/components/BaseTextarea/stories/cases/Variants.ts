import { ref } from 'vue'
import type meta from '../BaseTextarea.stories'
import BaseTextarea from '../../ui/BaseTextarea.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { TEXTAREA_VARIANTS } from '../../types/BaseTextarea.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'rows', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Пять вариантов, как у `BaseInput`: `default` — основной; `outline` — на цветном фоне; `soft`, `ghost` — в плотных',
					'интерфейсах (чат, комментарии в таблице); `shadow` — с тенью.',
				].join('\n'),
			},
			source: {
				code: TEXTAREA_VARIANTS.map(variant => `<BaseTextarea v-model="value" variant="${variant}" label="${variant}" />`).join(
					'\n',
				),
			},
		},
	},
	args: { rows: 3 },
	render: args => ({
		components: { BaseTextarea },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'variant', 'onUpdate:modelValue']),
			variants: TEXTAREA_VARIANTS,
			values: ref<Record<string, string>>(Object.fromEntries(TEXTAREA_VARIANTS.map(variant => [variant, '']))),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 240px;">
				<BaseTextarea
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model="values[variant]"
					:variant="variant"
					:label="variant"
					placeholder="Введите текст" />
			</div>
		`,
	}),
}
