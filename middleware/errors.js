// Necesario para atrapar los errores asincronos
export function asyncErrorWrapper(func) {
  return async (req, res, next) => {
    try {
      return await func(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

export function handleError(err, req, res, next) {
  console.log(err);
  res.sendStatus(500);
}
