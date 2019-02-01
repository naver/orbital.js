# Orbital.js

> Plugin System for Webpack

## Install

```bash
npm install orbital.js
```

## Example

```bash
$ git clone https://github.com/naver/orbital.git
$ cd ./orbital.js
$ npm install
$ cd ./example
$ npm run dev
```
http://127.0.0.1:3030 will show a screen like below.

![image](https://user-images.githubusercontent.com/7447396/52113741-8e1b4580-264d-11e9-8db9-bacf2a98090a.png)

![image](https://user-images.githubusercontent.com/7447396/52113751-92476300-264d-11e9-81ad-24261d2c2cb0.png)

The example has the following directory structure.

![image](https://user-images.githubusercontent.com/7447396/52113757-970c1700-264d-11e9-93ab-ec947d5d893b.png)

And has a architecture stack like this.

![image](https://user-images.githubusercontent.com/7447396/52113770-9b383480-264d-11e9-8903-68832ca1597b.png)

## package.json

### Basic Sample

```js
{
    "name": "your-package-name",
    "version": "0.1.0",
    ...
    "dependencies": {
        "orbital": "^0.1.0"
    },
    "orbital": {
        "activator": "./src/Activator.js",
        "contributable": {
            "services": [],
            "extensions": []
        },
        "contributes": {
            "services": [],
            "extensions": []
        }
    }
}
```

### activator

* Activator is optional. It is called on start and stop phases. Activator is an entry point to make your plugin do something.<br>
onStart() and onStop() method is called with /<PluginContext/> object, which enables you to access extensions, services and other plugins.

    ```js
    
    class Activator {

        onStart(context) {
            //do some on plugin start
        }

        onStop(context) {
            //do some on plugin end
        }
    }

    export default Activator;

    ```

* Real example

    ```js
    import {getSettingsFragment} from './extensions/settingsContents';

    class Activator {

        constructor() {
            super();
            this.stateListener = this.handlePluginStateChange.bind(this);
        }

        onStart(context) {
            this.context = context;
            context.getPlugins().forEach((plugin) => {
                plugin.on('stateChange', this.stateListener);
            });
        }

        onStop(context) {
            context.getPlugins().forEach((plugin) => {
                plugin.off('stateChange', this.stateListener);
            });
        }

        handlePluginStateChange(/* who, state, oldState */) {
            this.refresh();
        }

        refresh() {
            const settingsPane = document.querySelector('#settingsPane');
            if (settingsPane) {
                const newSettingsPane = getSettingsFragment(this.context);
                settingsPane.parentNode.replaceChild(newSettingsPane, settingsPane);
            }
        }
    }

    export default Activator;

    ```

### contributable

Receives contributions from other plugins. contributable is a kind of interface.

* contributable extensions

    An extension point is an object where other plugins can contribute extensions to.

    contributable extensions field requires three fields id, desc, spec.<br>
    * id (mandatory) : The extension point id which should be unique.
    * desc (optional) : The explanation for the extension point.
    * spec (mandatory) : The interface which should be implemented by contributor plugins.

    The following example shows three extension points.<br>
    `examples.shop.layout:contents`, `examples.shop.layout:aside` and `examples.shop.layout:header`

    ```json
    {
      "name": "examples.shop.layout",
      "version": "0.1.0",
      "description": "This package provides a layout for shop app",
      "orbital": {
        "activator": "./src/Activator.js",
        "contributable": {
          "services": [],
          "extensions": [{
            "id": "examples.shop.layout:contents",
            "desc": "You can contribute ui(s) to the contents area.",
            "spec": {
              "path": "string",
              "getElement": "function"
            }
          }, {
            "id": "examples.shop.layout:aside",
            "desc": "You can contribute ui(s) to the aside area.",
            "spec": {
              "getView": "function"
            }
          }, {
            "id": "examples.shop.layout:header",
            "desc": "You can contribute ui(s) to the header area.",
            "spec": {
              "getView": "function"
            }
          }]
        },
        "contributes": {
          "services": [],
          "extensions": []
        }
      }
    }

    ```

* contributable services

    A service point is an interface which should be implemented by other plugins.

    contributable services field requires three fields id, desc, spec.<br>
    * id (mandatory) : The service point id which should be unique.
    * desc (optional) : The explanation for the service point.
    * spec (mandatory) : The interface which should be implemented by contributor plugins.

    Following example shows contributable service `examples.shop.resources:api`

    ```json
    {
      "name": "examples.shop.resources",
      "version": "0.1.0",
      "description": "This package serves resources(Rest API, Images) for shop app",
      "dependencies": {
      },
      "orbital": {
        "contributable": {
          "services": [{
            "id": "examples.shop.resources:api",
            "desc": "This spec provides rest api for shop",
            "spec": {
              "deleteFromCart": "function",
              "getAccount": "function",
              "getCart": "function",
              "getProductById": "function",
              "getProductCategories": "function",
              "getProducts": "function",
              "postToCart": "function",
              "postLogin": "function",
              "postLogout": "function"
            }
          }],
          "extensions": []
        },
        "contributes": {
          "services": [{
            "id": "examples.shop.resources:api",
            "realize": "./src/services/RestApi.js"
          }],
          "extensions": []
        }
      }
    }

    ```

### contributes

Using contributes field, plugins can contribute to the contributable services and extensions.

* contributes extensions

    Following example implements two extensions.<br>
    `examples.shop.layout:contents` and `examples.shop.layout:aside` of `examples.shop.layout` plugin package.

    ```json
    {
      "name": "examples.shop.products",
      "version": "0.1.0",
      "description": "Products package for shop app",
      "dependencies": {
        "examples.shop.layout": "file:../examples.shop.layout",
        "orbital.js": "file:../../../"
      },
      "orbital": {
        "activator": "./src/Activator.js",
        "contributable": {
          "services": [],
          "extensions": []
        },
        "contributes": {
          "services": [],
          "extensions": [{
            "id": "examples.shop.layout:contents",
            "realize": "./src/extensions/contents.js"
          }, {
            "id": "examples.shop.layout:aside",
            "realize": "./src/extensions/aside.js",
            "priority": 100
          }]
        }
      }
    }

    ```

* contributes services

    Following example implements `examples.shop.resources:api` contributable service itself.<br>
    Plugin can implement it's own contributables.

    ```json
    {
      "name": "examples.shop.resources",
      "version": "0.1.0",
      "description": "This package serves resources(Rest API, Images) for shop app",
      "dependencies": {
      },
      "orbital": {
        "contributable": {
          "services": [{
            "id": "examples.shop.resources:api",
            "desc": "This spec provides rest api for shop",
            "spec": {
              "deleteFromCart": "function",
              "getAccount": "function",
              "getCart": "function",
              "getProductById": "function",
              "getProductCategories": "function",
              "getProducts": "function",
              "postToCart": "function",
              "postLogin": "function",
              "postLogout": "function"
            }
          }],
          "extensions": []
        },
        "contributes": {
          "services": [{
            "id": "examples.shop.resources:api",
            "realize": "./src/services/RestApi.js"
          }],
          "extensions": []
        }
      }
    }

    ```

### priority

Using priority, you can control the orders of plugin contributions.<br>
For example, the order of ui components contributions, or service priority.

Following two examples show `priority` 100 and 200.<br>
Extensions are sorted with higher priority value. Default priority is 0.

```json
{
    "name": "examples.shop.products",
    "version": "0.1.0",
    "description": "Products package for shop app",
    "dependencies": {
    "examples.shop.layout": "file:../examples.shop.layout",
    "orbital.js": "file:../../../"
    },
    "orbital": {
    "activator": "./src/Activator.js",
    "contributable": {
        "services": [],
        "extensions": []
    },
    "contributes": {
        "services": [],
        "extensions": [{
        "id": "examples.shop.layout:header",
        "realize": "./src/extensions/header.js",
        "priority": 100
        }]
    }
    }
}

```

```js
{
    "name": "examples.shop.cart",
    "version": "0.1.0",
    "description": "Cart package for shop app",
    "dependencies": {
    "examples.shop.layout": "file:../examples.shop.layout",
    "orbital.js": "file:../../../"
    },
    "orbital": {
    "contributable": {
        "services": [],
        "extensions": []
    },
    "contributes": {
        "services": [],
        "extensions": [{
        "id": "examples.shop.layout:header",
        "realize": "./src/extensions/header.js",
        "priority": 200
        }]
    }
    }
}

```

## orbital.config.js

```js
module.exports = {
    packages: {
        ignored: [
            /* packages to be ignored */
        ],
        stopped: [
            /* packages to be stopped on start, but later it could be started */
        ]
    }
};
```

## webpack.config.js

```js
module: {
    rules: [
        ...,
        {
            test: /orbital.js$/,
            loader: 'orbital-loader'
        },
        ...
    ]
}
```

## Bug Report

If you find a bug, please report to us posting [issues](https://github.com/naver/orbital.js/issues) on GitHub.

## License

orbital.js is released under the MIT license.

```
Copyright (c) 2019 NAVER Corp.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
