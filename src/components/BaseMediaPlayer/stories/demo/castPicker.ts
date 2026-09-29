import { MEDIA_ICONS } from '../../types/controls/MediaIcon.types'

const DEMO_CAST_DEVICES = [
	{ name: 'Телевизор в гостиной', kind: 'Телевизор' },
	{ name: 'Проектор в кабинете', kind: 'Проектор' },
	{ name: 'Приставка в спальне', kind: 'Медиаприставка' },
]

const SEARCH_DELAY = 500

const PANEL_STYLE = [
	'position: fixed',
	'top: 12px',
	'right: 12px',
	'z-index: 2147483000',
	'width: min(320px, calc(100vw - 24px))',
	'padding: 16px 12px 12px',
	'border-radius: 12px',
	'background: #202124',
	'box-shadow: 0 12px 40px rgb(0 0 0 / 45%)',
	'color: #e8eaed',
	'font: 14px/1.4 system-ui, sans-serif',
].join(';')

const ROW_STYLE = [
	'display: flex',
	'align-items: center',
	'gap: 12px',
	'width: 100%',
	'padding: 10px',
	'border: 0',
	'border-radius: 8px',
	'background: transparent',
	'color: inherit',
	'font: inherit',
	'text-align: left',
	'cursor: pointer',
].join(';')

function element<K extends keyof HTMLElementTagNameMap>(tag: K, style: string, text = ''): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag)
	node.setAttribute('style', style)
	node.textContent = text
	return node
}

function castIcon(): SVGSVGElement {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	svg.setAttribute('viewBox', '0 0 640 512')
	svg.setAttribute('width', '24')
	svg.setAttribute('height', '24')
	svg.setAttribute('aria-hidden', 'true')
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	path.setAttribute('d', MEDIA_ICONS.cast)
	path.setAttribute('fill', '#8ab4f8')
	svg.append(path)
	return svg
}

function deviceButton(device: (typeof DEMO_CAST_DEVICES)[number], choose: (name: string) => void): HTMLButtonElement {
	const button = element('button', ROW_STYLE)
	button.type = 'button'
	const label = element('span', 'display: grid')
	label.append(element('span', 'font-weight: 600', device.name), element('span', 'color: #9aa0a6; font-size: 12px', device.kind))
	button.append(castIcon(), label)
	button.addEventListener('mouseenter', () => (button.style.background = 'rgb(255 255 255 / 8%)'))
	button.addEventListener('mouseleave', () => (button.style.background = 'transparent'))
	button.addEventListener('click', () => choose(device.name))
	return button
}

export function pickCastDevice(): Promise<string | null> {
	return new Promise(resolve => {
		const panel = element('div', PANEL_STYLE)
		panel.setAttribute('role', 'dialog')
		panel.setAttribute('aria-modal', 'true')
		panel.setAttribute('aria-label', 'Трансляция')
		const title = element('div', 'padding: 0 10px; font-size: 16px; font-weight: 600', 'Трансляция на устройство')
		const status = element('div', 'padding: 4px 10px 8px; color: #9aa0a6', 'Поиск устройств в сети…')
		status.setAttribute('role', 'status')
		const list = element('div', 'display: grid; gap: 2px')
		const cancel = element('button', `${ROW_STYLE}; justify-content: flex-end; color: #8ab4f8; font-weight: 600`, 'Отмена')
		cancel.type = 'button'
		const finish = (name: string | null): void => {
			document.removeEventListener('keydown', onKeydown, true)
			panel.remove()
			resolve(name)
		}
		const onKeydown = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') finish(null)
		}
		cancel.addEventListener('click', () => finish(null))
		document.addEventListener('keydown', onKeydown, true)
		panel.append(title, status, list, cancel)
		document.body.append(panel)
		window.setTimeout(() => {
			status.textContent = 'Устройства в вашей сети'
			list.append(...DEMO_CAST_DEVICES.map(device => deviceButton(device, finish)))
			list.querySelector('button')?.focus()
		}, SEARCH_DELAY)
	})
}
