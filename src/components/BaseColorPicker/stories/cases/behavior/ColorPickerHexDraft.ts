import { CENTERED, docsFrame } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { expect, screen, waitFor } from 'storybook/test'
import BaseColorPicker from '../../../ui/BaseColorPicker.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const models = { color: 'modelValue' }

const INTERVAL = 200

const centered = CENTERED

const template = `
	<div :style="centered"><BaseColorPicker v-bind="args" v-model="color" :size-scale="scale" /></div>
`

const script = `
const centered = ${literal(centered)}
const scale = ref(100)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
	timer = setInterval(() => {
		scale.value = scale.value === 100 ? 101 : 100
	}, ${INTERVAL})
})
onBeforeUnmount(() => clearInterval(timer))
`

export const ColorPickerHexDraft: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['format', 'hasAlpha'] },
		docs: {
			...docsFrame(420),
			description: {
				story: [
					'Поле HEX держит черновик: пока вы печатаете, перерисовка панели (здесь размер меняется каждые 200 мс) не возвращает в поле',
					'прежний цвет. Черновик сбрасывается, когда цвет изменился: после ухода из поля (или Enter), выбора пресета или бегунка.',
					'Неверное значение при уходе из поля возвращает текущий цвет.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseColorPicker'], models, vue: ['onBeforeUnmount', 'onMounted', 'ref'], script }),
		},
	},
	render: args => ({
		components: { BaseColorPicker },
		setup: useStorySetup(args, {
			models,
			slots: [],
			data: { centered },
			setup: () => {
				const scale = ref(100)
				let timer: ReturnType<typeof setInterval> | undefined
				onMounted(() => {
					timer = setInterval(() => {
						scale.value = scale.value === 100 ? 101 : 100
					}, INTERVAL)
				})
				onBeforeUnmount(() => clearInterval(timer))
				return { scale }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const swatch = canvas.getByRole('button', { name: /Выбранный цвет/ })
		await userEvent.click(swatch)
		const hex = await screen.findByRole('textbox', { name: 'HEX-значение' })
		await userEvent.clear(hex)
		await userEvent.type(hex, '#12')
		await new Promise(resolve => setTimeout(resolve, INTERVAL * 4))
		await expect(hex).toHaveValue('#12')

		await userEvent.type(hex, '3456')
		await userEvent.tab()
		await waitFor(() => expect(swatch.style.backgroundColor).toBe('rgb(18, 52, 86)'))
		await expect(hex).toHaveValue('#123456')

		await userEvent.clear(hex)
		await userEvent.type(hex, 'zzz')
		await userEvent.tab()
		await waitFor(() => expect(hex).toHaveValue('#123456'))
	},
}
