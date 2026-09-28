import { ref } from 'vue'
import type meta from './BaseEditor.stories'
import BaseEditor from '../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const NOTE_HTML = [
	'<h3>План релиза 1.4</h3>',
	'<p>Обновить <strong>дизайн компонентов</strong> и переписать <em>stories</em>: из примера должно быть понятно, что за что отвечает.</p>',
].join('')

export const COMPACT_STYLE = '--editor-min-height: 72px'

export const renderWithLocalModel: StoryObj<typeof meta>['render'] = args => ({
	components: { BaseEditor },
	setup: () => ({ props: useArgsWithoutSlots(args, ['toolbar', 'modelValue']), html: ref(args.modelValue ?? '') }),
	template: '<BaseEditor v-bind="props" v-model="html" />',
})
