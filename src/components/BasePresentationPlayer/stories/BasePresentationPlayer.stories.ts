import { args } from './args'
import * as cases from './cases'
import { render } from './render'
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
	render,
} satisfies Meta<typeof BasePresentationPlayer>

export default meta

export const Default = cases.Default
export const Linear = cases.Linear
export const Strict = cases.Strict
export const SharedAudio = cases.SharedAudio
export const CustomSlide = cases.CustomSlide
export const Resume = cases.Resume
export const Captions = cases.Captions
export const SlideList = cases.SlideList
export const Speech = cases.Speech
export const SpeechService = cases.SpeechService
export const SpeechYandex = cases.SpeechYandex
export const Quiz = cases.Quiz
export const Loading = cases.Loading
