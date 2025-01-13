import { SamsungTvRemote, Keys } from "samsung-tv-remote";

export let isMuted = false

const remote = new SamsungTvRemote({
    ip: '192.168.0.13',
    mac: 'e0:9d:13:ac:d4:a4'
})

export async function toggleMute() {
  isMuted = !isMuted
  // await remote.wakeTV()
  await remote.sendKey(Keys.KEY_MUTE)
}