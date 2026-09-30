import type meta from '../BaseAvatarCropper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAvatarCropper from '../../ui/BaseAvatarCropper.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { AVATAR_CROPPER_VARIANTS } from '../../types/BaseAvatarCropper.types'

const variants = AVATAR_CROPPER_VARIANTS

const template = `
	<div class="story-row" style="align-items: flex-start">
		<template v-for="variant in variants" :key="variant">
			<BaseAvatarCropper v-bind="args" :variant="variant" :size="200" :label="'Вариант ' + variant + ', круг'" />
			<BaseAvatarCropper v-bind="args" :variant="variant" :size="200" shape="square" :label="'Вариант ' + variant + ', квадрат'" />
		</template>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: default — область без рамки, outline — с рамкой accented. Круг и квадрат.' },
			source: storySource({ template, imports: ['BaseAvatarCropper'], script: `const variants = ${literal(variants)}` }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseAvatarCropper },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
