import React from 'react'

import { Footer, Blog, Possibility, Features, WhatGPT3, Header } from './containers';
import { CTA, Brand, Navbar } from './components';
import './App.css'

// BEM -> Block Element Modifier
// naming convention (i.e. gpt__navbar)

const App = () => {
  return (
    <div className="App">
		FindThatOST
		<div className='gradient__bg'>
			<Navbar />
			<Header />
		</div>
		<Brand />
		<WhatGPT3 />
		<Features />
		<Possibility />
		<CTA />
		<Blog />
		<Footer />
    </div>
  )
}

export default App