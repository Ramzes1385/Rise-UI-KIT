import type { Meta } from '@storybook/vue3-vite'
import type BaseAvatarCropper from '../ui/BaseAvatarCropper.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { AVATAR_CROP_SHAPES, AVATAR_CROPPER_VARIANTS } from '../types/BaseAvatarCropper.types'

export const argTypes = {
	...baseArgTypes({ variants: AVATAR_CROPPER_VARIANTS }),
	src: { control: 'text', table: propGroup(ARG_GROUP.content) },
	crop: { control: 'object', table: propGroup(ARG_GROUP.content) },
	shape: { control: 'inline-radio', options: AVATAR_CROP_SHAPES, table: propGroup(ARG_GROUP.appearance) },
	size: { control: { type: 'number', min: 160, max: 480, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
	maxZoom: { control: { type: 'number', min: 1, max: 10, step: 0.5 }, table: propGroup(ARG_GROUP.behavior) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseAvatarCropper>['argTypes']
