export async function demoMicrophoneStream(): Promise<MediaStream> {
	const context = new AudioContext()
	const voice = context.createOscillator()
	const envelope = context.createGain()
	const syllables = context.createOscillator()
	const depth = context.createGain()
	const destination = context.createMediaStreamDestination()
	voice.frequency.value = 196
	syllables.frequency.value = 2.3
	envelope.gain.value = 0
	depth.gain.value = 0.5
	syllables.connect(depth).connect(envelope.gain)
	voice.connect(envelope).connect(destination)
	voice.start()
	syllables.start()
	void context.resume().catch(() => undefined)
	for (const track of destination.stream.getTracks()) {
		const stopTrack = track.stop.bind(track)
		track.stop = () => {
			stopTrack()
			void context.close().catch(() => undefined)
		}
	}
	return destination.stream
}

export async function deniedMicrophoneStream(): Promise<MediaStream> {
	throw new DOMException('Permission denied', 'NotAllowedError')
}
