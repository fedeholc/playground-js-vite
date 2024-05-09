let array = [1, 4, 2, 8, 345, 1];

function cambiar(lugar1, lugar2, valor1, valor2, arr) {
  arr[lugar1] = valor2;
  arr[lugar2] = valor1;
}

let k = 0;

do {
  for (let j = 0; j < array.length - 1; j++) {
    if (array[j] > array[j + 1]) {
      cambiar(j, j + 1, array[j], array[j + 1], array);
    }
  }
} while (array.length - k > 1);
