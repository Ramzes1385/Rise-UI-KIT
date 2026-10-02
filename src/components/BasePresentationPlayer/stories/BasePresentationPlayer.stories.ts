import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BasePresentationPlayer from '../ui/BasePresentationPlayer.vue'

const meta = {
	title: 'Media/BasePresentationPlayer',
	component: BasePresentationPlayer,
	parameters,
	argTypes,
	args,
} satisfies Meta<typeof BasePresentationPlayer>

export default meta

export const Default = cases.Default
