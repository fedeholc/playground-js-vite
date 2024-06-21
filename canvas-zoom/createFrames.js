import { GlobalScreenLogger } from "./screenLogger.js";

/**
 * @param {number} pixelsShift
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} img
 * @param {("fitWidth" | "fitHeight")} fit adjust image to width or height
 */
export function createFramesPan2end(canvas, img, pixelsShift, fit) {
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
 * @param {number} pixelsShift
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImageElement} img
 */
export function createFramesZoomOut(canvas, img, cantidadFrames, pixelsShift) {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d");

    let videoFrames = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(step);
    let counter = 1;

    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      //adaptar para que encaje de altura
      /*   const height =
        canvas.height + cantidadFrames * pixelsShift - counter * pixelsShift;
      const newWidth = Math.round((canvas.height / img.height) * img.width);
      const width =
        newWidth + cantidadFrames * pixelsShift - counter * pixelsShift; */

      //adaptar para que encaje de ancho
      const width =
        canvas.width + cantidadFrames * pixelsShift - counter * pixelsShift;
      const newHeight = Math.round((canvas.width / img.width) * img.height);
      const height =
        newHeight + cantidadFrames * pixelsShift - counter * pixelsShift;

      //VER el redondear hacía que se viera mal cuando el scaleFactor era de 1 pixel. Habría que ver si dejarlo así o probar redondear tanto x e y como el width y height para que siempre tenga enteros divisibles por 2.
      //const x = Math.round(canvas.width / 2 - width / 2);
      //const y = Math.round(canvas.height / 2 - height / 2);

      const x = canvas.width / 2 - width / 2;
      const y = canvas.height / 2 - height / 2;

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
