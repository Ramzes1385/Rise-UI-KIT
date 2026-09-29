import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { fakeMedia } from '../utils/BaseMediaPlayer.test-utils'
import { useMediaSources } from '../../model/core/useMediaSources'
import type { MediaSourceItem } from '../../types/playback/MediaCore.types'

const WEBM = { src: '/media/demo.webm', type: 'video/webm', label: '720p' }
const MP4 = { src: 'https://cdn.example.com/demo.mp4', type: 'video/mp4', label: '1080p' }

function setup(sources: MediaSourceItem[] | string | undefined, allowedProtocols?: readonly string[]) {
	const element = document.createElement('video')
	element.canPlayType = vi.fn((type: string) => (type.includes('webm') ? 'maybe' : ''))
	const media = ref<HTMLMediaElement | null>(element)
	const result = useMediaSources({ sources: () => sources, allowedProtocols: () => allowedProtocols, media })
	return { element, media, ...result }
}

describe('useMediaSources', () => {
	it('строка — один источник, undefined — пустой список', () => {
		expect(setup('/media/demo.webm').sources.value).toEqual([{ src: '/media/demo.webm' }])
		expect(setup(undefined).sources.value).toEqual([])
	})

	it('отбрасывает адреса с недопустимыми схемами', () => {
		const list = [
			{ src: 'javascript:alert(1)' },
			{ src: 'data:video/webm;base64,AAAA' },
			{ src: 'https://cdn.example.com/a.webm' },
			{ src: 'blob:https://example.com/5d2c' },
			{ src: 'media/b.webm' },
		]

		expect(setup(list).sources.value.map(item => item.src)).toEqual([
			'https://cdn.example.com/a.webm',
			'blob:https://example.com/5d2c',
			'media/b.webm',
		])
		expect(setup(list, ['https:']).sources.value.map(item => item.src)).toEqual(['https://cdn.example.com/a.webm', 'media/b.webm'])
	})

	it('играет первый источник, который поддерживает браузер', () => {
		const { playableSources, activeSource, media } = setup([MP4, WEBM, { src: '/media/any' }])

		expect(playableSources.value).toEqual([WEBM, { src: '/media/any' }])
		expect(activeSource.value).toEqual(WEBM)
		media.value = null
		expect(playableSources.value).toEqual([])
		expect(activeSource.value).toBeUndefined()
	})

	it('нет воспроизводимых источников — activeSource null', () => {
		expect(setup([MP4]).activeSource.value).toBeNull()
	})

	it('setSource переключает источник и продолжает с той же позиции', async () => {
		const { element, activeSource, setSource } = setup([WEBM, { src: '/media/other.webm' }])
		const fake = fakeMedia(element, { currentTime: 42, paused: false })

		setSource(WEBM)
		setSource({ src: '/media/other.webm' })
		expect(activeSource.value?.src).toBe('/media/other.webm')

		fake.update({ currentTime: 0 }, 'loadedmetadata')
		await flushPromises()
		expect(fake.values.currentTime).toBe(42)
		expect(fake.play).toHaveBeenCalledOnce()
	})

	it('отказ play() после переключения не выбрасывается', async () => {
		const { element, setSource } = setup([WEBM, { src: '/media/other.webm' }])
		const fake = fakeMedia(element, { paused: false })
		fake.play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'))

		setSource({ src: '/media/other.webm' })
		fake.emit('loadedmetadata')
		await flushPromises()
		expect(fake.play).toHaveBeenCalledOnce()
	})

	it('после переключения на паузе запись не запускается; без элемента просто выбирает источник', () => {
		const { element, media, activeSource, setSource } = setup([WEBM, { src: '/media/other.webm' }, { src: '/media/third.webm' }])
		const fake = fakeMedia(element, { currentTime: 7 })

		setSource({ src: '/media/other.webm' })
		fake.emit('loadedmetadata')
		expect(fake.play).not.toHaveBeenCalled()

		media.value = null
		setSource({ src: '/media/third.webm' })
		media.value = element
		expect(activeSource.value?.src).toBe('/media/third.webm')
	})

	it('выбранный источник, которого больше нет в списке, заменяется первым', () => {
		const first = { src: '/media/first.webm' }
		const list = ref<MediaSourceItem[]>([first, { src: '/media/other.webm' }])
		const { activeSource, setSource } = useMediaSources({ sources: () => list.value, media: ref(document.createElement('video')) })

		setSource({ src: '/media/other.webm' })
		list.value = [first]
		expect(activeSource.value).toEqual(first)
	})
})
