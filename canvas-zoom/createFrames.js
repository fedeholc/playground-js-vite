import { GlobalScreenLogger } from "./screenLogger.js";

/**
 * @param {number} pixelsShift
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} img
 */
export function createFramesPan2end(canvas, img, pixelsShift) {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d");

    let videoFrames = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(step);
    let counter = 1;

    function step() {
      console.log("step", counter, (img.width - canvas.width) / pixelsShift);
      GlobalScreenLogger.log(
        `step ${counter} de ${(img.width - canvas.width) / pixelsShift}`
      );
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
 * @param {number} cantidadFrames
 * @param {number} scaleFactor
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} img
 */
export function createFramesZoomOut(canvas, img, cantidadFrames, scaleFactor) {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d");

    let videoFrames = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(step);
    let counter = 1;

    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let newWidth = Math.round((canvas.height / img.height) * img.width);

      const width =
        newWidth + cantidadFrames * scaleFactor - counter * scaleFactor;
      const height =
        canvas.height + cantidadFrames * scaleFactor - counter * scaleFactor;

      const x = Math.round(canvas.width / 2 - width / 2);
      const y = Math.round(canvas.height / 2 - height / 2);

      ctx.drawImage(img, x, y, width, height);
      videoFrames.push(canvas.toDataURL("image/png"));
      counter++;
      if (counter <= cantidadFrames) {
        requestAnimationFrame(step);
      } else {
        resolve(videoFrames);
      }
    }
  });
}
