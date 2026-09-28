import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseMediaPlayer from '../ui/BaseMediaPlayer.vue'

const meta = {
	title: 'Media/BaseMediaPlayer',
	component: BaseMediaPlayer,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BaseMediaPlayer>

export default meta

export const Default = cases.Default
export const WithError = cases.WithError
