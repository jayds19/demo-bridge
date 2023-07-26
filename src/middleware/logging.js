// Se llama esta funcion para mostrar el contenido de cada request
export function logRequest(req, res, next) {
  console.log(`RECEIVED ${req.method} ${req.url}`);
  console.log(JSON.stringify(req.body, null, 2));
  next();
}
