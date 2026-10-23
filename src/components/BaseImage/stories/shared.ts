import { waitFor, expect } from 'storybook/test'
import { STORY_IMAGES, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const [SUNRISE, FOG, VALLEY] = STORY_IMAGES

export const GALLERY = STORY_IMAGES.slice(0, 5)

export const GALLERY_SRCS = GALLERY.map(image => image.src)

export async function expectImagesVisible(root: HTMLElement, count: number): Promise<void> {
	await waitFor(
		() => {
			const images = Array.from(root.querySelectorAll<HTMLImageElement>('.base-image__img'))
			expect(images).toHaveLength(count)
			for (const image of images) {
				expect(image.naturalWidth).toBeGreaterThan(0)
				expect(getComputedStyle(image).opacity).toBe('1')
			}
		},
		{ timeout: STORY_WAIT_TIMEOUT },
	)
}
