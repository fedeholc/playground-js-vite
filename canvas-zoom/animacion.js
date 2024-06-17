import { FFmpeg } from "@diffusion-studio/ffmpeg-js";

const canvas = document.getElementById("miCanvas");
//const canvas = new OffscreenCanvas(100, 100);
const ctx = canvas.getContext("2d");
const imageLoader = document.getElementById("imageLoader");
imageLoader.addEventListener("change", handleImage, false);

document.querySelector("#download").addEventListener("click", downloadFrames);

document
  .querySelector("#frames")
  .addEventListener("click", () => crearFrames(48, 1, 1.001));

const ffmpeg = new FFmpeg({
  config: "gpl-extended",
});

let img = new Image();
let scale = 1;
const scaleFactor = 1.001; // Factor de aumento de escala en cada cuadro
const frames = [];
let frameConunter = 0;

function handleImage(e) {
  console.log("inicio de handleImage");
  const reader = new FileReader();
  reader.onload = function (event) {
    img.onload = function () {
      scale = 1; // VER OJO Reinicia la escala
      canvas.width = img.width;
      canvas.height = img.height;
      //animateZoom();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      //crearFrames(48, 1, 1.001);
    };

    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

function animateZoom(timestamp) {
  requestAnimationFrame(step);
}

function step() {
  // Limpia el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calcula la posición y tamaño de la imagen
  const width = img.width * scale;
  const height = img.height * scale;
  const x = canvas.width / 2 - width / 2;
  const y = canvas.height / 2 - height / 2;

  // Dibuja la imagen escalada
  ctx.drawImage(img, x, y, width, height);

  frames.push(canvas.toDataURL("image/png")); // Guarda el cuadro actual

  // Aumenta la escala
  scale *= scaleFactor;

  if (frameConunter < 48) {
    frameConunter++;
    requestAnimationFrame(step);
  } else {
    console.log("Animación de zoom terminada");
  }
}

function downloadFrames() {
  ffmpeg.whenReady(async () => {
    console.log("inicio de ffmpeg");

    frames.forEach(async (frame, index) => {
      await ffmpeg.writeFile(`input${index + 1}.png`, frames[index]);
    });

    //VER ojo, no cambiar el orden de estos parametros porque se rompe
    await ffmpeg.exec([
      "-framerate",
      "12", // Velocidad de fotogramas, ajusta según tus necesidades
      "-i",
      "input%d.png", // Plantilla de entrada
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "output.mp4", // Archivo de salida
    ]);

    let rta = ffmpeg.readFile("output.mp4");

    console.log("fin de ffmpeg");
    const blob = new Blob([rta.buffer], { type: "video/mp4" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

function crearFrames(cantidadFrames, scale, scaleFactor) {
  console.log("inicio creación frames  ");
  // Limpia el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calcula la posición y tamaño de la imagen
  for (let i = 0; i < cantidadFrames; i++) {
    const width = img.width * scale;
    const height = img.height * scale;
    const x = canvas.width / 2 - width / 2;
    const y = canvas.height / 2 - height / 2;

    // Dibuja la imagen escalada
    ctx.drawImage(img, x, y, width, height);

    frames.push(canvas.toDataURL("image/png")); // Guarda el cuadro actual

    // Aumenta la escala
    scale *= scaleFactor;
  }
  console.log("fin creación frames  ");
}
