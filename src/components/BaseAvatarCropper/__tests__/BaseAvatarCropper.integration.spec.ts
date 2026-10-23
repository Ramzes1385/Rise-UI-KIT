import '@testing-library/jest-dom/vitest'
import { h, ref } from 'vue'
import BaseAvatarCropper from '../ui/BaseAvatarCropper.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { AvatarCrop } from '../types/BaseAvatarCropper.types'

describe('BaseAvatarCropper integration', () => {
	it('v-model:crop: кадр после загрузки, клавиш и сброса приходит родителю', async () => {
		const crop = ref<AvatarCrop>()
		const { container } = render({
			setup: () => () =>
				h(BaseAvatarCropper, {
					src: 'data:image/png;base64,AAAA',
					crop: crop.value,
					'onUpdate:crop': (value: AvatarCrop) => (crop.value = value),
				}),
		})
		const image = container.querySelector('img') as HTMLImageElement
		Object.defineProperty(image, 'naturalWidth', { value: 600 })
		Object.defineProperty(image, 'naturalHeight', { value: 900 })
		await fireEvent.load(image)
		expect(crop.value).toEqual({ x: 0, y: 150, size: 600 })
		const area = screen.getByRole('group', { name: 'Кадрирование фото' })
		await fireEvent.keyDown(area, { key: '+' })
		await fireEvent.keyDown(area, { key: 'ArrowUp' })
		expect(crop.value?.size).toBe(545)
		await fireEvent.keyDown(area, { key: '0' })
		expect(crop.value).toEqual({ x: 0, y: 150, size: 600 })
	})
})
