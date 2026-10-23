import type meta from '../../BaseModal.stories'
import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import BaseModal from '../../../ui/BaseModal.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'sizeScale']

const template = `
	<div class="story-grid" style="--story-grid-min: 300px;">
		<div v-for="preset in presets" :key="preset.name" class="story-frame" style="height: 200px;">
			<BaseModal v-bind="args" :is-open="true" is-contained :size-scale="preset.sizeScale" :title="preset.label">
				<BaseText>Текст в теле окна.</BaseText>
			</BaseModal>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: [
					'Размеры задаются `sizeScale`: пропорционально меняются ширина окна (500px при 100), отступы, кегль,',
					'кнопка закрытия и кнопки в подвале, если у них нет своего `sizeScale`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseModal', 'BaseText'],
				script: `const presets = ${literal(presets)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseModal, BaseText },
		setup: useStorySetup(args, { data: { presets }, slots: OWN_ARGS }),
		template,
	}),
}
