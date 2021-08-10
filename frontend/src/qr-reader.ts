import jsQR, { QRCode } from "jsqr";

const workerContext: Worker = self as any;

interface QRMessage {
  image: ImageData;
}

(async function run() {
  workerContext.addEventListener("message", async event => {
    const { image } = event.data as QRMessage;
    const qr = jsQR(image.data, image.width, image.height);
    workerContext.postMessage({ qr });
  });
})();
