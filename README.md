## Webpack en el Frontend

### Migracion de Webpack 4 a Webpack 5

Después de tener ya el proyecto en nuestro entorno de desarrollo.

Actualizamos.
Webpack y plugins:
npm install webpack@latest webpack-cli@latest babel-loader@latest html-webpack-plugin@latest mini-css-extract-plugin@latest
React:

npm install react@latest react-dom@latest react-router-dom@latest react-redux@latest redux@latest
y npm install
Importante: en package.json:
Cambiamos:

"start": "webpack-dev-server --open --mode development",
Cambió, desde webpack 5 ya es:

"start": "webpack serve --open --mode development",
y npm run start

### Configuración inicial de Webpack para PlatziStore

Creamos el archivo webpack.config.dev.js
Copiamos todo el código de webpack.config.js y lo pegamos a webpack.config.dev.js
Actualizamos en webpack.config.dev.js el apartado devServer:
devServer: {
historyApiFallback: true,
contentBase: path.join(\_\_dirname, 'dist'),
compress: true,
port: 3005,
},
Instalamos las siguientes dependencias:

npm install terser-webpack-plugin clean-webpack-plugin css-minimizer-webpack-plugin -D
En webpack.config.js añadimos:

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
....
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
....
plugins: [
......
new CleanWebpackPlugin
],
optimization: {
minimize: true,
minimizer: [
new CSSMinimizerPlugin(),
new TerserPlugin(),
]
},
Y en package.json actualizamos:

"build": "webpack --mode production --config webpack.config.js",
"start": "webpack serve --open --mode development --config webpack.config.dev.js",
y npm run start y/o npm run build

### Cómo integrar la API de Platzi Store

https://us-central1-gndx-fake-api.cloudfunctions.net/api

Crearemos un hook para trabajar directamente con el llamado de esta API
1.- Creamos una carpeta en src llamada hooks.
2.- Creamos un archivo dentro de hooks > llamado useInitialState.js
3.- Instalamos axios con: npm install axios -S
4.- Instalamos: npm install @babel/plugin-transform-runtime -D
5.- Actualizamos .babelrc
{
"presets": [
"@babel/preset-env",
"@babel/preset-react"
],
"plugins": [
"babel-plugin-transform-class-properties",
"@babel/plugin-transform-runtime"
]
}
App.jsx:

import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from '../containers/Home';
import Checkout from '../containers/Checkout';
import Layout from '../components/Layout';
import NotFound from '../containers/NotFound';

import useInitialState from '../hooks/useInitialState';

const App = () => {
const initialState = useInitialState();
const isEmpty = Object.keys(initialState.products).length;
return (
<>
{isEmpty > 0 ? (
<BrowserRouter>
<Layout>
<Switch>
<Route exact path="/" component={Home} />
<Route exact path="/checkout" component={Checkout} />
<Route component={NotFound} />
</Switch>
</Layout>
</BrowserRouter>
) : <h1>Loading ...</h1>}
</>
)
}

export default App;

useInitialState.js :

import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'https://us-central1-gndx-fake-api.cloudfunctions.net/api';

const useInitialState = () => {
const [products, setProducts] = useState([]);

    useEffect(async () => {
        const response = await axios(API);
        setProducts(response.data);
    }, []);

    return {
        products,
    }

}

export default useInitialState;

### Integrando la API de Platzi Store

Creamos una carpeta dentro de src llamada context.
Dentro de context creamos el archivo AppContext.js
AppContext.js:
import React from 'react';

const AppContext = React.createContext({});

export default AppContext;
En App.jsx importamos AppContext:

import useInitialState from '../hooks/useInitialState';
import AppContext from '../context/AppContext';
Y lo añadimos a nuestro template:

const App = () => {
const initialState = useInitialState();
const isEmpty = Object.keys(initialState.products).length;
return (
<>
{isEmpty > 0 ? (
// START
<AppContext.Provider value={initialState}>
<BrowserRouter>
<Layout>
<Switch>
<Route exact path="/" component={Home} />
<Route exact path="/checkout" component={Checkout} />
<Route component={NotFound} />
</Switch>
</Layout>
</BrowserRouter>
</AppContext.Provider>
// END
) : <h1>Loading ...</h1>}
</>
)
}
Y Aqui el código de Products.jsx: link

### Webpack Alias

Los Alias nos permiten otorgar nombres paths específicos evitando los paths largos
Para crear un alias debes agregar la siguiente configuración a webpack.

