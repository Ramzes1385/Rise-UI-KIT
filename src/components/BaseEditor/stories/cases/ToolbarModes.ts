import { ref } from 'vue'
import type meta from '../BaseEditor.stories'
import { within, expect } from 'storybook/test'
import BaseEditor from '../../ui/BaseEditor.vue'
import { BaseButton } from '@components/BaseButton'
import { NOTE_HTML, COMPACT_STYLE } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const ToolbarModes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Режимы тулбара. Стандартный — все инструменты. `hasToolbar: false` — поле без тулбара, например для комментариев.',
					'Слот `toolbar` заменяет стандартные кнопки своими: клик по ним не уводит фокус и выделение из текста.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseEditor v-model="html" />',
					'<BaseEditor v-model="comment" :has-toolbar="false" placeholder="Напишите комментарий…" />',
					'<BaseEditor v-model="reply">',
					'  <template #toolbar>',
					'    <BaseButton variant="ghost" @click="insertSnippet(\'Добрый день!\')">Приветствие</BaseButton>',
					'  </template>',
					'</BaseEditor>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEditor, BaseButton },
		setup: () => {
			const snippets = ['Добрый день!', 'Спасибо за обращение.', 'С уважением, служба поддержки.']
			function insertSnippet(text: string): void {
				document.execCommand('insertText', false, ` ${text}`)
			}
			return {
				props: useArgsWithoutSlots(args, ['toolbar', 'modelValue', 'hasToolbar', 'placeholder', 'onUpdate:modelValue']),
				full: ref(NOTE_HTML),
				comment: ref(''),
				reply: ref('<p>Здравствуйте, Анна.</p>'),
				snippets,
				insertSnippet,
				compactStyle: COMPACT_STYLE,
			}
		},
		template: `
			<div class="story-stack">
				<div class="story-stack" style="gap: 6px;">
					<span class="story-label">Стандартный тулбар</span>
					<BaseEditor v-bind="props" v-model="full" :style="compactStyle" />
				</div>
				<div class="story-stack" style="gap: 6px;">
					<span class="story-label">Без тулбара — hasToolbar: false</span>
					<BaseEditor v-bind="props" v-model="comment" :has-toolbar="false" placeholder="Напишите комментарий…" :style="compactStyle" />
				</div>
				<div class="story-stack" style="gap: 6px;">
					<span class="story-label">Свой тулбар — слот toolbar</span>
					<BaseEditor v-bind="props" v-model="reply" :style="compactStyle">
						<template #toolbar>
							<BaseButton v-for="snippet in snippets" :key="snippet" variant="ghost" :size-scale="87.5" @click="insertSnippet(snippet)">
								{{ snippet }}
							</BaseButton>
						</template>
					</BaseEditor>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const reply = canvas.getAllByRole('textbox', { name: 'Текстовый редактор' })[2]
		await userEvent.click(within(reply).getByText('Здравствуйте, Анна.'))
		await userEvent.click(canvas.getByRole('button', { name: 'Спасибо за обращение.' }))
		await expect(reply).toHaveTextContent('Здравствуйте, Анна. Спасибо за обращение.')
		await expect(reply).toHaveFocus()
	},
}
