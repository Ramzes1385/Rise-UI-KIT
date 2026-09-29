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
export const Settings = cases.Settings
export const Subtitles = cases.Subtitles
export const AudioTracks = cases.AudioTracks
export const TitleAndLogo = cases.TitleAndLogo
export const Theater = cases.Theater
export const Autoplay = cases.Autoplay
export const ContextMenu = cases.ContextMenu
export const ResumePosition = cases.ResumePosition
export const WithError = cases.WithError
