## LunchBadger API (workspace pods)

The LunchBadger API started out as the main microservice for the application.  It now one of three different types of pod microservices that are deployed on behalf of the user:
- workspace (LoopBack project)
- functions (Kubeless serverless functions)
- gateways (Express Gateway)

The LunchBadger utilizes a [fork of the loopback-workspace api][loopback-workspace-fork].


This app can be used as interal API for LunchBadger container application (https://github.com/LunchBadger/lunchbadger-container)

Uses fork of loopback-workspace to operate the underlying loopback project 

Normally, user can start API with client app bundled inside (client app is served from loopback) by running `npm install` script
and after the installation, the container with all plugins is being downloaded and bundled to single app.

If `node_modules` are already present (app is installed) you can simply start it with `npm start` command inside root.

List of all available commands:

```
# creates dist version of app
npm run dist

# recreates dist version of app when one is already available
npm run dist force

# creates or recreates dist version of app using local configuration (from dev environment)
npm run dist local
npm run dist force local
```

### Skipping client installation

If you want to use LunchBadger API to start loopback api instance only, without creating and waiting for client app to build
(because you have different container), when no `node_modules` are present simply pass `npm install --ignore-scripts` argument
to skip post installation script which downloads the client.

[loopback-workspace-fork]: 