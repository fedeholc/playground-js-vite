function delay(time = 1000) {
  return new Promise((resolve) => {
    console.log("Delaying...");
    setTimeout(() => {
      resolve();
    }, time || 1000);
  });
}

export function customFetch(url) {
  return new Promise(async (resolve, reject) => {
    let fetchPromise = fetch(url);
    fetchPromise
      .then((response) => {
        if (response.ok) {
          resolve(response);
        } else {
          reject(
            new Error(
              `Error inesperado: ${response.status} ${response.statusText}`
            )
          );
        }
      })
      .catch((error) => {
        reject("Error de red: " + error.message);
      });
  });
}

console.log("*** Loading...");

await delay();

//con error
//let promiseFetch = customFetch("https://southparkquotes.onrender.com/v1x/quotes");

//sin error
let promiseFetch = customFetch(
  "https://southparkquotes.onrender.com/v1/quotes"
);

promiseFetch
  .then((response) => {
    console.log("Response statusText: ", response.statusText);
  })
  .finally(() => {
    console.log("*** Loaded.");
  })
  .catch((error) => {
    console.error("Catched Error : ", error.message);
  });
