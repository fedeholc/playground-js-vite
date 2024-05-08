let miarray = [2, 3, 1, 20, 5, 33, 14, 22];

function cambiar(lugar1, lugar2, valor1, valor2, array) {
  array[lugar1] = valor2;
  array[lugar2] = valor1;
}

for (let i = 0; i < miarray.length - i; i++) {
  for (let j = 0; j < miarray.length - 1; j++) {
    if (miarray[j] > miarray[j + 1]) {
      console.log("cambio: ", miarray[j], miarray[j + 1]);
      cambiar(j, j + 1, miarray[j], miarray[j + 1], miarray);
    } else {
      console.log("no cambio: ", miarray[j], miarray[j + 1]);
    }
  }
  console.log(miarray);
}

console.log(miarray);
