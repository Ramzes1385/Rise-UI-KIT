export function installDemoMicrophone(): () => void {
	const devices = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices
	if (!devices || typeof AudioContext === 'undefined') return () => undefined
	const original = devices.getUserMedia
	const contexts: AudioContext[] = []
	devices.getUserMedia = async () => {
		const context = new AudioContext()
		contexts.push(context)
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
		return destination.stream
	}
	return () => {
		devices.getUserMedia = original
		contexts.forEach(context => void context.close().catch(() => undefined))
	}
}

export function installDeniedMicrophone(): () => void {
	const devices = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices
	if (!devices) return () => undefined
	const original = devices.getUserMedia
	devices.getUserMedia = async () => {
		throw new DOMException('Permission denied', 'NotAllowedError')
	}
	return () => {
		devices.getUserMedia = original
	}
}
