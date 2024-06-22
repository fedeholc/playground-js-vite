import { GlobalScreenLogger } from "./screenLogger.js";

/**
 * @param {number} pixelsShift
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} img
 */
export function createFramesPan2end(canvas, img, pixelsShift) {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return reject(new Error("Error obtaining 2d context from canvas"));
    }
    if (!img.complete) {
      return reject(new Error("Image not loaded"));
    }

    let videoFrames = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(step);
    let counter = 1;

    function step() {
      //console.log("step", counter, (img.width - canvas.width) / pixelsShift);
      //GlobalScreenLogger.log(`step ${counter} de ${(img.width - canvas.width) / pixelsShift}`);

      ctx.drawImage(img, 0 - counter * pixelsShift, 0, img.width, img.height);
      videoFrames.push(canvas.toDataURL("image/png"));
      counter++;
      if (counter * pixelsShift <= img.width - canvas.width) {
        requestAnimationFrame(step);
      } else {
        resolve(videoFrames);
      }
    }
  });
}

/**
 * @param {number} totalFrames
 * @param {number} pixelsShift
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} img
 * @param {("fitWidth" | "fitHeight")} fit adjust image to width or height

 */
export function createFramesZoomOut(
  canvas,
  img,
  totalFrames,
  pixelsShift,
  fit
) {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return reject(new Error("Error obtaining 2d context from canvas"));
    }
    if (!img.complete) {
      return reject(new Error("Image not loaded"));
    }

    let videoFrames = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(step);
    let counter = 1;

    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let height,
        width,
        newHeight,
        newWidth = 0;

      //adaptar para que encaje de altura
      if (fit === "fitHeight") {
        height =
          canvas.height + totalFrames * pixelsShift - counter * pixelsShift;
        newWidth = Math.round((canvas.height / img.height) * img.width);
        width = newWidth + totalFrames * pixelsShift - counter * pixelsShift;
      }

      //adaptar para que encaje de ancho
      if (fit === "fitWidth") {
        width =
          canvas.width + totalFrames * pixelsShift - counter * pixelsShift;
        newHeight = Math.round((canvas.width / img.width) * img.height);
        height = newHeight + totalFrames * pixelsShift - counter * pixelsShift;
      }

      //VER el redondear hacía que se viera mal cuando el scaleFactor era de 1 pixel. Habría que ver si dejarlo así o probar redondear tanto x e y como el width y height para que siempre tenga enteros divisibles por 2.
      //const x = Math.round(canvas.width / 2 - width / 2);
      //const y = Math.round(canvas.height / 2 - height / 2);

      const x = canvas.width / 2 - width / 2;
      const y = canvas.height / 2 - height / 2;

      ctx.drawImage(img, x, y, width, height);
      videoFrames.push(canvas.toDataURL("image/png"));
      counter++;
      if (counter <= totalFrames) {
        requestAnimationFrame(step);
      } else {
        resolve(videoFrames);
      }
    }
  });
}
