import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseVoiceRecorder from '../ui/BaseVoiceRecorder.vue'

const meta = {
	title: 'Media/BaseVoiceRecorder',
	component: BaseVoiceRecorder,
	parameters,
	argTypes,
	args,
	decorators: [() => ({ template: '<div style="max-width: 420px;"><story /></div>' })],
} satisfies Meta<typeof BaseVoiceRecorder>

export default meta

export const Default = cases.Default
export const Preview = cases.Preview
export const Denied = cases.Denied
export const Disabled = cases.Disabled
