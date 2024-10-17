# Developer Setup
This describes how to set up the local development environment.

## System Requirements

If you are behind a proxy there are several things to do. In Linux/macOS several settings
are required (e.g: wget, curl, git, pip, npm, /etc/enviroment....). Mostly in Windows you can
set it once at the 'Enviroment Variables'. But the Linux tools (e.g Git Bash) you are
using on Windows don't know them. So check where to set proxy setting for the program
you are using. Here are also some hints:


## Git

Install **[git](http://git-scm.com/)**.

The git installation path (`C:\Program Files\Git\bin\` by default) must be added to the system-wide PATH environment variable.


### Firewall issues (optional)

The git protocol may be blocked by firewalls. Should this be an issue, configure git to use https instead.

```console
$ git config --global url.https://.insteadof git://
```


### Git proxy (optional)

If you're working from behind a corporate proxy, you may need to configure a proxy for both the normal **and** admin shell that is started with administrative rights.

```console
$ git config --global http.proxy <proxy-url:port>
$ git config --global https.proxy <proxy-url:port>
```

## Node.js

Install **[Node.js](http://nodejs.org)**.

The Node Package Manager (**[NPM](http://npmjs.org)**) comes bundled with your Node.js installation. Please test the correct installation of these tools by executing `node -v` and `npm -v` in your command line; results should look like this:

```console
$ node -v
v20.12.2

$ npm -v
10.5.0
```

Npm can be configured via command line. Configuration entries are added to the file `C:\Users\<user>\.npmrc` that may also be edited directly. To view your complete configuration, run these lines:

```console
$ npm config list
$ npm config ls -l
```


### Cache configuration (optional)

Npm will use a package cache to avoid overly reloading packages. By default, this cache is in `C:\Users\<user>\AppData\Roaming\npm-cache`. Depending on your system, this folder may be synchronized within a roaming profile and slow down the process of logging in/out. In such circumstances it is advised to change the cache path by either editing the `.npmrc` file, or via `cmd` **and** `cmd` with administrator rights with e.g. this line:

```console
npm config set cache D:\npm-cache
```


### Proxy configuration (optional)

Only relevant when a proxy is in use.


Run in `cmd`:
Windows and *nix platforms (incl. e.g Git-Bash, WSL) for YOUR User. Saves in
`~/.npmrc` by default:
```console
npm config set proxy <proxy-url:port>
npm config set https-proxy <proxy-url:port>
```

Windows `cmd` with administrative rights these lines
```console
setx http_proxy <proxy-url:port>
setx https_proxy <proxy-url:port>
$ setx proxy <proxy-url:port>
```

For changes to take effect, close and reopen all your command lines. The `setx` lines will also add the proxies to your system variables. Please mind that other tools reading these variables may be affected.


### Globally install npm packages with administrative rights (optional)

Some npm packages for the setup require global admin installation to be runnable via command line with your user account. To prepare this step, run a `cmd` with administrative rights:

>⚠️ Please determine the correct system path before running this line. The example path is taken from a german Windows 10 installation.
```console
$ npm config set prefix C:\Programme\nodejs\
```

Globally installed packages will be stored in that path. For more information refer to the **[npm folder documentation](https://docs.npmjs.com/files/folders)**.



## Masterportal Installation
Open a Git Bash shell with administrative rights and navigate to the folder in which you want to clone the repository.

```console title="Clone the repository and navigate inside"
$ git clone https://bitbucket.org/geowerkstatt-hamburg/masterportal.git
$ cd masterportal
```

```console title="Install the node_modules required for the Masterportal:"
$ npm install
```

Now all npm dependencies are installed.

In case add-ons are to be used, please refer to the **[add-ons documentation](../Tutorials/addOnsVue.md)** for further assistance.

### Python Dependencies

The documentation of this software is generated with mkdocs-material, a tool written in Python.
To prevent conflicts between Python packages on the system and project level,
a virtual environment (venv) is recommended.

1. Run `python -m venv .venv` in the root folder of the cloned project to create a new virtual Python environment.
2. Activate the venv by running either `source .venv/bin/activate` on Linux or `call .venv/Scripts/activate.bat` on Windows.
3. Now run `pip install -r .\python-dependencies.txt` to install the required Python packages. You may need to pass a [proxy configuration](https://pip.pypa.io/en/stable/user_guide/#using-a-proxy-server) to pip if you are behind a corporate firewall.


## npm Commands

### `npm start`

This command starts a local development server.

```console
$ npm start
```

- After compilation, you may open the following links for comprehensive demo applications:
    - https://localhost:9001/portal/basic A portal with a simple configuration
    - https://localhost:9001/portal/master Simple topic tree
    - https://localhost:9001/portal/auto Default topic tree loading all WMS layers from the `services.json` file


### `npm run test`

Executes unit tests. This also includes the unit tests of **[add-ons](../Tutorials/addOnsVue.md)**.

```console
$ npm run test
```

>⚠️ If not available, the folder `portalconfigs/test` must be created. The test runner will also execute all tests in this folder.

- bundles all tests
- logs unit test results to the console
- after changing tested code or unit tests, the command `npm run test` must be re-run


### `npm run build`

Creates the distributable source folder for all portals, ready for publication.

```console
$ npm run build
```

The created files are stored in the *dist* folder. The folder will be created automatically in the Masterportal folder root. The source code is bundled within the **Mastercode** folder with the current version.


### `npm run buildExamples`

Creates a build from the example folder.

```console
$ npm run buildExamples
```

The produced `examples.zip` and `examples-x.x.x.zip` (versioned) both contain runnable Masterportal instances (*Basic*) including a *resources* folder.



## Updating Dependencies

This task belongs to the owner/ package maintainers. If you don't know: Dont call the command.

To update all NPM packages, run

```console
$ npm update
```

Please refer to the [npm update documentation](https://docs.npmjs.com/cli/v6/commands/npm-update) on how caret and tilde prefixes to versions in the `package.json` are handled by this step.



## Set up debugging in Visual Studio Code

1. Install extension Firefox/Chrome-Debugger

   ![Debugger for Chrome on the marketplace](https://vscode-westus.azurewebsites.net/assets/docs/nodejs/reactjs/debugger-for-chrome.png)

2. Switch to debugger view

   ![Debugger view](https://i0.wp.com/www.mattgoldspink.co.uk/wp-content/uploads/2019/02/Screenshot-2019-02-01-at-21.03.13.png?w=640&ssl=1)

3. Open `launch.json` configuration

   ![Open launch.json configuration](https://docs.microsoft.com/ja-jp/windows/images/vscode-debug-launch-configuration.png)

4. Add a new Firefox configuration to the opened `launch.json` file
```javascript
    {
        "name": "Launch localhost",
        "type": "firefox",
        "request": "launch",
        "reAttach": true,
        "url": "https://localhost:9001/",
        "webRoot": "${workspaceFolder}/build",
        "pathMappings": [
            {
            "url": "webpack:///modules/core",
            "path": "${workspaceFolder}/modules/core"
            }
        ]
    },
```

and/or a Chrome configuration.

```javascript
    {
        "name": "Launch Chrome",
        "type": "chrome",
        "request": "launch",
        "url": "https://localhost:9001/",
        "webRoot": "${workspaceFolder}/build",
    },
```

5. Start server
```console
$ npm start
```

6. Choose (1) and start (2) a debugger

   ![Choose and start debugger](https://i.stack.imgur.com/aJatw.png)

7. Set a breakpoint

    ![Set a breakpoint](https://docs.microsoft.com/en-us/sharepoint/dev/images/vscode-debugging-breakpoint-configured.png)
