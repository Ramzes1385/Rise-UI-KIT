import { computed, ref } from 'vue'
import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../BasePromptInput.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePromptInput from '../../ui/BasePromptInput.vue'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'

const MODELS = [
	{ id: 'rise-2', label: 'Rise 2' },
	{ id: 'rise-2-mini', label: 'Rise 2 Mini' },
	{ id: 'rise-code', label: 'Rise Code' },
]

const models = { prompt: 'modelValue' }

const template = `
	<div style="max-width: 640px">
		<BasePromptInput v-bind="args" v-model="prompt">
			<template #start>
				<BaseButton variant="ghost" aria-label="Прикрепить файл" :padding="{ x: 6, y: 6 }"><BaseIcon name="attach" /></BaseButton>
				<BaseDropdownMenu :items="modelItems" position="top-start" close-on-check aria-label="Модель">
					<BaseButton variant="ghost" :size-scale="87.5">
						{{ modelLabel }}
						<template #right><BaseIcon name="chevron-down" /></template>
					</BaseButton>
				</BaseDropdownMenu>
			</template>
			<template #end>
				<BaseButton variant="ghost" aria-label="Голосовой ввод" :padding="{ x: 6, y: 6 }"><BaseIcon name="mic" /></BaseButton>
			</template>
		</BasePromptInput>
	</div>
`

const script = `
const MODELS = ${literal(MODELS)}
const model = ref('rise-2')
const modelLabel = computed(() => MODELS.find(item => item.id === model.value)?.label ?? '')
const modelItems = computed<DropdownMenuItem[]>(() =>
	MODELS.map(item => ({
		label: item.label,
		type: 'radio',
		isChecked: model.value === item.id,
		onUpdateChecked: () => {
			model.value = item.id
		},
	})),
)
`

export const WithToolbar: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Слоты `start` и `end`: вложения и выбор модели слева, голосовой ввод справа; поле с подписью.',
					'Модель выбирается в BaseDropdownMenu с пунктами-переключателями (`close-on-check`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BasePromptInput', 'BaseButton', 'BaseIcon', 'BaseDropdownMenu', 'type DropdownMenuItem'],
				models,
				vue: ['computed', 'ref'],
				script,
			}),
		},
	},
	args: { label: 'Вопрос по документации', modelValue: 'Сравни BaseDrawer и BaseSlideover:\n— когда что брать;\n— доступность.' },
	render: args => ({
		components: { BasePromptInput, BaseButton, BaseIcon, BaseDropdownMenu },
		setup: useStorySetup(args, {
			models,
			setup: () => {
				const model = ref('rise-2')
				const modelLabel = computed(() => MODELS.find(item => item.id === model.value)?.label ?? '')
				const modelItems = computed<DropdownMenuItem[]>(() =>
					MODELS.map(item => ({
						label: item.label,
						type: 'radio',
						isChecked: model.value === item.id,
						onUpdateChecked: () => {
							model.value = item.id
						},
					})),
				)
				return { modelLabel, modelItems }
			},
		}),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('textbox', { name: 'Вопрос по документации' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Прикрепить файл' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Отправить' })).toBeEnabled()

		const model = canvas.getByRole('button', { name: /Rise 2/ })
		await expect(model).toHaveAttribute('aria-haspopup', 'menu')
		await expect(model).toHaveAttribute('aria-expanded', 'false')
	},
}