En webpack.config.js Y webpack.config.dev.js:
resolve: {
extensions: ['.js', '.jsx'],
// añadimos alias
alias: {
'@components': path.resolve(**dirname, 'src/components/'),
'@containers': path.resolve(**dirname, 'src/containers/'),
'@context': path.resolve(**dirname, 'src/context/'),
'@hooks': path.resolve(**dirname, 'src/hooks/'),
'@routes': path.resolve(**dirname, 'src/routes/'),
'@styles': path.resolve(**dirname, 'src/styles'),
},
},
En cada importacion de nuestros archivos, componentes, hooks, index, etc; basta con hacer la siguiente referencia.
Ejemplo:

import Home from '@containers/Home';
En lugar de :

import Home from '../containers/Home';
Esto resulta beneficioso porque la ruta puede cambiar mediante nuestra aplicación va creciendo, y solo basta cambiar el alias y no así archivo por archivo.

### Manejo de assets en Webpack

Puedes usar una forma de importar las imágenes haciendo un import de las mismas y generando una variable.
No es necesario instalar ninguna dependencia, webpack ya lo tiene incluido.

Creamos la carpeta assets dentro de src y dentro de assets descargamos la siguiente imagen:
imagen: https://i.ibb.co/fr7JzwW/logo-gndx.png
Agregamos un nuevo alias en webpack.config.dev.js, porque primero debemos probarla en dev(desarrollo) antes de llevarlo a producción:
'@assets': path.resolve(\_\_dirname, 'src/assets'),
y añadimos en rules una nueva regla para los assets(es importante que en type se escriba asset y no assets):

      {
        test: /\.(png|jpg)$/,
        type: 'asset/resource',
      },

En src > components > Header.jsx:

importamos el logo
import logo from '@assets/logo-gndx.png';
Agregamos el logo en nuestro h1:

<h1 className="Header-title">
<Link to="/">
<img src={logo} alt="logo" width="32" />
Platzi Store
</Link>
</h1>
Por último copiamos el alias y la nueva regla de webpack.config.dev.js en webpack.config.js.
npm run build => para probar.

### Optimización de imágenes con Webpack y CDN

1.- instalamos los recursos:

npm install image-minimizer-webpack-plugin imagemin-optipng -D
En webpack.config.dev.js y luego en webpack.config.js:

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// Debajo de minicssextractplugin o por esta área
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
y luego en plugins:

new ImageMinimizerPlugin({
minimizerOptions: {
plugins: [
['optipng', { optimizationLevel: 5 }],
],
},
}),
IMPORTANTE: En rules habiamos agregado una regla para las imagenes.

      {
        test: /\.(png|jpg)$/,
        type: 'asset/resource',
      },

y debemos modificarla de la siguiente manera:

      {
        test: /\.(png|jpg)$/,
        type: 'asset',
      },

y npm run build && npm run start para verificar.

### Integración con TypeScript

Añadimos las dependencias:

npm install typescript ts-loader @types/react @types/react-dom @types/webpack
Cuando estamos trabajando con typescript, tenemos que agregar un archivo de su configuración llamado tsconfig.json:
tsconfig.json.

{
"compilerOptions": {
"outDir": "./dist",
"target": "es5",
"module": "es6",
"jsx": "react",
"noImplicitAny": true,
"allowSyntheticDefaultImports": true,
"moduleResolution": "node",
"baseUrl": "./",
"paths": {
"@components": [
"src/components/*"
],
}
}
}
y añadimos una nueva regla en webpack.config.dev.js:
Y después en webpack.config.js

{
test: /\.tsx?\$/,
use: 'ts-loader',
exclude: '/node_modules/',
},
Creamos en components > el archivo Title.tsx:

import React from 'react';

type TitleProps = {
title: string,
}

const Title = ({ title }: TitleProps) => <span>{title}</span>;

export default Title;
Lo importamos en components/Header.jsx:

import Title from '@components/Title';
Y en la parte del logo, la agregamos:

      <Link to="/">
        <img src={logo} alt="logo" width="32" />
        <Title title="Platzi Store" />
      </Link>

IMPORTANTE: añadir en webpack.config.js y webpack.config.dev.js > resolve:
La extensión .tsx

    extensions: ['.tsx', '.js', '.jsx'],

y npm run build && npm run start para verificar

### Hot Reload

Nos permite injectar el código sin necesidad de compilar el proceso completo, solo hace un cambio en vez de estar preparando el proyecto completo.
1.- Instalamos la dependencia:
npm install react-hot-loader
2.- en .babelrc actualizamos los plugins:

