import '../blocks.scss'
import * as cases from './cases'
import { parameters } from './parameters'
import type { Meta } from '@storybook/vue3-vite'

const meta = {
	title: 'Blocks/Auth',
	parameters,
} satisfies Meta

export default meta

export const SignIn = cases.SignIn
export const SignUp = cases.SignUp
