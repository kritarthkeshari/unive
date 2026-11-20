const colour = {
  reset: '\x1b[0m',
  grey: '\x1b[90m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function statusColour(status) {
  if (status >= 500) return colour.red;
  if (status >= 400) return colour.yellow;
  if (status >= 300) return colour.cyan;
  return colour.green;
}

export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const time = new Date().toISOString();
    const status = res.statusCode;
    const line =
      `${colour.grey}[${time}]${colour.reset} ` +
      `${colour.cyan}${req.method}${colour.reset} ${req.originalUrl} ` +
      `${statusColour(status)}${status}${colour.reset} ` +
      `${colour.grey}${durationMs.toFixed(1)}ms${colour.reset}`;
    console.log(line);
  });

  next();
}

export default requestLogger;