"plugins": [
"babel-plugin-transform-class-properties",
"@babel/plugin-transform-runtime",
"react-hot-loader/babel"
]
3.- En routes > App.jsx.
importamos hot:

import { hot } from 'react-hot-loader/root';
y en la última linea(en la que exportamos), modificamos de la siguiente manera:

export default hot(App);
4.- Y solo en webpack.config.dev.js, ya que no necesitamos el hot reload para producción:
Modificamos el entry:

module.exports = {
entry: ['react-hot-loader/patch', './src/index.js'],
.....
}
En devServer añadimos hot:

devServer: {
historyApiFallback: true,
contentBase: path.join(\_\_dirname, 'dist'),
compress: true,
port: 3005,
hot: true,
},
y npm run start

### Lazy Loading

Este es una funcionalidad muy importante y funcional al momento de optimizar nuestra aplicación o página web.

En routes > App.jsx:
Actualizamos nuestra importacion de react(la primera).

import React, { Suspense } from 'react';
Después de los imports agregamos el siguiente código:

import .....
const AsyncCheckoutContainer = React.lazy(() =>
import("@containers/Checkout")
);
Y el template debe quedar así:

return (
<>
{isEmpty > 0 ? (
<Suspense fallback={<div>Loading...</div>}>
<AppContext.Provider value={initialState}>
<BrowserRouter>
<Layout>
<Switch>
<Route exact path="/" component={Home} />
<Route exact path="/checkout" component={AsyncCheckoutContainer} />
<Route component={NotFound} />
</Switch>
</Layout>
</BrowserRouter>
</AppContext.Provider>
</Suspense>
) : <h1>Loading ...</h1>}
</>
)
En webpack.config.dev.js deshabilitar hot-reload temporalmente:
Debe quedar algo así

module.exports = {
entry: ['./src/index.js'],
.....
}
Y en devServer comentamos hot:

devServer: {
historyApiFallback: true,
contentBase: path.join(\_\_dirname, 'dist'),
compress: true,
port: 3005,
// hot: true,
},
añadimos después de plugins:

plugins: [
....
],
optimization: {
splitChunks: {
chunks: 'all',
},
},
y en el output(en el comienzo de nuestro objeto):
(Cambiamos el filename)

    filename: '[name].bundle.js',

y npm run start para probar.

### Code Splitting en desarrollo

Podemos ver que el code splitting es dividir el código, es beneficioso el uso que se le quiera dar, ya que se puede implementar de diferentes formas.
-------------- ¿Qué hicimos en esta clase? ------------
1.- Creamos una carpeta Header dentro de src.
2.- Creamos dentro de Header:

- Un Archivo llamado index.js
- Una carpeta llamada components.
- Dentro de esa carpeta components se crea el archivo App.jsx
  3.- en src/Header/components/App.jsx:

import React from 'react';

const App = () => {
return (

<h1>Hello React From Header</h1>
);
}

export default App;
4.- en src/Header/index.js:

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

ReactDOM.render(<App />, document.getElementById('header'));
5.- en public > index.html:
Añadimos e div con id : header

  <body>
    <div id="header"></div>
    <div id="app"></div>
  </body>
En webpack.config.dev.js:
Modificamos entry y output:
module.exports = {
  entry: {
    home: './src/index.js',
    header: './src/Header/index.js',
  },
 .....
},
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
  },
y npm run start

### Code Splitting en producción

1.- En webpack.config.js modificamos entry y output:

module.exports = {
entry: {
home: './src/index.js',
header: './src/Header/index.js',
},
output: {
path: path.resolve(\_\_dirname, 'dist'),
filename: '[name].bundle.js',
chunkFilename: '[name].bundle.js',
},
}
Y en optimization:

optimization: {
minimize: true,
minimizer: [
new CSSMinimizerPlugin(),
new TerserPlugin(),
],
splitChunks: {
chunks: 'all',
cacheGroups: {
default: false,
commons: {
test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
chunks: 'all',
name: 'commons',
filename: 'assets/common.[chunkhash].js',
reuseExistingChunk: true,
enforce: true,
priority: 20,
},
vendors: {
test: /[\\/]node_modules[\\/]/,
chunks: 'all',
name: 'vendors',
filename: 'assets/vendor.[chunkhash].js',
reuseExistingChunk: true,
enforce: true,
priority: 10,
},
},
},
},
y npm run build

https://webpack.js.org/plugins/split-chunks-plugin/
