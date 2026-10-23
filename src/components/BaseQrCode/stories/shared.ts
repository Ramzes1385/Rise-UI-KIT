import BaseQrCode from '../ui/BaseQrCode.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const LOGO_SVG = [
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
	'<rect width="64" height="64" rx="14" fill="#4f46e5"/>',
	'<path d="M20 14h15c8 0 13 5 13 12 0 5-3 9-8 11l9 13h-9l-8-12h-4v12h-8zm8 7v10h7c3 0 5-2 5-5s-2-5-5-5z" fill="#fff"/>',
	'</svg>',
].join('')

export const QR_LOGO = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_SVG)}`

const QR_TEMPLATE = '<BaseQrCode v-bind="args" />'

export const QR_SOURCE = storySource({ template: QR_TEMPLATE, imports: ['BaseQrCode'] })

export const renderQr = (args: Record<string, unknown>) => ({
	components: { BaseQrCode },
	setup: useStorySetup(args),
	template: QR_TEMPLATE,
})
