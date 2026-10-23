import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import { nextTick, reactive, ref } from 'vue'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'
import { useMediaMini } from '../../model/screen/useMediaMini'
import { withSetup } from '../utils/BaseMediaPlayer.test-utils'
import { MEDIA_PLAYER_PARTS } from '../../types/BaseMediaPlayer.types'
import type { MediaState } from '../../types/playback/MediaCore.types'
import { useMediaSidePanel } from '../../model/panels/useMediaSidePanel'
import { PLAYER_CONTEXT_KEY } from '../../model/player/usePlayerContext'

const SOURCE = '/media/demo.webm'
const VISIBLE_PARTS = ['media', 'cover', 'start', 'big-play', 'top', 'title', 'logo', 'controls', 'seek'] as const

function stubMedia() {
	vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
	vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
	vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
}

function partClasses(prefix: string): Record<string, string> {
	return Object.fromEntries(['root', ...MEDIA_PLAYER_PARTS].map(part => [part, `${prefix}-${part}`]))
}

describe('BaseMediaPlayer: проп ui', () => {
	beforeEach(stubMedia)

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		const { container } = render(BaseMediaPlayer, {
			props: {
				sources: SOURCE,
				title: 'Демо',
				poster: '/media/poster.webp',
				logo: '/media/logo.svg',
				ui: partClasses('u'),
				customClass: { controls: 'own-controls', title: 'own-title' },
			},
		})
		await nextTick()
		const root = container.querySelector('.base-media-player')!
		expect(root).toHaveClass('base-media-player', 'u-root')
		for (const part of VISIBLE_PARTS) expect(root.querySelector(`.base-media-player__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-media-player__controls')).toHaveClass('own-controls')
		expect(root.querySelector('.base-media-player__title')).toHaveClass('own-title')
		expect(root.querySelector('.base-media-player__top')).toHaveClass('base-media-player__top--logo-top-right')
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', () => {
		const { container } = render(BaseMediaPlayer, {
			props: { sources: SOURCE, title: 'Демо', ui: { title: 'own' } },
			global: {
				plugins: [createUiKitPlugin({ defaults: { BaseMediaPlayer: { ui: { title: 'app', root: 'app-root' } } } })],
			},
		})
		expect(container.querySelector('.base-media-player')).toHaveClass('app-root')
		expect(container.querySelector('.base-media-player__title')).toHaveAttribute('class', 'base-media-player__title app own')
		expect(container.querySelector('.base-media-player__media')).toHaveAttribute('class', 'base-media-player__media')
	})
})

describe('BaseMediaPlayer: движение', () => {
	afterEach(() => {
		document.documentElement.removeAttribute('data-rise-motion')
		vi.unstubAllGlobals()
	})

	function mini() {
		const root = ref<HTMLElement | null>(document.body.appendChild(document.createElement('div')))
		root.value!.scrollIntoView = vi.fn()
		const state = reactive({ isPaused: true }) as unknown as MediaState
		const { result } = withSetup(() => useMediaMini({ root, isEnabled: () => true, isFullscreen: () => false, state, pause: vi.fn() }))
		return { result, root }
	}

	it('«Развернуть» мини-плеер прокручивает плавно, при пресете none — сразу', () => {
		const smooth = mini()
		smooth.result.expandMini()
		expect(smooth.root.value?.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })

		document.documentElement.setAttribute('data-rise-motion', 'none')
		const instant = mini()
		instant.result.expandMini()
		expect(instant.root.value?.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'center' })
	})

	function sidePanel() {
		const rootRef = ref<HTMLElement | null>(document.body)
		let result!: ReturnType<typeof useMediaSidePanel>
		mount(
			{
				setup() {
					result = useMediaSidePanel({ trigger: '.trigger', focus: [], isOpen: () => false, close: vi.fn() })
					return () => null
				},
			},
			{ global: { provide: { [PLAYER_CONTEXT_KEY as symbol]: { rootRef } } } },
		)
		return result
	}

	it('длительность перехода боковой панели — от токенов движения, при пресете none — 0', () => {
		expect(sidePanel().transitionDuration.value).toEqual({ enter: 768, leave: 240 })
		document.documentElement.setAttribute('data-rise-motion', 'none')
		expect(sidePanel().transitionDuration.value).toEqual({ enter: 0, leave: 0 })
	})
})
