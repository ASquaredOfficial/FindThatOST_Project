import React from 'react'

import { Footer, Blog, Possibility, Features, AskChatGPT, Header } from './containers';
import { CTA, Brand, Navbar } from './components';
import './App.css'

// BEM -> Block Element Modifier
// naming convention (i.e. gpt__navbar)

const App = () => {
  return (
    <div className="App">
		<div className='fto__navbar-bg'>
		</div>

		<div className='gradient__bg'>
			<Navbar />
			<Header />
			<AskChatGPT />
		</div>
		<Brand /> { /**/}
		<Features />
		<Possibility />
		<CTA />
		<Blog />
		<Footer />
    </div>
  )
}

export default App