import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import MediaControlBar from '../ui/MediaControlBar.vue'
import type { MediaMenuItem, MediaMenuList } from '../types/MediaMenu.types'

export interface FakeMediaValues {
	currentTime: number
	duration: number
	paused: boolean
	ended: boolean
	seeking: boolean
	volume: number
	muted: boolean
	playbackRate: number
	buffered: Array<[number, number]>
	error: { code: number } | null
}

const READONLY_KEYS = ['duration', 'paused', 'ended', 'seeking', 'error'] as const

const EVENT_BY_KEY = { volume: 'volumechange', muted: 'volumechange', playbackRate: 'ratechange' } as const

const INITIAL_VALUES: FakeMediaValues = {
	currentTime: 0,
	duration: Number.NaN,
	paused: true,
	ended: false,
	seeking: false,
	volume: 1,
	muted: false,
	playbackRate: 1,
	buffered: [],
	error: null,
}

function defineMediaProperties(element: HTMLMediaElement, values: FakeMediaValues, emit: (type: string) => void): void {
	READONLY_KEYS.forEach(key => Object.defineProperty(element, key, { configurable: true, get: () => values[key] }))
	Object.defineProperty(element, 'currentTime', {
		configurable: true,
		get: () => values.currentTime,
		set: (time: number) => {
			values.currentTime = time
		},
	})
	Object.entries(EVENT_BY_KEY).forEach(([key, event]) =>
		Object.defineProperty(element, key, {
			configurable: true,
			get: () => values[key as keyof typeof EVENT_BY_KEY],
			set: (value: never) => {
				values[key as keyof typeof EVENT_BY_KEY] = value
				emit(event)
			},
		}),
	)
	Object.defineProperty(element, 'buffered', {
		configurable: true,
		get: () => ({
			length: values.buffered.length,
			start: (index: number) => values.buffered[index][0],
			end: (index: number) => values.buffered[index][1],
		}),
	})
}

export function fakeMedia(element: HTMLMediaElement, initial: Partial<FakeMediaValues> = {}) {
	const values: FakeMediaValues = { ...INITIAL_VALUES, buffered: [], ...initial }
	const emit = (type: string): void => {
		element.dispatchEvent(new Event(type))
	}
	defineMediaProperties(element, values, emit)
	const play = vi.fn(async () => {
		values.paused = false
		values.ended = false
		emit('play')
		emit('playing')
	})
	const pause = vi.fn(() => {
		values.paused = true
		emit('pause')
	})
	const load = vi.fn()
	Object.assign(element, { play, pause, load })

	return {
		values,
		play,
		pause,
		load,
		emit,
		update(patch: Partial<FakeMediaValues>, event?: string): void {
			Object.assign(values, patch)
			if (event) emit(event)
		},
	}
}

export function domException(name: string): DOMException {
	return new DOMException(name, name)
}

export function withSetup<T>(composable: () => T) {
	let result!: T
	const wrapper = mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return { result, wrapper }
}

const MENU_KEYS = ['qualityMenu', 'audioMenu', 'captionMenu', 'chapterMenu']

export function playerMenu(wrapper: VueWrapper, name: string) {
	const list = (): MediaMenuList | undefined => {
		const state = wrapper.findComponent(MediaControlBar).vm as unknown as Record<string, MediaMenuList | undefined>
		return MENU_KEYS.map(key => state[key]).find(menu => menu?.title === name)
	}
	const items = (): MediaMenuItem[] => list()?.items ?? []
	const radios = (): MediaMenuItem[] => items().filter(item => item.isChecked !== undefined)
	return {
		exists: () => wrapper.find(`button[aria-label="${name}"]`).exists(),
		options: () => radios().map(item => item.label),
		checked: () => radios().find(item => item.isChecked)?.label,
		pick: (label: string) =>
			radios()
				.find(item => item.label === label)
				?.onSelect?.(),
		pickAt: (index: number) => radios()[index]?.onSelect?.(),
		select: (label: string) =>
			items()
				.find(item => item.label === label)
				?.onSelect?.(),
		submenu: (label: string) => items().find(item => item.label.startsWith(label))?.children?.items ?? [],
	}
}
