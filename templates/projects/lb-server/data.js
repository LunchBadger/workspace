/**
 * The api-server component template.
 */

let template = module.exports;

template.description = 'An Lunchbadger project, without any configured models or datasources';

template.supportedLBVersions = ['2.x', '3.x'];

template.package = {
  'version': '1.0.0',
  'main': 'server/server.js',
  'engines': {
    'node': '>=8'
  },
  'scripts': {
    'lint': 'eslint .',
    'start': 'node .',
    'postinstall': 'npm uninstall loopback-component-explorer && npm install LunchBadger/loopback-component-explorer',
    'posttest': 'npm run lint && nsp check'
  },
  'dependencies': {
    'cors': '^2.5.2',
    'loopback-boot': '^2.6.5',
    'serve-favicon': '^2.0.1',
    'strong-error-handler': '^2.0.0',
    'loopback-component-explorer': 'LunchBadger/loopback-component-explorer'
  },
  'devDependencies': {
    'eslint-config-standard': '10.2.1',
    'eslint-plugin-import': '2.3.0',
    'eslint-plugin-node': '4.2.2',
    'eslint-plugin-promise': '3.5.0',
    'eslint-plugin-standard': '3.0.1',
    'eslint': '^4.9.0',
    'nsp': '^2.1.0'
  },
  // Avoid NPM warning
  'repository': {
    'type': '',
    'url': ''
  },
  'license': 'UNLICENSED'
};

template.common = {

};

template.server = {
  facet: {
    modelsMetadata: {
      sources: [
        'loopback/common/models',
        'loopback/server/models',
        '../common/models',
        './models',
        './internal'
      ],
      mixins: [
        'loopback/common/mixins',
        'loopback/server/mixins',
        '../common/mixins',
        './mixins'
      ]
    }
  },

  config: [
    {name: 'restApiRoot', value: '/'},
    {name: 'host', value: '0.0.0.0'}, // Listen on all interfaces
    {name: 'port', value: 3000},
    {name: 'remoting',
      value: {
        context: false,
        rest: {
          handleErrors: false,
          normalizeHttpPath: false,
          xml: false
        },
        json: {
          strict: false,
          limit: '100kb'
        },
        urlencoded: {
          extended: true,
          limit: '100kb'
        },
        cors: false
      }}
  ],

  modelConfigs: [
  ],

  datasources: [
  ],

  componentConfigs: [
    {
      name: 'loopback-component-explorer',
      value: {
        mountPath: '/explorer'
      }
    }
  ]
};

// An empty server has no client facet
template.client = null;
