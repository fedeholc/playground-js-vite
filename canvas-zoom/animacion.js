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

const formUpload = document.querySelector("#form-upload");
formUpload.addEventListener("click", handleUploadFormClick);
formUpload.addEventListener("input", handleUpload);
console.log(formUpload);

function handleUploadFormClick() {
  /** @type {HTMLInputElement} */
  let input = document.querySelector("#input-upload");
  input.click();
}

const dropContainer = document.querySelector("#drop-container");
dropContainer.addEventListener("dragover", handleDragOver);
dropContainer.addEventListener("drop", handleDrop);
dropContainer.addEventListener("dragleave", handleDragLeave);

/**
 * @param {Event} e
 */
function handleDragOver(e) {
  e.preventDefault();
  let dropTitles = document.querySelectorAll(".drop-title");
  dropTitles.forEach((title) => {
    title.classList.add("drop-title-dragover");
  });

  let dropContainer = document.querySelector(".drop-container");
  dropContainer?.classList.add("drop-container-dragover");
}

function handleDragLeave() {
  let dropTitles = document.querySelectorAll(".drop-title");
  dropTitles.forEach((title) => {
    title.classList.remove("drop-title-dragover");
  });
  let dropContainer = document.querySelector(".drop-container");
  dropContainer?.classList.remove("drop-container-dragover");
}

/**
 * @param {DragEvent} e
 */
function handleDrop(e) {
  e.preventDefault();
  handleDragLeave();
  const files = [];

  if (e.dataTransfer.items) {
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      if (e.dataTransfer.items[i].kind === "file") {
        const file = e.dataTransfer.items[i].getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }
  }
  if (files.length > 0) {
    loadImage(files[0]);
    setUploadedUI();
  }
}

const inputPixelsShift = /** @type {HTMLInputElement} */ (
  document.querySelector("#pixels-shift")
);
const inputFrameRate = /** @type {HTMLInputElement} */ (
  document.querySelector("#frame-rate")
);
const inputLastFrameDuration = /** @type {HTMLInputElement} */ (
  document.querySelector("#last-frame-duration")
);
const inputTotalFrames = /** @type {HTMLInputElement} */ (
  document.querySelector("#total-frames")
);
const inputCanvasHeight = /** @type {HTMLInputElement} */ (
  document.querySelector("#canvas-height")
);
const inputCanvasWidth = /** @type {HTMLInputElement} */ (
  document.querySelector("#canvas-width")
);
const inputDivideBy = /** @type {HTMLInputElement} */ (
  document.querySelector("#divide-by")
);
const selectZoomFit = /** @type {HTMLSelectElement} */ (
  document.querySelector("#zoom-fit")
);

const canvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("mi-canvas")
);

const uploadedImage = document.querySelector("#uploaded-image");
const uploadedImageContainer = document.querySelector(
  "#uploaded-image-container"
);
uploadedImageContainer.classList.add("hidden");
uploadedImageContainer.classList.remove("uploaded-image-container");

const restartButton = document.querySelector("#restart-button");
restartButton.addEventListener("click", handleRestartButton);

const restartContainer = document.querySelector("#restart-container");
restartContainer.classList.remove("restart-container");
restartContainer.classList.add("hidden");

const ctx = canvas.getContext("2d");

const imageLoader = document.getElementById("input-upload");
imageLoader.addEventListener("change", handleUpload, false);

document.querySelector("#btn-pan2end").addEventListener("click", handlePan2end);

document
  .querySelector("#btn-zoom-out")
  .addEventListener("click", handleZoomOut);

const ffmpeg = new FFmpeg({
  config: "gpl-extended",
});

let img = new Image();

function handleRestartButton() {
  formUpload.classList.remove("hidden");
  restartContainer.classList.add("hidden");
  restartContainer.classList.remove("restart-container");
  uploadedImage.setAttribute("src", "");
  uploadedImageContainer.classList.add("hidden");
  uploadedImageContainer.classList.remove("uploaded-image-container");
}

/**
 * @param {Event} e
 */
function handleUpload(e) {
  const input = /** @type {HTMLInputElement} */ (e.target);
  loadImage(input.files[0]);
  setUploadedUI();
}

function setUploadedUI() {
  formUpload.classList.add("hidden");
  restartContainer.classList.remove("hidden");
  restartContainer.classList.add("restart-container");
  uploadedImageContainer.classList.remove("hidden");
  uploadedImageContainer.classList.add("uploaded-image-container");
}
/**
 * @param {Blob} file
 */
function loadImage(file) {
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

      //imagen desde la izquierda
      //ctx.drawImage(img, 0, 0, img.width, img.height);

      //imagen centrada
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
      uploadedImage.setAttribute("src", event.target.result);
    } else {
      console.error("No se pudo cargar la imagen");
      //TODO: ver cómo hice la carga de archivo y manejo de errores en fotoyop
    }
  };
  reader.readAsDataURL(file);
}

function configSizes() {
  let divideBy = parseInt(inputDivideBy.value);
  canvas.height = parseInt(inputCanvasHeight.value) / divideBy;
  canvas.width = parseInt(inputCanvasWidth.value) / divideBy;

  //adapta la imagen al canvas considerando encajar la altura
  //por lo que en una imagen vertical que sea 2 x 3, si el canvas es 9x16, la imagen se va a ver con un crop en los costados
  //TODO: también habría que ver si hay que poner una opción para cambiar esto, y ver también si afecta a los efectos como el de zoom que puede tener fit por ancho o por alto
  let oldHeight = img.height;
  let oldWidth = img.width;
  img.height = canvas.height;
  img.width = oldWidth * (canvas.height / oldHeight);
}

async function handlePan2end() {
  //var inicio = Date.now();
  //console.log("start creación frames  ", Date.now());

  // sets the canvas size and the image size acording to the inputs
  configSizes();

  let videoFrames = await createFramesPan2end(
    canvas,
    img,
    parseInt(inputPixelsShift.value)
  );
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

  // sets the canvas size and the image size acording to the inputs
  configSizes();

  /** @type {"fitHeight" | "fitWidth"} */
  let zoomFit = "fitHeight";
  if (selectZoomFit.value === "fitWidth") {
    zoomFit = "fitWidth";
  }

  let videoFrames = await createFramesZoomOut(
    canvas,
    img,
    parseInt(inputTotalFrames.value),
    parseInt(inputPixelsShift.value),
    zoomFit
  );
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
        `${inputFrameRate.value}`,
        "-i",
        "input%d.png", // Plantilla de entrada
        "-vf",
        `tpad=stop_mode=clone:stop_duration=${inputLastFrameDuration.value}`, // Filtro para extender el último frame
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
 * @param {{ buffer: BlobPart; }} video
 */
function downloadVideo(video) {
  const blob = new Blob([video.buffer], { type: "video/mp4" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "video.mp4";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
