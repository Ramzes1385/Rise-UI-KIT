import type meta from '../BaseAvatarCropper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseAvatarCropper from '../../ui/BaseAvatarCropper.vue'
import { AVATAR_CROPPER_VARIANTS } from '../../types/BaseAvatarCropper.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты: default — область без рамки, outline — с рамкой accented. Круг и квадрат.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseAvatarCropper },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: AVATAR_CROPPER_VARIANTS }),
		template: `
			<div class="story-row" style="align-items: flex-start">
				<template v-for="variant in variants" :key="variant">
					<BaseAvatarCropper v-bind="props" :variant="variant" :size="200" :label="'Вариант ' + variant + ', круг'" />
					<BaseAvatarCropper v-bind="props" :variant="variant" :size="200" shape="square" :label="'Вариант ' + variant + ', квадрат'" />
				</template>
			</div>
		`,
	}),
}
