import NodeWebcam from "node-webcam";
import { analyzeImage } from './token.js'
import { toggleMute, isMuted } from "./samsung.js";

const options = {
    width: 512, // 512 is max pixel width for 'low' resolution requests to openai api
    height: 288, // 720 * 512/1280
    quality: 100,
    output: "jpeg",
    callbackReturn: "base64",
    device: "/dev/video1",
    // verbose: true,
};

const Webcam = NodeWebcam.create(options);

export function captureImage() {
    Webcam.capture("most_recent_capture", async function(err, data) {
        if (err) {
            console.error("Error capturing image:", err);
        } else { 
            const llmResponse = JSON.parse(await analyzeImage(data))
            console.log({ llmResponse })
            if (!isMuted && llmResponse.is_commercial) toggleMute()
            else if (isMuted && !llmResponse.is_commericial) toggleMute()
        }
    });
}
