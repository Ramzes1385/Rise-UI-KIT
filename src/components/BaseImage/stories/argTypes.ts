import type BaseImage from '../ui/BaseImage.vue'
import type { Meta } from '@storybook/vue3-vite'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP, STORY_IMAGES, BROKEN_IMAGE_SRC } from '@/stories/helpers'

const IMAGE_OPTIONS: Record<string, string> = {
	...Object.fromEntries(STORY_IMAGES.map(image => [image.alt, image.src])),
	'Битая ссылка': BROKEN_IMAGE_SRC,
}

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant'),
	src: {
		control: 'select',
		options: Object.keys(IMAGE_OPTIONS),
		mapping: IMAGE_OPTIONS,
		table: propGroup(ARG_GROUP.content),
	},
	alt: { control: 'text', table: propGroup(ARG_GROUP.content) },
	fallbackSrc: { control: false, table: propGroup(ARG_GROUP.content) },
	gallery: { control: false, table: propGroup(ARG_GROUP.content) },
	width: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	height: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	aspectRatio: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	fit: { control: 'inline-radio', options: ['cover', 'contain', 'fill', 'none'], table: propGroup(ARG_GROUP.appearance) },
	borderRadius: { control: { type: 'number', min: 0, max: 9999 }, table: propGroup(ARG_GROUP.appearance) },
	hasPlaceholder: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	loading: { control: 'inline-radio', options: ['lazy', 'eager'], table: propGroup(ARG_GROUP.behavior) },
	timeout: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	zoomConfig: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	srcWidth: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	convertToWebp: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	convertToAvif: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	placeholder: { control: false },
	error: { control: false },
} satisfies Meta<typeof BaseImage>['argTypes']
