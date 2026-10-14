import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../../BaseEditor.stories'
import { expect, waitFor, within } from 'storybook/test'
import BaseEditor from '../../../../../ui/BaseEditor.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { html: '<p>Выделите слово и нажмите «Жирный» или вставьте подпись.</p>' }

const template = `
	<BaseEditor v-bind="args" v-model="html" label="Письмо">
		<template #toolbar="{ applyFormat, insertHtml, activeStates }">
			<BaseButton variant="ghost" :size-scale="87.5" :aria-pressed="activeStates.isBold" @click="applyFormat('bold')">Жирный</BaseButton>
			<BaseButton variant="ghost" :size-scale="87.5" @click="insertHtml('<p>С уважением, команда Rise</p>')">Подпись</BaseButton>
		</template>
	</BaseEditor>
`

export const EditorToolbarSlot: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue'] },
		docs: {
			description: {
				story: [
					'Слот `toolbar` с аргументами: `applyFormat`, `applyBlock`, `insertHtml`, `activeStates`, `isCodeMode`, `toggleCodeMode`,',
					'`openLinkDialog`, `focus`. Слот заменяет стандартные кнопки; нажатие на кнопку панели не уводит выделение из текста,',
					'а собственные поля слота получают фокус как обычно. В режиме чтения и у отключённого редактора команды слота ничего не делают.',
					'Методы `focus()`, `getHtml()`, `insertHtml()`, `validate()` и `reset()` доступны через `ref` на редактор.',
				].join(' '),
			},
			source: storySource({ template, imports: ['BaseEditor', 'BaseButton'], state, omit: ['toolbar'] }),
		},
	},
	args: { modelValue: state.html },
	render: args => ({
		components: { BaseEditor, BaseButton },
		setup: useStorySetup(args, { state, slots: ['toolbar', 'modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Письмо' })
		await userEvent.click(canvas.getByRole('button', { name: 'Подпись' }))
		await waitFor(() => expect(within(textbox).getByText('С уважением, команда Rise')).toBeVisible())
		await expect(textbox).toHaveFocus()
	},
}
