import type meta from '../../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTextarea from '../../../ui/BaseTextarea.vue'
import { TEXTAREA_VARIANTS } from '../../../types/BaseTextarea.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = TEXTAREA_VARIANTS

const state = { values: Object.fromEntries(TEXTAREA_VARIANTS.map(variant => [variant, ''])) }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseTextarea
			v-for="variant in variants"
			:key="variant"
			v-bind="args"
			v-model="values[variant]"
			:variant="variant"
			:label="variant"
			placeholder="Введите текст" />
	</div>
`

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
			source: storySource({
				template,
				imports: ['BaseTextarea'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['default', 'modelValue', 'label', 'variant', 'onUpdate:modelValue'],
			}),
		},
	},
	args: { rows: 3 },
	render: args => ({
		components: { BaseTextarea },
		setup: useStorySetup(args, {
			state,
			data: { variants },
			slots: ['default', 'modelValue', 'label', 'variant', 'onUpdate:modelValue'],
		}),
		template,
	}),
}
