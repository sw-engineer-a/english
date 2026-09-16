export function speak(text: string, level: number): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text.replace(/[^\p{L}\p{N}\s.,!?''-]/gu, ' '))
  utter.lang = 'en-US'
  utter.rate = level <= 2 ? 0.85 : level <= 4 ? 0.95 : 1
  utter.pitch = level <= 2 ? 1.15 : 1
  const voices = window.speechSynthesis.getVoices()
  const english = voices.find((v) => /en-US/i.test(v.lang) && /female|google|samantha|zira/i.test(v.name))
    ?? voices.find((v) => /en/i.test(v.lang))
  if (english) utter.voice = english
  window.speechSynthesis.speak(utter)
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}
