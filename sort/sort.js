let a = ["a", "b", "c", "d"];

// function to remove one item from array
function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}
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
  for (let i = 0; i < filas; i++) {
    rta[i] = new Array(columnas).fill("");
  }
    
  let disponibles = [...array];
  let restantes = [...array];
   for (let i = 0; i < columnas; i++) {
    console.log("col: ",i);
     let count = 0;  
    for (let k = 0; k < columnas-i; k++) {
       console.log("cols: ", i, columnas-i, "filas /cols", filas/(columnas-i));
      for (let j = 0; j < filas/(columnas-i); j++) {
         
        //rta[count][i] = [...array[k]].toString();
        rta[count][i] = `${count}-k${k}-j${j}-${array[k]}`;
        count++;
      }
    }
  }
  console.log("--");
  console.log(rta);  
}


recorrer(["a", "b", "c","d"]);
let x = ["a", "b", "c", "d"];
//x = [...removeItemOnce(x,"b")];
//console.log("x: ", x);


//console.log(factorial(4) / 4);
/* let x = [["a", "b", "c", "d"],["e", "f", "g", "h"]];
console.log(x);

let rta2 = [];
rta2 = new Array(24).fill(new Array(4).fill(""));
rta2[0][0] = "a";
rta2[0][1] = "b";
console.log("rta: ", rta2); */
