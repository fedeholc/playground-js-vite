const canvas = document.getElementById("miCanvas");
const ctx = canvas.getContext("2d");
const imageLoader = document.getElementById("imageLoader");

let img = new Image();
let scale = 1;
const scaleFactor = 1.0001; // Factor de aumento de escala en cada cuadro

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

    // Aumenta la escala
    scale *= scaleFactor;

    if (elapsed < 15000) {
      // 5 segundos
      requestAnimationFrame(step);
    } else {
      console.log("Animación de zoom terminada");
    }
  }

  requestAnimationFrame(step);
}
