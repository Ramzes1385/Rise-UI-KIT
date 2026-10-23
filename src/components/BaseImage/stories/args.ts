import { SUNRISE } from './shared'
import { fn } from 'storybook/test'
import type BaseImage from '../ui/BaseImage.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	src: SUNRISE.alt,
	alt: SUNRISE.alt,
	width: 320,
	height: 200,
	fit: 'cover',
	hasPlaceholder: true,
	loading: 'lazy',
	timeout: 5000,
	sizeScale: 100,
	onLoad: fn(),
	onError: fn(),
	onZoom: fn(),
} satisfies Meta<typeof BaseImage>['args']
