import React from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom'

import { Blog, Possibility, Features, AskChatGPT, Header } from './containers';
import { CTA, Brand, Navbar } from './components';
import { Home } from './pages'
import './App.css'

// BEM -> Block Element Modifier
// naming convention (i.e. gpt__navbar)

const App = () => {

  return (
    <div className="App">
		<BrowserRouter>
			<Routes>
				<Route index element={<Home />} />
				<Route element={<Home />} path="/home" />
				{/*<Route element={NoPage} path="*" /> */}
			</Routes>
		</BrowserRouter>
    </div>
  )
}

export default App