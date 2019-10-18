// OPTIONS AVIALABLE

const options = {
  name: 'up-scraper',
  profile: 'upTest',
  regions: ['us-east-1'],
  proxy: {
    command: 'micro --host localhost --port $PORT',
  },
  lambda: {
    runtime: 'nodejs10.x',
    memory: 1024, // default 512
    warm: true,
    warm_count: 5,
    warm_rate: '15m',
  },
}

/** Notes

See all lambda settings: 
https://apex.sh/docs/up/configuration/#lambda_settings

`proxy.command`:
The proxy.command script is run inside Lambda to start your server, used here to specify the host & port values for micro.

Note: Micro's default host value is ::, which is not compatible with Lambda; using localhost works, though! Also note that the micro(1) binary itself does literally nothing other than start your server, so node-micro-alt would be more idioimatic Node.js code.

{
  "proxy": {
    "command": "./node_modules/.bin/micro --host localhost --port $PORT"
  }
}


**/
