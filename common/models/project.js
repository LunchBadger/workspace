const async = require('async');
const debug = require('debug')('lunchbadger-workspace:project');
const {saveToGit, push} = require('../lib/util');
const config = require('../lib/config');
const pushInterval = parseInt(process.env.LB_PUSH_INTERVAL) || 1000;

module.exports = function (Project) {
  setInterval(() => {
    // Push to Git
    push(config.branch);
  }, pushInterval);

  Project.prototype.clearProject = function (cb) {
    let wsModels = Project.app.workspace.models;

    async.series([
      callback => {
        this._deleteAllModels(callback);
      },
      callback => {
        debug(`deleting all data sources`);
        wsModels.DataSourceDefinition.destroyAll(callback);
      },
      callback => {
        debug(`deleting all model configs`);
        wsModels.ModelConfig.destroyAll(callback);
      }
    ], (err, res) => {
      if (err) {
        cb(err);
        return;
      }

      this.functions = [];
      this.serviceEndpoints = [];
      this.apiEndpoints = [];
      this.microServices = [];
      this.apis = [];
      this.portals = [];
      this.gateways = [];
      this.connections = [];
      this.states = [];

      this.save(cb);
    });
  };

  Project.remoteMethod('clearProject', {
    description: 'Clear all data from the project, including the workspace',
    isStatic: false,
    http: { path: '/clear', verb: 'post' }
  });

  Project.prototype._deleteAllModels = function (cb) {
    let wsModels = Project.app.workspace.models;

    async.waterfall([
      callback => {
        wsModels.ModelDefinition.find(callback);
      },
      (modelDefs, callback) => {
        let tasks = modelDefs
          .filter(model => model.facetName === 'server')
          .map(model => modelDelCb => {
            debug(`deleting model definition for ${model.id}`);
            model.delete(modelDelCb);
          });
        async.series(tasks, callback);
      }
    ], cb);
  };

  Project.observe('after save', function (ctx, next) {
    try {
      saveToGit('LunchBadger: Changes in Project', next);
    } catch (err) {
      debug(err);
      next(new Error('Error saving project'));
    }
  });
};
