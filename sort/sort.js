let a = ["a", "b", "c", "d"];

function resto(arr) {
  console.log("resto: ", arr);
}

//funcion que calcula el factorial de un numero
function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}
function repeticiones(n) {
  return factorial(n) / n;
}

let letras = [];
let letras2 = [];


function recorrer(array) {

  let filas = factorial(array.length);
  console.log("totalFilas: ", filas);
  let columnas = array.length;

  let rta = [];
  rta = new Array(filas).fill(new Array(columnas).fill(""));
  console.log("rta: ", rta);

  let col = 0;
  for (let i = 0; i < array.length; i++) {
    //console.log(array.length - i);
    let reps  = repeticiones(array.length-i);
    console.log("reps: ", reps);
    let count = 0;
      
    for (let k = 0; k < array.length; k++) {
      for (let j = 0; j < reps; j++) {
        console.log(array[k]);
        rta[count][col] = array[k];
        count++;
          /*       console.log("i: ", i);
      console.log("j: ", j);
      console.log("k: ", k); */
        }
    }


  }
   console.log("--");
  for (let i = 0; i < columnas; i++) {
    console.log(rta[i]);
  }
  

  
}

recorrer(["a", "b", "c","d"]);
//console.log(factorial(4) / 4);
