import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSignaturePad.stories'
import { SAMPLE_SIGNATURE } from '../../sampleSignature'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Синие чернила: `penColor` задаёт цвет линий и на экране, и в файле. Толщина — `lineWidth`.',
			},
		},
	},
	args: { modelValue: SAMPLE_SIGNATURE, penColor: '#1d4ed8', lineWidth: 3 },
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('.base-signature-pad__ink')).toHaveAttribute('stroke-width', '3')
	},
}
