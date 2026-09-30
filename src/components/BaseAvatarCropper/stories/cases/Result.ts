import { ref } from 'vue'
import { expect, waitFor } from 'storybook/test'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import type meta from '../BaseAvatarCropper.stories'
import { placeholderImage } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAvatarCropper from '../../ui/BaseAvatarCropper.vue'
import type { AvatarCrop, BaseAvatarCropperExpose } from '../../types/BaseAvatarCropper.types'

export const Result: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Готовая картинка: `getBlob()` возвращает PNG 256 × 256 — здесь он показан в BaseAvatar трёх размеров, рядом — кадр в пикселях фото.',
			},
		},
		controls: { disable: true },
	},
	render: () => ({
		components: { BaseAvatarCropper, BaseButton, BaseAvatar },
		setup: () => {
			const cropper = ref<BaseAvatarCropperExpose | null>(null)
			const crop = ref<AvatarCrop>({ x: 300, y: 60, size: 380 })
			const avatar = ref('')
			return {
				cropper,
				crop,
				avatar,
				src: placeholderImage({ width: 800, height: 500, hue: 24 }),
				async save(): Promise<void> {
					const blob = await cropper.value?.getBlob()
					if (blob) avatar.value = URL.createObjectURL(blob)
				},
			}
		},
		template: `
			<div class="story-row" style="align-items: flex-start; gap: 32px">
				<BaseAvatarCropper ref="cropper" v-model:crop="crop" :src="src" label="Фото профиля" />
				<div style="display: grid; gap: 12px; justify-items: start">
					<BaseButton @click="save">Сохранить аватар</BaseButton>
					<p class="story-label">Кадр: x {{ crop.x }}, y {{ crop.y }}, сторона {{ crop.size }}</p>
					<div v-if="avatar" class="story-row">
						<BaseAvatar :src="avatar" alt="Новый аватар" :size-scale="150" />
						<BaseAvatar :src="avatar" alt="Новый аватар, средний" />
						<BaseAvatar :src="avatar" alt="Новый аватар, маленький" :size-scale="75" />
					</div>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(canvas.getByRole('slider', { name: 'Масштаб' })).not.toHaveAttribute('aria-disabled', 'true'))
		await userEvent.click(canvas.getByRole('button', { name: 'Сохранить аватар' }))
		await expect(await canvas.findByRole('img', { name: 'Новый аватар' })).toBeVisible()
	},
}
