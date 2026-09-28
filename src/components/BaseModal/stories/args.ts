import { fn } from 'storybook/test'
import type BaseModal from '../ui/BaseModal.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	isOpen: false,
	title: 'Удалить проект?',
	default: 'Проект «Сайт студии» и все его файлы будут удалены. Это действие нельзя отменить.',
	variant: 'default',
	sizeScale: 100,
	hasOverlay: true,
	closeOnOverlay: true,
	isContained: false,
	onClose: fn(),
	'onUpdate:isOpen': fn(),
} satisfies Meta<typeof BaseModal>['args']
