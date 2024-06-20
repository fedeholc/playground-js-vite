// Procedimiento para calcular zoom out
/* 
primero hay que calcular la posición final para luego ver cuántos pixeles hacia afuera hay que irse
En esa posición final si la imagen no es 9 x 16, puede quedar cropeada o achicada (quedando un video de otra proporcion o agregandole margenes probablemente por arriba y por abajo, si es una imagen 2 x 3)
Para el caso de crop, si la imagen no es 9 x 16 probablemente sea de un ratio mayor, como 2 x 3. En ese caso la imagen va a quedar...?

*/

//FIXME si la imagen tiene un número impar de pixeles da error el codec que genera el video.

import { FFmpeg } from "@diffusion-studio/ffmpeg-js";

const canvas = /** @type {HTMLCanvasElement} */ (
  document.getElementById("mi-canvas")
);
//const canvas = new OffscreenCanvas(100, 100);
const ctx = canvas.getContext("2d");
const imageLoader = document.getElementById("image-loader");
imageLoader.addEventListener("change", handleImage, false);

document.querySelector("#download").addEventListener("click", downloadFrames);

document
  .querySelector("#frames")
  //.addEventListener("click", () => crearFrames(48, 1, 1.001));
  //.addEventListener("click", () => animateZoom(48, 1, 1.001));
  //.addEventListener("click", () => animatePan(240, 1, 1.001));
  //.addEventListener("click", () => animateZoomOut(60, 2, 0.99));
  //.addEventListener("click", () => animateZoomOutTest(60, 2, 2));
  .addEventListener("click", () => animatePan2(0, 1, 2));

const ffmpeg = new FFmpeg({
  config: "gpl-extended",
});

let img = new Image();
const frames = [];

/**
 * @param {Event} e 
 */
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

      /* canvas.height = 1920;
      canvas.width = 1080;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let newWidth = (canvas.height / img.height) * img.width;
      ctx.drawImage(
        img,
        (canvas.width - newWidth) / 2,
        0,
        newWidth,
        canvas.height
      );*/

      canvas.height = 1920 / 2.5;
      canvas.width = 1080 / 2.5;
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

/**
 * @param {number} cantidadFrames
 * @param {number} scale
 * @param {number} scaleFactor
 */
function animatePan(cantidadFrames, scale, scaleFactor) {
  // Limpia el canvas
  let inicio = Date.now();
  console.log("start creación frames  ", Date.now());
  canvas.height = img.height;
  canvas.width = img.height * 0.8;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(step);
  let counter = 0;

  /**
   * @param {any} timestamp
   */
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

/**
 * @param {number} cantidadFrames
 * @param {number} scale
 * @param {number} scaleFactor
 */
function animatePan2(cantidadFrames, scale, scaleFactor) {
  // Limpia el canvas
  let inicio = Date.now();
  console.log("start creación frames  ", Date.now());

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(step);
  let counter = 1;

  /**
   * @param {any} timestamp
   */
  function step(timestamp) {
    // Dibuja la imagen escalada
    console.log("step", counter, (img.width - canvas.width) / scaleFactor);
    ctx.drawImage(img, 0 - counter * scaleFactor, 0, img.width, img.height);
    frames.push(canvas.toDataURL("image/png")); // Guarda el cuadro actual
    counter++;
    if (counter * scaleFactor <= img.width - canvas.width) {
      requestAnimationFrame(step);
    } else {
      /*   for (let i = 0; i < 30; i++) {
        frames.push(canvas.toDataURL("image/png"));
      } */
      console.log("fin creación frames  ", Date.now() - inicio);
    }
  }
}

/**
 * @param {number} cantidadFrames
 * @param {number} scale
 * @param {number} scaleFactor
 */
function animateZoom(cantidadFrames, scale, scaleFactor) {
  // Limpia el canvas
  let inicio = Date.now();
  console.log("start creación frames  ", Date.now());

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(step);
  let counter = 0;

  /**
   * @param {any} timestamp
   */
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

/**
 * @param {number} cantidadFrames
 * @param {any} scale
 * @param {number} scaleFactor
 */
function animateZoomOutTest(cantidadFrames, scale, scaleFactor) {
  // Limpia el canvas
  let inicio = Date.now();
  console.log("start creación frames  ", Date.now());

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(step);
  let counter = 1;

  /**
   * @param {any} timestamp
   */
  function step(timestamp) {
    let newWidth = Math.round((canvas.height / img.height) * img.width);
    /*   ctx.drawImage(
      img,
      (canvas.width - newWidth) / 2,
      0,
      newWidth,
      canvas.height
    ); */
    // Calcula la posición y tamaño de la imagen
    //TODO: acà multiplicaba por scale factor, lo cambie para probar
    //FIXME no estaría funcionando, al menos no se ve que se anime en pantalla
    // pero se colgaba en la netbook, probar bien.
    const width =
      newWidth + cantidadFrames * scaleFactor - counter * scaleFactor;
    const height =
      canvas.height + cantidadFrames * scaleFactor - counter * scaleFactor;

    const x = Math.round(canvas.width / 2 - width / 2);
    const y = Math.round(canvas.height / 2 - height / 2);
    // Dibuja la imagen escalada
    console.log(x, y, width, height);
    ctx.drawImage(img, x, y, width, height);
    frames.push(canvas.toDataURL("image/png")); // Guarda el cuadro actual
    counter++;
    if (counter <= cantidadFrames) {
      requestAnimationFrame(step);
    } else {
      /*   for (let i = 0; i < 30; i++) {
        frames.push(canvas.toDataURL("image/png"));
      } */
      console.log("fin creación frames  ", Date.now() - inicio);
    }
  }
}

/**
 * @param {number} cantidadFrames
 * @param {number} scale
 * @param {number} scaleFactor
 */
function animateZoomOut(cantidadFrames, scale, scaleFactor) {
  // Limpia el canvas
  let inicio = Date.now();
  console.log("start creación frames  ", Date.now());

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(step);
  let counter = 0;

  /**
   * @param {any} timestamp
   */
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
    let inicio = Date.now();
    console.log("inicio de ffmpeg", Date.now());
    // TODO: volver a probar sin hacerlo en paralelo y comparar diferencias de tiempo
    // si es mismo tiempo, no paralelizarlo permitiría poner un contador indicando cuanto falta
    // Escribir los archivos en paralelo
    /*     await Promise.all(
      frames.map((frame, index) =>
        ffmpeg.writeFile(`input${index + 1}.png`, frame)
      )
    ); */

    for (let i = 0; i < frames.length; i++) {
      console.log("frame", i);
      await ffmpeg.writeFile(`input${i + 1}.png`, frames[i]);
    }

    console.log("fin frames  ", Date.now() - inicio);
    /*    //VER ojo, no cambiar el orden de estos parametros porque se rompe
    await ffmpeg.exec([
      "-framerate",
      "15", // Velocidad de fotogramas, ajusta según tus necesidades
      "-i",
      "input%d.png", // Plantilla de entrada
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "output.mp4", // Archivo de salida
    ]);
 */
    await ffmpeg.exec([
      "-framerate",
      "30", // Velocidad de fotogramas, ajusta según tus necesidades
      "-i",
      "input%d.png", // Plantilla de entrada
      //"-vf",
      //"tpad=stop_mode=clone:stop_duration=5", // Filtro para extender el último frame
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

/**
 * @param {number} cantidadFrames
 * @param {number} scale
 * @param {number} scaleFactor
 */
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
