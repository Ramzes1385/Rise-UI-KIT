import '../blocks.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Blocks/Series',
	parameters,
} satisfies Meta

export default meta

export const Episode = cases.Episode
