//FIXME si la imagen tiene un número impar de pixeles da error el codec que genera el video. Checkiar si efectivamente es así, y si poniendo que el canvas tenga tamaño par se soluciona

// VER ojo, en lugar de usar 5 paràmetros y hacer que la imagen arranca desde una x negativa para que haga el crop centrado, se podria usar la de 9 parametros y seleccionar desde donde se cropea la imagen
// ver https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

import { GlobalScreenLogger } from "./screenLogger.js";
import { FFmpeg } from "@diffusion-studio/ffmpeg-js";
import { createFramesPan2end, createFramesZoomOut } from "./createFrames.js";

const screenLogDiv = document.getElementById("screen-log");

GlobalScreenLogger.init(screenLogDiv);
GlobalScreenLogger.log("Hola, mundo!");
GlobalScreenLogger.log("Este es otro mensaje.");

const canvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("mi-canvas")
);
const ctx = canvas.getContext("2d");

const imageLoader = document.getElementById("image-loader");
imageLoader.addEventListener("change", handleUpload, false);

document.querySelector("#btn-pan2end").addEventListener("click", handlePan2end);

document
  .querySelector("#btn-zoom-out")
  .addEventListener("click", handleZoomOut);

const ffmpeg = new FFmpeg({
  config: "gpl-extended",
});

let img = new Image();

/**
 * @param {Event} e
 */
function handleUpload(e) {
  console.log("inicio de handleImage");
  const reader = new FileReader();
  reader.onload = function (event) {
    img.onload = function () {
      canvas.height = 1920 / 4; //VER
      canvas.width = 1080 / 4;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let oldHeight = img.height;
      let oldWidth = img.width;
      img.height = canvas.height;
      img.width = oldWidth * (canvas.height / oldHeight);
      console.log(img.height, img.width);
      ctx.drawImage(img, 0, 0, img.width, img.height);
      ctx.drawImage(
        img,
        (canvas.width - img.width) / 2,
        0,
        img.width,
        img.height
      );
    };

    if (typeof event.target.result === "string") {
      img.src = event.target.result;
    } else {
      console.error("No se pudo cargar la imagen");
      //TODO: ver cómo hice la carga de archivo y manejo de errores en fotoyop
    }
  };
  const input = /** @type {HTMLInputElement} */ (e.target);
  reader.readAsDataURL(input.files[0]);
}

async function handlePan2end() {
  //var inicio = Date.now();
  //console.log("start creación frames  ", Date.now());
  let videoFrames = await createFramesPan2end(canvas, img, 2);
  //console.log("fin creación frames  ", Date.now() - inicio);

  //var inicio = Date.now();
  //console.log("inicio de ffmpeg", Date.now());
  let video = await createVideo(videoFrames);
  //console.log("fin ffmpeg  ", Date.now() - inicio);
  downloadVideo(video);
}

async function handleZoomOut() {
  //var inicio = Date.now();
  //console.log("start creación frames  ", Date.now());
  let videoFrames = await createFramesZoomOut(canvas, img, 60, 2);
  //console.log("fin creación frames  ", Date.now() - inicio);

  //var inicio = Date.now();
  //console.log("inicio de ffmpeg", Date.now());
  let video = await createVideo(videoFrames);
  //console.log("fin ffmpeg  ", Date.now() - inicio);
  downloadVideo(video);
}

//TODO: catch del error para el reject?
/**
 * @param {string[]} videoFrames
 */
async function createVideo(videoFrames) {
  return new Promise((resolve, reject) => {
    ffmpeg.whenReady(async () => {
      for (let i = 0; i < videoFrames.length; i++) {
        console.log("frame", i);
        await ffmpeg.writeFile(`input${i + 1}.png`, videoFrames[i]);
      }

      // no cambiar el orden de estos parametros porque se rompe
      await ffmpeg.exec([
        "-framerate",
        "30",
        "-i",
        "input%d.png", // Plantilla de entrada
        "-vf",
        "tpad=stop_mode=clone:stop_duration=5", // Filtro para extender el último frame
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "output.mp4",
      ]);

      let rta = ffmpeg.readFile("output.mp4");
      resolve(rta);
    });
  });
}

/**
 * @param {{ buffer: BlobPart; }} rta
 */
function downloadVideo(rta) {
  const blob = new Blob([rta.buffer], { type: "video/mp4" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "video.mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
