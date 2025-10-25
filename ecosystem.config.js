module.exports = {
  apps: [{
    name: 'dvm-erp-api',
    script: 'src/app.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};