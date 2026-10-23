import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { EDITOR_VARIANTS } from '../../../types/BaseEditor.types'

const state = {
	values: Object.fromEntries(
		EDITOR_VARIANTS.map(variant => [variant, `<p>Вариант <strong>${variant}</strong>: рамка, фон и тулбар.</p>`]),
	),
}

const SERVICE_ARGS = ['toolbar', 'modelValue', 'variant', 'onUpdate:modelValue']

const template = `
	<div class="story-stack">
		<div v-for="variant in EDITOR_VARIANTS" :key="variant" class="story-stack" style="gap: 6px;">
			<span class="story-label">{{ variant }}</span>
			<BaseEditor v-bind="args" v-model="values[variant]" :variant="variant" style="--editor-min-height: 72px" />
		</div>
	</div>
`

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
			source: storySource({
				template,
				imports: ['BaseEditor', 'EDITOR_VARIANTS'],
				state,
				types: { values: 'Record<string, string>' },
				omit: SERVICE_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { state, data: { EDITOR_VARIANTS }, slots: SERVICE_ARGS }),
		template,
	}),
}
