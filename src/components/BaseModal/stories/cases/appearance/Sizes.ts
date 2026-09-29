import type meta from '../../BaseModal.stories'
import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import BaseModal from '../../../ui/BaseModal.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

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
			source: {
				code: SIZE_PRESETS.map(
					preset => `<BaseModal v-model:is-open="isOpen" :size-scale="${preset.sizeScale}" title="${preset.name}">…</BaseModal>`,
				).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseModal, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS, 'sizeScale']), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-grid" style="--story-grid-min: 300px;">
				<div v-for="preset in presets" :key="preset.name" class="story-frame" style="height: 200px;">
					<BaseModal v-bind="props" :is-open="true" is-contained :size-scale="preset.sizeScale" :title="sizeLabel(preset)">
						<BaseText>Текст в теле окна.</BaseText>
					</BaseModal>
				</div>
			</div>
		`,
	}),
}
