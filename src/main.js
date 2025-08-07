import { captureImage } from "./capture.js";
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

async function main() {
    while (true) {
        captureImage();
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

main()
