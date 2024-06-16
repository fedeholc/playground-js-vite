import { FFmpeg } from "@diffusion-studio/ffmpeg-js";

const canvas = document.getElementById("miCanvas");
const ctx = canvas.getContext("2d");
const imageLoader = document.getElementById("imageLoader");

const ffmpeg = new FFmpeg({
  config: "gpl-extended",
});

let img = new Image();
let scale = 1;
const scaleFactor = 1.001; // Factor de aumento de escala en cada cuadro
const frames = [];

imageLoader.addEventListener("change", handleImage, false);

function handleImage(e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    img.onload = function () {
      scale = 1; // Reinicia la escala
      canvas.width = img.width;
      canvas.height = img.height;
      animateZoom();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

let startTime = null;
let frameConunter = 0;

function animateZoom(timestamp) {
  requestAnimationFrame(step);
}

function step(currentTime) {
  if (!startTime) startTime = currentTime;
  const elapsed = currentTime - startTime;

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
    //downloadFrames();
  }
  /*   if (elapsed < 2000) {
    // 5 segundos
    requestAnimationFrame(step);
  } else {
    console.log("Animación de zoom terminada");
    //downloadFrames();
  } */
}

document.querySelector("#download").addEventListener("click", downloadFrames);

function downloadFrames() {
  ffmpeg.whenReady(async () => {
    console.log("inicio de ffmpeg");

    frames.forEach(async (frame, index) => {
      await ffmpeg.writeFile(`input${index + 1}.png`, frames[index]);
    });

    /* 
    await ffmpeg.writeFile("input2.png", frames[1]);
    await ffmpeg.writeFile("input3.png", frames[2]);
 */
    /* 
    await ffmpeg.writeFile("0.png", frames[0]);
    await ffmpeg.writeFile("1.png", frames[1]);
    await ffmpeg.writeFile("2.png", frames[2]);
 */
    /*  let rta = await ffmpeg
      .input({
        sequence: ["0.png", "1.png", "2.png"],
        framerate: 1,
      })
      .ouput({
        format: "avi",
        filterComplex: {
          filter: "[0:v][1:v][2:v]concat=n=3:v=1[outv]",
          map: "[outv]",
        },
      })
      .export(); */
    await ffmpeg.exec([
      "-framerate",
      "12", // Velocidad de fotogramas, ajusta según tus necesidades
      "-i",
      "input%d.png", // Plantilla de entrada
      "output.mp4", // Archivo de salida
    ]);

    //await ffmpeg.exec(["-i", "output.avi", "output2.mp4"]);
    let rta = ffmpeg.readFile("output.mp4");

    console.log("rta:", rta);
    console.log("fin de ffmpeg");
    const blob = new Blob([rta.buffer], { type: "video/mp4" });
    console.log(blob);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video.avi";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
