import demoVoice from './media/demo-voice.webm'

export const DEMO_VOICE = demoVoice

export const DEMO_VOICE_DURATION = 9

export const DEMO_VOICE_PEAKS = Array.from({ length: 48 }, (_, index) => {
	const syllable = Math.abs(Math.sin((index / 48) * 9 * Math.PI * 1.3)) ** 1.5
	const pause = (index / 48) * 9 - Math.floor(((index / 48) * 9) / 3.1) * 3.1 < 2.6 ? 1 : 0.05
	return Math.round(Math.max(0.08, syllable * pause) * 100) / 100
})

export { default as DEMO_TALK } from './media/demo-talk.webm'

export const DEMO_TALK_DURATION = 24

export const DEMO_TALK_PEAKS = Array.from({ length: 64 }, (_, index) => {
	const time = (index / 64) * DEMO_TALK_DURATION
	const syllable = Math.abs(Math.sin(2 * Math.PI * 2.2 * time)) ** 3
	return Math.round(Math.max(0.1, (time % 4.2 < 3.4 ? 1 : 0.1) * (0.2 + 0.8 * syllable)) * 100) / 100
})
