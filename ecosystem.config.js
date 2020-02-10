module.exports = {
    apps : [{
      name: "app",
      script: "./index.js",
      env_hook: {
        command: 'git pull && pm2 restart robo',
        cwd: '/home/djm/robotics-website'
    }
    }]
  }