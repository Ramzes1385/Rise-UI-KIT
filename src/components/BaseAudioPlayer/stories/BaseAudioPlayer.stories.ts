import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'
import BaseAudioPlayer from '../ui/BaseAudioPlayer.vue'

const meta = {
	title: 'Media/BaseAudioPlayer',
	component: BaseAudioPlayer,
	parameters,
	argTypes,
	args,
	decorators: [(_, { name }) => ({ template: name === 'Анимации' ? '<story />' : '<div style="max-width: 420px;"><story /></div>' })],
} satisfies Meta<typeof BaseAudioPlayer>

export default meta

export const Default = cases.Default
export const DecodedWaveform = cases.DecodedWaveform
export const Transcript = cases.Transcript
export const TranscriptLecture = cases.TranscriptLecture
export const Variants = cases.Variants
export const Sizes = cases.Sizes
export const Theming = cases.Theming
export const WithError = cases.WithError
export const Disabled = cases.Disabled
export const Animations = cases.Animations
