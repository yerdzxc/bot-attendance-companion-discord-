module.exports = {
  apps: [
    {
      name: 'hrs-nest-be:3001',
      exec_mode: 'cluster',
      instances: '1',
      script: './dist/main.js',
      "env": {
        "PORT": "3001",
      }
    }
  ]
}
