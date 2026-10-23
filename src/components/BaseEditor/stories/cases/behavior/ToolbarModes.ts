import { NOTE_HTML } from '../../shared'
import { within, expect } from 'storybook/test'
import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const snippets = ['Добрый день!', 'Спасибо за обращение.', 'С уважением, служба поддержки.']

const state = { full: NOTE_HTML, comment: '', reply: '<p>Здравствуйте, Анна.</p>' }

const SERVICE_ARGS = ['toolbar', 'modelValue', 'hasToolbar', 'placeholder', 'onUpdate:modelValue']

const template = `
	<div class="story-stack">
		<div class="story-stack" style="gap: 6px;">
			<span class="story-label">Стандартный тулбар</span>
			<BaseEditor v-bind="args" v-model="full" style="--editor-min-height: 72px" />
		</div>
		<div class="story-stack" style="gap: 6px;">
			<span class="story-label">Без тулбара — hasToolbar: false</span>
			<BaseEditor
				v-bind="args"
				v-model="comment"
				:has-toolbar="false"
				placeholder="Напишите комментарий…"
				style="--editor-min-height: 72px" />
		</div>
		<div class="story-stack" style="gap: 6px;">
			<span class="story-label">Свой тулбар — слот toolbar</span>
			<BaseEditor v-bind="args" v-model="reply" style="--editor-min-height: 72px">
				<template #toolbar>
					<BaseButton v-for="snippet in snippets" :key="snippet" variant="ghost" :size-scale="87.5" @click="insertSnippet(snippet)">
						{{ snippet }}
					</BaseButton>
				</template>
			</BaseEditor>
		</div>
	</div>
`

const script = `
const snippets = ${literal(snippets)}

function insertSnippet(text: string): void {
	document.execCommand('insertText', false, \` \${text}\`)
}
`

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
			source: storySource({ template, imports: ['BaseButton', 'BaseEditor'], state, script, omit: SERVICE_ARGS }),
		},
	},
	render: args => ({
		components: { BaseEditor, BaseButton },
		setup: useStorySetup(args, {
			state,
			data: { snippets },
			slots: SERVICE_ARGS,
			setup: () => ({
				insertSnippet: (text: string): void => {
					document.execCommand('insertText', false, ` ${text}`)
				},
			}),
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const reply = canvas.getAllByRole('textbox', { name: 'Текстовый редактор' })[2]
		await userEvent.click(within(reply).getByText('Здравствуйте, Анна.'))
		await userEvent.click(canvas.getByRole('button', { name: 'Спасибо за обращение.' }))
		await expect(reply).toHaveTextContent('Здравствуйте, Анна. Спасибо за обращение.')
		await expect(reply).toHaveFocus()
	},
}
