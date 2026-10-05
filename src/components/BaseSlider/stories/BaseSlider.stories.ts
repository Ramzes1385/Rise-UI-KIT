import { args } from './args'
import * as cases from './cases'
import { argTypes } from './argTypes'
import { decorators } from './decorators'
import { parameters } from './parameters'
import BaseSlider from '../ui/BaseSlider.vue'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Data/BaseSlider',
	component: BaseSlider,
	parameters,
	argTypes,
	args,
	decorators,
} satisfies Meta<typeof BaseSlider>

export default meta

export const Default = cases.Default
export const Thumbnails = cases.Thumbnails
export const ThumbnailsLeft = cases.ThumbnailsLeft
export const ThumbnailsRight = cases.ThumbnailsRight
export const ArrowPositions = cases.ArrowPositions
export const Fade = cases.Fade
export const Cube = cases.Cube
export const Coverflow = cases.Coverflow
export const Flip = cases.Flip
export const Cards = cases.Cards
export const Creative = cases.Creative
export const Autoplay = cases.Autoplay
export const WithoutLoop = cases.WithoutLoop
export const Vertical = cases.Vertical
export const SlidesPerView = cases.SlidesPerView
export const WithZoom = cases.WithZoom
export const CustomSlide = cases.CustomSlide
export const Empty = cases.Empty
export const Loading = cases.Loading
export const LongContent = cases.LongContent
export const Keyboard = cases.Keyboard
