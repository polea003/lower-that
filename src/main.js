import { captureImage } from "./capture.js";
import { analyzeImage } from './analyze.js'
import { toggleMute } from "./samsung.js";
import dotenv from 'dotenv'
import readline from "readline";

dotenv.config({ path: '../.env' })

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function chooseContentType() {
  console.log("What are you watching?");
  console.log("  1) Sporting event");
  console.log("  2) Black & white movie");
  console.log("  3) Custom");

  const choice = await askQuestion("> ");
  if (choice === "1")    return "sporting event or related broadcast pieces like interviews and analysis";
  if (choice === "2")    return "a black and white movie";
  
  // custom
  const custom = await askQuestion("Enter your custom description: ");
  return custom || "sporting event or related broadcast pieces like interviews and analysis";
}

async function main() {
  const contentDescription = await chooseContentType();
  let isMuted = false

  while (true) {
    try {
      const imgBase64 = await captureImage();
      const rawJson   = await analyzeImage(imgBase64, contentDescription);
      const llmResponse = JSON.parse(rawJson);

      console.log({ llmResponse });

      if (!isMuted && llmResponse.should_mute_tv) {
        console.log("muting…");
        toggleMute();
        isMuted = true;
      }
      else if (isMuted && !llmResponse.should_mute_tv) {
        console.log("unmuting…");
        toggleMute();
        isMuted = false;
      }
    } catch (err) {
      console.error("Capture or analysis failed:", err);
    }

    // wait 5 seconds before next frame
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

main();
