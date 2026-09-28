import { ref } from 'vue'
import { COMPACT_STYLE } from '../shared'
import type meta from '../BaseEditor.stories'
import BaseEditor from '../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { EDITOR_VARIANTS } from '../../types/BaseEditor.types'

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale', 'hasToolbar', 'isReadonly'] },
		docs: {
			description: {
				story: [
					'Пять вариантов. `default` — основной; `outline` — на цветном фоне; `soft` и `ghost` — внутри карточек и панелей,',
					'где рамка лишняя; `shadow` — с лёгкой тенью. Фокус в тексте во всех вариантах — рамка и кольцо основного цвета.',
				].join('\n'),
			},
			source: { code: EDITOR_VARIANTS.map(variant => `<BaseEditor v-model="html" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseEditor },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['toolbar', 'modelValue', 'variant', 'onUpdate:modelValue']),
			variants: EDITOR_VARIANTS,
			values: ref<Record<string, string>>(
				Object.fromEntries(
					EDITOR_VARIANTS.map(variant => [variant, `<p>Вариант <strong>${variant}</strong>: рамка, фон и тулбар.</p>`]),
				),
			),
			compactStyle: COMPACT_STYLE,
		}),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-stack" style="gap: 6px;">
					<span class="story-label">{{ variant }}</span>
					<BaseEditor v-bind="props" v-model="values[variant]" :variant="variant" :style="compactStyle" />
				</div>
			</div>
		`,
	}),
}
