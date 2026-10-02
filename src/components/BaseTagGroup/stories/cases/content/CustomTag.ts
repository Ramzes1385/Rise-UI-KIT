import { expect } from 'storybook/test'
import type meta from '../../BaseTagGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTagGroup from '../../../ui/BaseTagGroup.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const counts: Record<string, number> = { vue: 128, react: 96, svelte: 24, angular: 40, solid: 8 }

const models = { selected: 'modelValue' }

const template = `
	<BaseTagGroup v-bind="args" v-model="selected">
		<template #tag="{ item }">{{ item.label }} · {{ counts[item.value] }}</template>
	</BaseTagGroup>
`

export const CustomTag: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'tone', 'selectionMode', 'sizeScale'] },
		docs: {
			description: {
				story: 'Слот `tag` — своё содержимое метки (`{ item, isSelected }`), здесь — число записей. Имя кнопки удаления по-прежнему берётся из `label` метки.',
			},
			source: storySource({
				template,
				imports: ['BaseTagGroup'],
				models,
				script: `const counts: Record<string, number> = ${JSON.stringify(counts)}`,
				types: { selected: 'TagGroupModelValue' },
			}),
		},
	},
	render: args => ({
		components: { BaseTagGroup },
		setup: useStorySetup(args, { models, data: { counts }, slots: ['tag'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Vue · 128' })).toHaveAttribute('aria-pressed', 'true')
	},
}
