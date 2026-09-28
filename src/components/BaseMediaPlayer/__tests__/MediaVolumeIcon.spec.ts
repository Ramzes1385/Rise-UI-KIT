import { render } from '@testing-library/vue'
import MediaVolumeIcon from '../ui/MediaVolumeIcon.vue'

function arcs(volume: number, isMuted = false) {
	const { container } = render(MediaVolumeIcon, { props: { volume, isMuted } })
	const svg = container.querySelector('svg') as SVGElement
	const [near, far] = Array.from(svg.querySelectorAll<SVGPathElement>('.base-media-player__volume-arc'), arc => arc.style.opacity)
	return { near, far, isSilent: svg.classList.contains('base-media-player__volume-icon--silent') }
}

describe('MediaVolumeIcon', () => {
	it.each([
		[1, '1', '1'],
		[0.75, '1', '0.5'],
		[0.5, '1', '0'],
		[0.25, '0.5', '0'],
	])('громкость %d: ближняя дуга %s, дальняя %s', (volume, near, far) => {
		expect(arcs(volume)).toEqual({ near, far, isSilent: false })
	})

	it('без звука и на нулевой громкости дуги гаснут и появляется крестик', () => {
		expect(arcs(0.8, true)).toEqual({ near: '0', far: '0', isSilent: true })
		expect(arcs(0)).toEqual({ near: '0', far: '0', isSilent: true })
	})
})
