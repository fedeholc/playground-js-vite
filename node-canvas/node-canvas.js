import { Image, createCanvas } from "canvas";
import fs from "fs";

fs.readFile("miau.jpg", (err, squid) => {
  if (err) throw err;
  const img = new Image();
  img.onload = () => {
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    ctx.font = "70px Montserrat";
    ctx.fillStyle = "#000";
    ctx.rotate(0.1);
    ctx.fillText("Awesome!", 50, 100);
    ctx.fillStyle = "#faa";
    ctx.fillText("Awesome!", 52, 102);
    console.log("img:", img);
    const buf3 = canvas.toBuffer("image/jpeg", { quality: 0.5 });
    fs.writeFileSync("out.jpg", buf3);
  };

  img.onerror = (err) => {
    throw err;
  };
  img.src = squid;
});
