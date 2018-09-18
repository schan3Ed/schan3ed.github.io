import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import App from './App'
import * as stores from './stores'

import './styles/index.css'
import registerServiceWorker from './core/registerServiceWorker'

ReactDOM.render(
  <Provider 
    {...stores}
  >
    <App />
  </Provider>
, document.getElementById('root'))

registerServiceWorker()
