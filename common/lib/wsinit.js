const fs = require('fs');
const path = require('path');
const util = require('util');

const _ = require('lodash');
const debug = require('debug')('lunchbadger-workspace:workspace');

const {execWs} = require('./util');
const config = require('./config');
const wsName = `${config.userName}-${config.userEnv}`;

const PROJECT_TEMPLATE = path.normalize(
  path.join(__dirname, '../../server/blank-project.json'));

function ensureWorkspace (app) {
  let Workspace = app.workspace.models.Workspace;
  let TEMPLATE_DIR = path.join(__dirname, '..', '..', 'templates', 'projects');

  // DrMegavolt: HACK to provide custom template folder, copy from original project
  Workspace._loadProjectTemplate = function (templateName) {
    let template = require('../../templates/projects/' + templateName + '/data');
    template.files = [path.join(TEMPLATE_DIR, templateName, 'files')];

    let sources = [template];
    if (template.inherits) {
      for (let ix in template.inherits) {
        let t = template.inherits[ix];
        let data = this._loadProjectTemplate(t);
        if (!data) return null; // the error was already reported
        delete data.supportedLBVersions;
        sources.unshift(data);
      }
    }
    // merge into a new object to preserve the originals
    sources.unshift({});

    sources.push((a, b) => {
      if (Array.isArray(a)) {
        return a.concat(b);
      }
    });

    return _.mergeWith.apply(_, sources);
  }.bind(Workspace);

  let needsCommit = false;
  let promise = Promise.resolve(null);

  promise = promise.then(() => {
    if (!fs.existsSync(path.join(config.workspaceDir, 'package.json'))) {
      debug('Creating new LoopBack project');

      const createFromTemplate = util.promisify(
        Workspace.createFromTemplate.bind(Workspace));

      needsCommit = true;
      return createFromTemplate('lb-server', wsName, {loopbackVersion: '3.x'});
    }
  });

  promise = promise.then(() => {
    let createdProject = ensureProjectFileExists();
    needsCommit = needsCommit || createdProject;
  });

  promise = promise.then(() => {
    if (needsCommit) {
      execWs('git add -A');
      execWs('git commit -m "New LunchBadger project"');
      execWs('git push origin master');
    }
  });

  promise = promise.then(() => {
    // Make sure we reload project data, since it may have changed
    try {
      const connector = app.dataSources.db.connector;
      util.promisify(connector.loadFromFile.bind(connector))();
      debug(`Managing workspace in ${config.workspaceDir}`);
      let rev = execWs('git show --format="format:%H" -s');
      console.log(rev);

      return rev.trim();
    } catch (err) {
      console.log('Error initializing project. Shutdown initiated. Error details: ', err);
      process.exit(1);
    }
  });

  return promise;
};

function ensureProjectFileExists () {
  let projectFile = path.join(config.workspaceDir, 'lunchbadger.json');

  if (!fs.existsSync(projectFile)) {
    debug(`creating a new project file (${projectFile})`);
    let projectFileContent = fs.readFileSync(PROJECT_TEMPLATE, {encoding: 'UTF-8'});
    projectFileContent = projectFileContent.replace(/USER/g, wsName);
    fs.writeFileSync(projectFile, projectFileContent);
    return true;
  }

  return false;
}

module.exports = {
  ensureWorkspace,
  ensureProjectFileExists
};
