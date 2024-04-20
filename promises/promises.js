document.querySelector("#app").innerHTML = `ver consola`;

console.log("Inicio");

promiseExample6();

// -----------------------------------------------------

//* custom fetch y con delay
//* lo utilicé para post https://nsp.fedeholc.ar/posts/2024-04-20-promises---ejemplos-de-creaci%C3%B3n-y-uso
async function promiseExample6() {
  function delay(time = 1000) {
    return new Promise((resolve) => {
      console.log("Delaying...");
      setTimeout(() => {
        resolve();
      }, time || 1000);
    });
  }
  function customFetch(url) {
    return new Promise(async (resolve, reject) => {
      let fetchPromise = fetch(url);
      fetchPromise
        .then((response) => {
          if (response.ok) {
            resolve(response);
          } else {
            reject(
              new Error(
                `Unexpected status code: ${response.status} ${response.statusText}`
              )
            );
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  const appStatus = document.querySelector("#appStatus");

  console.log("*** Loading...");
  appStatus.innerHTML = "Loading...";

  await delay();

  //con error
  let promise = customFetch("https://southparkquotes.onrender.com/v1x/quotes");

  //sin error
  //let promise = customFetch("https://southparkquotes.onrender.com/v1/quotes");

  promise
    .then((response) => {
      console.log("Response: ", response);
    })
    .finally(() => {
      appStatus.innerHTML = "Loaded.";
      console.log("*** Loaded.");
    })
    .catch((error) => {
      console.error("Catched Error : ", error.message);
    });
}

// * uso de fetch con finally para mostrar un mensaje de carga
function promiseExample5() {
  const appStatus = document.querySelector("#appStatus");

  //con error
  let promise = fetch("https://southparkquotes.onrender.com/v1x/quotes");

  //sin error
  //let promise = fetch("https://southparkquotes.onrender.com/v1/quotes");

  appStatus.innerHTML = "Cargando...";

  promise
    .then((response) => {
      if (response.ok) {
        console.log(response.status);
      } else {
        throw new Error(
          `Unexpected status code: ${response.status} ${response.statusText}`
        );
      }
    })
    .finally(() => {
      appStatus.innerHTML = "Cargado";
    })
    .catch((error) => {
      console.error("catched Error : ", error.message);
    });
}

// * una forma de convertir las respuestas de fetch que no son status code 200-299 en errores es hacer lo siguiente:
function promiseExample4() {
  //con error
  let promise = fetch("https://southparkquotes.onrender.com/v1x/quotes");

  //sin error
  //let promise = fetch("https://southparkquotes.onrender.com/v1/quotes");

  promise
    .then((response) => {
      if (response.ok) {
        console.log(response.status);
      } else {
        throw new Error(
          `Unexpected status code: ${response.status} ${response.statusText}`
        );
      }
    })
    .catch((error) => {
      console.error("catched Error : ", error.message);
    });
}

//* en este ejemplo de dos fetch puede ser que aparezca la respuesta del 2do antes que la del 1ro porque puede ser que el 2do sea mas rapido que el 1ro
// Tener en cuenta que fetch solo devuelve la promesa rechazada si hay un error de red, si la respuesta es 404 o 500 fetch no lo considera un error de red y la promesa se resuelve correctamente con esos status en la propiedad response.status
// Para saber si la respuesta de fetch es correcta hay que ver que response.ok sea true y response.status tenga valores entre 200 y 299.

//* crear una función que devuelva una promise
function promiseExample3() {
  function doSomethingAsync(valor) {
    return new Promise((resolve, reject) => {
      // Simulando una operación asíncrona, como una solicitud HTTP o una tarea de tiempo de espera
      setTimeout(() => {
        // Supongamos que aquí se realiza algún trabajo asíncrono
        const success = valor;

        if (success) {
          resolve("¡Éxito!"); // La promesa se resuelve correctamente con el mensaje "Éxito"
        } else {
          reject(new Error("Algo salió mal")); // La promesa se rechaza con un error
        }
      }, 2000); // Simulando un retraso de 2 segundos
    });
  }

  console.log("*** Inicio 3 - loading");

  let promise3 = doSomethingAsync(true);

  promise3
    .then(
      (response) => {
        console.log("3 dentro del then");
        console.log("--- Response3: ", response);
      },
      (rejection) => {
        console.error("Reject Error3: ", rejection);
      }
    )
    .finally(() => {
      console.log("*** fin 3do fetch");
    })
    .catch((error) => {
      console.error("catched Error3: ", error);
    });
}

function promiseExample2() {
  console.log("*** Inicio 2do fetch - loading");

  let promiseResultante = fetch(
    "https://southparkquotes.onrender.com/v1/quotes"
  );

  promiseResultante
    .then((response) => {
      console.log("2do fetch dentro del then");
      console.log("--- Response2: ", response);
      response.json().then((data) => {
        console.log(`Quote 2: ${data[0].quote}`);
      }),
        (rejection) => {
          console.error("Reject Error2: ", rejection);
        };
    })
    .catch((error) => {
      console.error("catched Error2: ", error);
    })
    .finally(() => {
      console.log("*** fin 2do fetch");
    });
}

function promiseExample1() {
  let resultado = fetch("https://southparkquotes.onrender.com/v1/quotes");

  resultado.then((res) => {
    res.json().then((data) => {
      console.log(`Quote 1: ${data[0].quote}`);
    });
  });

  //* si solo se quiere acceder al reject de la promesa se puede hacer de la siguiente manera:

  resultado.then(null, (rejection) => {
    console.error("Error: ", rejection);
  });
}
