import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Home, Search, Anime } from './pages'
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
				<Route element={<Search />} path="/search" />
				<Route element={<Anime />} path="/anime/:id" />
				{/*<Route element={NoPage} path="*" /> */}
			</Routes>
		</BrowserRouter>
    </div>
  )
}

export default App