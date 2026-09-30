import { ref } from 'vue'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseRequisiteInput.stories'
import BaseRequisiteInput from '../../../ui/BaseRequisiteInput.vue'

export const Company: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Реквизиты организации: все значения верны. Расчётный и корреспондентский счёт проверяются по БИК из соседнего поля.',
			},
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseRequisiteInput },
		setup: () => ({
			args,
			values: ref({
				inn: '7707083893',
				kpp: '773601001',
				ogrn: '1027700132195',
				bik: '044525225',
				account: '40702810938000000001',
				correspondentAccount: '30101810400000000225',
				snils: '11223344595',
			}),
		}),
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; max-width: 800px">
				<BaseRequisiteInput v-model="values.inn" kind="inn" :variant="args.variant" :size-scale="args.sizeScale" />
				<BaseRequisiteInput v-model="values.kpp" kind="kpp" :variant="args.variant" :size-scale="args.sizeScale" />
				<BaseRequisiteInput v-model="values.ogrn" kind="ogrn" :variant="args.variant" :size-scale="args.sizeScale" />
				<BaseRequisiteInput v-model="values.bik" kind="bik" :variant="args.variant" :size-scale="args.sizeScale" />
				<BaseRequisiteInput v-model="values.account" kind="account" :bik="values.bik" :variant="args.variant" :size-scale="args.sizeScale" />
				<BaseRequisiteInput
					v-model="values.correspondentAccount"
					kind="correspondentAccount"
					:bik="values.bik"
					:variant="args.variant"
					:size-scale="args.sizeScale" />
				<BaseRequisiteInput v-model="values.snils" kind="snils" label="СНИЛС директора" :variant="args.variant" :size-scale="args.sizeScale" />
			</div>`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('СНИЛС директора')).toHaveValue('112-233-445 95')
		for (const field of canvas.getAllByRole('textbox')) await expect(field).not.toHaveAttribute('aria-invalid', 'true')
	},
}
