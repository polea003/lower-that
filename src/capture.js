import NodeWebcam from "node-webcam";


const options = {
    width: 512, // 512 is max pixel width for 'low' resolution requests to openai api
    height: 288, // 720 * 512/1280
    quality: 100,
    output: "jpeg",
    callbackReturn: "base64",
    // device: "/dev/video1",
    // verbose: true,
};

const Webcam = NodeWebcam.create(options);

export function captureImage() {
  return new Promise((resolve, reject) => {
    Webcam.capture("most_recent_capture", (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);  // data is your base64 string
    });
  });
}
