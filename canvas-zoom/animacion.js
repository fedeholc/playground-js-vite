// Procedimiento para calcular zoom out
/* 
primero hay que calcular la posición final para luego ver cuántos pixeles hacia afuera hay que irse
En esa posición final si la imagen no es 9 x 16, puede quedar cropeada o achicada (quedando un video de otra proporcion o agregandole margenes probablemente por arriba y por abajo, si es una imagen 2 x 3)
Para el caso de crop, si la imagen no es 9 x 16 probablemente sea de un ratio mayor, como 2 x 3. En ese caso la imagen va a quedar...?

*/

//FIXME si la imagen tiene un número impar de pixeles da error el codec que genera el video.

import { FFmpeg } from "@diffusion-studio/ffmpeg-js";

const canvas = document.getElementById("miCanvas");
//const canvas = new OffscreenCanvas(100, 100);
const ctx = canvas.getContext("2d");
const imageLoader = document.getElementById("imageLoader");
imageLoader.addEventListener("change", handleImage, false);

document.querySelector("#download").addEventListener("click", downloadFrames);

document
  .querySelector("#frames")
  //.addEventListener("click", () => crearFrames(48, 1, 1.001));
  //.addEventListener("click", () => animateZoom(48, 1, 1.001));
  //.addEventListener("click", () => animatePan(240, 1, 1.001));
  .addEventListener("click", () => animateZoomOut(60, 2, 0.99));

const ffmpeg = new FFmpeg({
  config: "gpl-extended",
});

let img = new Image();
const frames = [];

function handleImage(e) {
  console.log("inicio de handleImage");
  const reader = new FileReader();
  reader.onload = function (event) {
    img.onload = function () {
      /*canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      */

      // para adaptar a un canvas de 1080 x 1920 9 x 16
      // este caso serìa para una imagen de otra prop mayor a 9 x 16,
      // por lo que se va a ver cropeada
      // VER ojo, en lugar de usar 5 paràmetros y hacer que la imagen arranca desde una x negativa para que haga el crop centrado, se podria usar la de 9 parametros y seleccionar desde donde se cropea la imagen
      // ver https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
      
      canvas.height = 1920;
      canvas.width = 1080;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let newWidth = (canvas.height / img.height) * img.width;
      ctx.drawImage(
        img,
        (canvas.width - newWidth) / 2,
        0,
        newWidth,
        canvas.height
      );
    };

    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

function animatePan(cantidadFrames, scale, scaleFactor) {
  // Limpia el canvas
  let inicio = Date.now();
  console.log("start creación frames  ", Date.now());
  canvas.height = img.height;
  canvas.width = img.height * 0.8;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(step);
  let counter = 0;

  function step(timestamp) {
    console.log("step", counter);
    // Calcula la posición y tamaño de la imagen
    const width = img.width;
    const height = img.height;
    const x = 0 - counter * 2;
    const y = 0;
    // Dibuja la imagen escalada
    ctx.drawImage(img, x, y, width, height);
    frames.push(canvas.toDataURL("image/png")); // Guarda el cuadro actual
    counter++;
    if (counter < cantidadFrames) {
      requestAnimationFrame(step);
    } else {
      console.log("fin creación frames  ", Date.now() - inicio);
    }
  }
}

function animateZoom(cantidadFrames, scale, scaleFactor) {
  // Limpia el canvas
  let inicio = Date.now();
  console.log("start creación frames  ", Date.now());

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(step);
  let counter = 0;

  function step(timestamp) {
    // Calcula la posición y tamaño de la imagen
    const width = img.width * scale;
    const height = img.height * scale;
    const x = canvas.width / 2 - width / 2;
    const y = canvas.height / 2 - height / 2;
    // Dibuja la imagen escalada
    ctx.drawImage(img, x, y, width, height);
    frames.push(canvas.toDataURL("image/png")); // Guarda el cuadro actual
    scale *= scaleFactor;
    counter++;
    if (counter < cantidadFrames) {
      requestAnimationFrame(step);
    } else {
      console.log("fin creación frames  ", Date.now() - inicio);
    }
  }
}

function animateZoomOut(cantidadFrames, scale, scaleFactor) {
  // Limpia el canvas
  let inicio = Date.now();
  console.log("start creación frames  ", Date.now());

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(step);
  let counter = 0;

  function step(timestamp) {
    // Calcula la posición y tamaño de la imagen
    //TODO: acà multiplicaba por scale factor, lo cambie para probar
    const width = img.width * 1.5 - counter;
    const height = img.height * 1.5 - counter;
    const x = canvas.width / 2 - width / 2;
    const y = canvas.height / 2 - height / 2;
    // Dibuja la imagen escalada
    ctx.drawImage(img, x, y, width, height);
    frames.push(canvas.toDataURL("image/png")); // Guarda el cuadro actual
    scale *= scaleFactor;
    counter++;
    if (counter < cantidadFrames) {
      requestAnimationFrame(step);
    } else {
      console.log("fin creación frames  ", Date.now() - inicio);
    }
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
      "30", // Velocidad de fotogramas, ajusta según tus necesidades
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
  let inicio = Date.now();
  console.log("start creación frames  ", Date.now());
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
  console.log("fin creación frames  ", Date.now() - inicio);
}
