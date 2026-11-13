// PM2 process file – for a VPS / Virtualmin server without Passenger.
//   npm i -g pm2 && npm run build && pm2 start ecosystem.config.js && pm2 save && pm2 startup
module.exports = {
  apps: [
    { name: 'assert-cms', cwd: './backend', script: 'app.js', env: { NODE_ENV: 'production' }, max_memory_restart: '400M' },
    { name: 'assert-web', cwd: './frontend', script: 'server.js', env: { NODE_ENV: 'production' }, max_memory_restart: '600M' },
  ],
};
