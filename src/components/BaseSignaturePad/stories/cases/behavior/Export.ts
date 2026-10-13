import { ref } from 'vue'
import { expect } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource } from '@/stories/helpers'
import type meta from '../../BaseSignaturePad.stories'
import { SAMPLE_SIGNATURE } from '../../sampleSignature'
import BaseSignaturePad from '../../../ui/BaseSignaturePad.vue'
import type { BaseSignaturePadExpose } from '../../../types/BaseSignaturePad.types'

const template = `
	<div style="display: grid; gap: 12px; max-width: 400px">
		<BaseSignaturePad ref="pad" v-model="strokes" label="Подпись клиента" />
		<div class="story-row">
			<BaseButton @click="makePng">Получить PNG</BaseButton>
			<BaseButton variant="outline" @click="makeSvg">Получить SVG</BaseButton>
		</div>
		<img v-if="png" :src="png" alt="Подпись в PNG" style="width: 200px; border: 1px dashed var(--rise-border-accented)" />
		<p v-if="svgLength" class="story-label">SVG: {{ svgLength }} символов</p>
	</div>
`

const script = `
const round = (value: number): number => Math.round(value * 10) / 10

const LOOPS = Array.from({ length: 96 }, (_, index) => {
	const angle = (index / 95) * Math.PI * 7
	return { x: round(92 + angle * 11 - 15 * Math.sin(angle)), y: round(92 - 24 * Math.cos(angle) * (1 - angle / 44)) }
})

const UNDERLINE = Array.from({ length: 24 }, (_, index) => {
	const step = index / 23
	return { x: round(64 + 300 * step), y: round(130 + 16 * step * (1 - step) - 10 * step) }
})

const SAMPLE_SIGNATURE: SignatureStroke[] = [
	[
		{ x: 48, y: 118 },
		{ x: 60, y: 80 },
		{ x: 72, y: 40 },
		{ x: 80, y: 76 },
		{ x: 86, y: 112 },
	],
	LOOPS,
	UNDERLINE,
]

const pad = ref<BaseSignaturePadExpose | null>(null)
const strokes = ref(SAMPLE_SIGNATURE)
const png = ref('')
const svgLength = ref(0)

async function makePng(): Promise<void> {
	const blob = await pad.value?.toPng({ background: '#ffffff' })
	if (blob) png.value = URL.createObjectURL(blob)
}

function makeSvg(): void {
	svgLength.value = pad.value?.toSvg().length ?? 0
}
`

export const Export: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Файл с подписью: `toPng({ background })` возвращает Blob — здесь он показан картинкой, `toSvg()` — разметку SVG.',
			},
			source: staticStorySource({
				template,
				imports: ['BaseSignaturePad', 'BaseButton', 'type BaseSignaturePadExpose', 'type SignatureStroke'],
				vue: ['ref'],
				script,
			}),
		},
		controls: { disable: true },
	},
	render: () => ({
		components: { BaseSignaturePad, BaseButton },
		setup: () => {
			const pad = ref<BaseSignaturePadExpose | null>(null)
			const strokes = ref(SAMPLE_SIGNATURE)
			const png = ref('')
			const svgLength = ref(0)
			return {
				pad,
				strokes,
				png,
				svgLength,
				async makePng(): Promise<void> {
					const blob = await pad.value?.toPng({ background: '#ffffff' })
					if (blob) png.value = URL.createObjectURL(blob)
				},
				makeSvg(): void {
					svgLength.value = pad.value?.toSvg().length ?? 0
				},
			}
		},
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Получить PNG' }))
		await expect(await canvas.findByRole('img', { name: 'Подпись в PNG' })).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Получить SVG' }))
		await expect(canvas.getByText(/^SVG: \d+ символов$/)).toBeVisible()
	},
}
