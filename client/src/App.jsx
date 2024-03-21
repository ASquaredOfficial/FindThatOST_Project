import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { Home, Search, Anime, Episode, Track, SubmitTrackAdd } from './pages'
import './App.css'
import './pages/general.css'

// BEM -> Block Element Modifier
// naming convention (i.e. gpt__navbar)

const App = () => {

  return (
    <div className="App">
		<BrowserRouter>
			<Routes>
				<Route element={<Home />} path="/home" index/>
				<Route element={<Navigate to='/home' replace/>} path="/" />
				<Route element={<Search />} path="/search" />
				<Route element={<Anime />} path="/anime/:id" />
				<Route element={<Episode />} path="/anime/:anime_id/episode/:episode_no" />
				<Route element={<Track />} path="/track/:track_id/" />
				<Route element={<SubmitTrackAdd />} path="/submission/track_add/:anime_id/" />+
				{/*<Route element={ErrorPage} path="*" /> */}
			</Routes>
		</BrowserRouter>
    </div>
  )
}

export default App