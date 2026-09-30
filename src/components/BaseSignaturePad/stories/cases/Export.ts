import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../BaseSignaturePad.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { SAMPLE_SIGNATURE } from '../sampleSignature'
import BaseSignaturePad from '../../ui/BaseSignaturePad.vue'
import type { BaseSignaturePadExpose } from '../../types/BaseSignaturePad.types'

export const Export: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Файл с подписью: `toPng({ background })` возвращает Blob — здесь он показан картинкой, `toSvg()` — разметку SVG.',
			},
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
		template: `
			<div style="display: grid; gap: 12px; max-width: 400px">
				<BaseSignaturePad ref="pad" v-model="strokes" label="Подпись клиента" />
				<div class="story-row">
					<BaseButton @click="makePng">Получить PNG</BaseButton>
					<BaseButton variant="outline" @click="makeSvg">Получить SVG</BaseButton>
				</div>
				<img v-if="png" :src="png" alt="Подпись в PNG" style="width: 200px; border: 1px dashed var(--rise-border-accented)" />
				<p v-if="svgLength" class="story-label">SVG: {{ svgLength }} символов</p>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Получить PNG' }))
		await expect(await canvas.findByRole('img', { name: 'Подпись в PNG' })).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Получить SVG' }))
		await expect(canvas.getByText(/^SVG: \d+ символов$/)).toBeVisible()
	},
}
