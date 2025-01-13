import { captureImage } from "./capture.js";
import 'dotenv/config'

async function main() {
    while (true) {
        captureImage();
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

main()
