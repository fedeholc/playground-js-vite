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

function animateZoom(timestamp) {
  let startTime = null;

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

    if (elapsed < 2000) {
      // 5 segundos
      requestAnimationFrame(step);
    } else {
      console.log("Animación de zoom terminada");
      //downloadFrames();
    }
  }

  requestAnimationFrame(step);
}

document.querySelector("#download").addEventListener("click", downloadFrames);

function downloadFrames() {
  ffmpeg.whenReady(async () => {
    console.log("inicio de ffmpeg");
    await ffmpeg.writeFile("0.png", frames[0]);
    await ffmpeg.writeFile("1.png", frames[1]);
    await ffmpeg.writeFile("2.png", frames[2]);

    let rta = await ffmpeg
      .input({
        sequence: ["0.png", "1.png", "2.png"],
        framerate: 1,
        duration: 3,
      })
      .ouput({
        format: "mp4",
        video: {
          codec: "libx264",

          framerate: 1,
        },
      })
      .export();

    console.log("rta:", rta);
    console.log("fin de ffmpeg");
    const blob = new Blob(rta, { type: "video/mp4" });
    console.log(blob);
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
