# Next.js SSR on Cloud Functions for Firebase with Firebase Hosting

This is a example on how to setup Next.js with Firebase Cloud Functions and Hosting.

```
git clone https://github.com/ocpu/next-firebase-functions-example.git my-project
cd my-project
npm install
```

Steps:
- In `.firebaserc` change to your project.
- Login with `npm run login`.
- Change or remove `.eslintrc`.
- Now you can start to serve with Cloud Functions and Hosting or to just use Next.js.
  - Serve Next.js with Cloud Functions and Hosting: `npm run serve`
  - __Only__ Next.js: `npm run dev`

## The application

The Next.js application is located in `functions/app`.

This is just your normal Next.js application folder.

## Routes

To add extra routes open `functions/routes.js`. Here we find a function that takes a Next.js app as
a argument and returns a router. We can use the app as such.
```js
router.get('/p/:id', (req, res) => {
  next.render(req, res, '/post', { id: req.params.id })
})
```

## Optional things

Here I describe how things could be implemented.

<details><summary>Redux</summary>

Modules: `redux react-redux redux-thunk`

Files:
<details><summary><code>functions/app/components/layout.js</code></summary>

```jsx
// Other imports

import { configureStore } from '../data/store'
import { Provider, connect } from 'react-redux'

/**
 * Display a element and optionaly connected to the redux store.
 * 
 * @example
 * // Without redux
 * <Component page={props => <div>Hello, world!</div>}/>
 * 
 * @example
 * // With redux
 * <Component
 *   redux={{
 *     state: state => ({}),
 *     dispatch: dispatch => ({})
 *   }}
 *   page={propsWithReduxProps => <div>Hello, world!</div>}
 * />
 * 
 * @param {Object} props The page props
 * @param {(JSX.Element|((props: Object) => JSX.Element))} props.page The element to display.
 * @param {Object} [props.redux] 
 * @param {((state: Object) => Object)} props.redux.state The function that maps from redux state to props.
 * @param {((state: Object) => Object)} props.redux.dispatch The function that maps from redux dispatch to props.
 * @returns {JSX.Element} The resulting page
 */
export const Page = props => {
  const { page: Page, redux, children, ...rest } = props
  return redux && redux.state && redux.dispatch ? (
    <Provider>
      {(() => {
        const Page = connect(redux.state, redux.dispatch)(Page)
        return <Page {...rest}>{children}</Page>
      })()}
    </Provider>
  ) : (<Page {...rest}>{children}</Page>)
}

export const Layout = props => {
  return (
    <div>
      <p>Some content then the page</p>
      {props.children}
      <p>Some more content</p>

    </div>
  )
}

```
</details>

<details><summary><code>functions/app/data/store.js</code></summary>

```js
import { combineReducers, createStore, applyMiddleware, combine } from 'redux'
import thunk from 'redux-thunk'
import * as reducers from './reducers'

export const configureStore = (initialState={}) => {
  const composeEnhancers = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const store = createStore(combineReducers(reducer), initailState, composeEnhancers(
    applyMiddleware(thunk)
  ))

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(combineReducers(require('./reducers')))
    })
  }

  return store
}
```
</details>
<details><summary><code>functions/app/data/reducers.js</code></summary>

```js
export const flow = (state={}, action) => {
  switch (action.type) {
    default:
      return state
  }
}
```
</details>
</details>

<details><summary>Global css stylesheet</summary>

Modules: `autoprefixer babel-plugin-module-resolver babel-plugin-wrap-in-js postcss-easy-import postcss-loader raw-loader`

Optional modules: `normalize.css`

Files:
<details><summary><code>functions/app/.babelrc</code></summary>

```json
{
  "plugins": [
    [
      "module-resolver", {
        "root": ["."],
        "alias": {
          "styles": "./styles"
        },
        "cwd": "babelrc"
    }],
    [
      "wrap-in-js",
      {
        "extensions": ["css$"]
      }
    ]
  ],
  "presets": [
    "next/babel"
  ],
  "ignore": []
}
```
</details>
<details><summary><code>functions/app/next.config.js</code></summary>

```js
module.exports = {
  webpack: (config, { dev }) => {
    config.module.rules.push(
      {
        test: /\.css/,
        loader: 'emit-file-loader',
        options: {
          name: 'dist/[path][name].[ext]'
        }
      },
      {
        test: /\.css$/,
        use: ['babel-loader', 'raw-loader', 'postcss-loader']
      }
    )
    return config
  }
}
```
</details>
<details><summary><code>functions/app/postcss.config.js</code></summary>

```js
module.exports = {
  plugins: [
    require('postcss-easy-import')({prefix: '_'}),
    require('autoprefixer')({ /* ...options */ })
  ]
}
```
</details>

Now you can use css in your project.
To import your the styles into the page, do the following.
```js
import stylesheet from 'path/to/styles_dir/stylesheet'

const styles = <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
```
</details>
<details><summary>Global sass or scss stylesheet</summary>

Modules: `autoprefixer babel-plugin-module-resolver babel-plugin-wrap-in-js glob node-sass postcss-easy-import postcss-loader raw-loader sass-loader`

Optional modules: `normalize.css`

Files:
<details><summary><code>functions/app/.babelrc</code></summary>

```json
{
  "plugins": [
    [
      "module-resolver", {
        "root": ["."],
        "alias": {
          "styles": "./styles"
        },
        "cwd": "babelrc"
    }],
    [
      "wrap-in-js",
      {
        "extensions": ["css$", "scss$", "sass$"]
      }
    ]
  ],
  "presets": [
    "next/babel"
  ],
  "ignore": []
}
```
</details>
<details><summary><code>functions/app/next.config.js</code></summary>

```js
const path = require('path')
const glob = require('glob')

module.exports = {
  webpack: (config, { dev }) => {
    config.module.rules.push(
      {
        test: /\.(css|scss|sass)/,
        loader: 'emit-file-loader',
        options: {
          name: 'dist/[path][name].[ext]'
        }
      }
    ,
      {
        test: /\.css$/,
        use: ['babel-loader', 'raw-loader', 'postcss-loader']
      }
    ,
      {
        test: /\.s(a|c)ss$/,
        use: ['babel-loader', 'raw-loader', 'postcss-loader',
          { loader: 'sass-loader',
            options: {
              includePaths: ['styles', 'node_modules']
                .map((d) => path.join(__dirname, d))
                .map((g) => glob.sync(g))
                .reduce((a, c) => a.concat(c), [])
            }
          }
        ]
      }
    )
    return config
  }
}
```
</details>
<details><summary><code>functions/app/postcss.config.js</code></summary>

```js
module.exports = {
  plugins: [
    require('postcss-easy-import')({prefix: '_'}),
    require('autoprefixer')({ /* ...options */ })
  ]
}
```
</details>

Now you can use sass and scss in your project.
To import your the styles into the page, do the following.
```js
import stylesheet from 'path/to/styles_dir/stylesheet'

const styles = <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
```
</details>
