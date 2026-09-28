import type meta from '../Colors.stories'
import { templateSource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'

const PALETTES = ['primary', 'neutral', 'success', 'info', 'warning', 'error']

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const template = `
			<div class="fnd" style="gap: 12px;">
				<div v-for="palette in palettes" :key="palette" class="fnd-palette">
					<span class="fnd-palette__name">{{ palette }}</span>
					<span v-for="shade in shades" :key="shade" class="fnd-palette__shade">
						<span class="fnd-palette__chip" :style="{ background: 'var(--rise-color-' + palette + '-' + shade + ')' }" />
						{{ shade }}
					</span>
				</div>
			</div>
		`

export const Palettes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Палитры ролей (оттенки Tailwind: orange, zinc, green, blue, amber, red). Чтобы сменить бренд,',
					'переопределите `--rise-color-primary-50 … 950` на `:root` — семантические токены обеих тем пересчитаются.',
				].join('\n'),
			},
			source: { code: templateSource(template) },
		},
	},
	render: () => ({
		setup: () => ({ palettes: PALETTES, shades: SHADES }),
		template,
	}),
}
