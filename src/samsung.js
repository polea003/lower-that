import { SamsungTvRemote, Keys } from "samsung-tv-remote";
import 'dotenv/config'

const remote = new SamsungTvRemote({
    ip: process.env.SAMSUNG_TV_IP_ADDRESS, 
    mac: process.env.SAMSUNG_TV_MAC_ADDRESS
})

export async function toggleMute() {
  // await remote.wakeTV()
  await remote.sendKey(Keys.KEY_MUTE)
}