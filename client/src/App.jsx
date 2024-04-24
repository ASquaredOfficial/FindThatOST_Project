import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { Home, Search, Anime, Episode, Track, SubmitTrackAdd, SubmitTrackEdit, ChatGPTBot, TrackRequestView } from './pages'
import './App.css'
import './pages/general.css'
import { toast } from 'react-toastify'

// BEM -> Block Element Modifier
// naming convention (i.e. gpt__navbar)

const App = () => {

	const [ frontendUserData, setFrontendData ] = useState({userId: null, username: null,});

	const FetchUserDetails = async (nFtoUserId) => {
		let apiUrl_fto = `/findthatost_api/user/${nFtoUserId}`;
		console.debug(`Fetch login data from the backend, url: '${process.env.REACT_APP_FTO_BACKEND_URL}${apiUrl_fto}'`);
        const response = await fetch(apiUrl_fto);
		const responseStatus = response.status;
		if (responseStatus === 200) {
			const ftoUserDetails = await response.json();
			setFrontendData(ftoUserDetails);
			toast("Successfully Signed In");
		}
		else if (responseStatus === 204) {
			toast("User does not exit!");
		}
		else {
			toast("An unexpected error has occurred.");
		}
	}

	const SignIn = () => {
		FetchUserDetails(1);
	}

	const SignOut = () => {
		setFrontendData();
		toast("Successfully Signed Out");
	}

	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Navigate to='/home' replace/>} />
					<Route path="/home" index 
						element={
							<Home
								SignInFunction={SignIn} 
								SignOutFunction={SignOut} 
								user_properties={frontendUserData} />
						} />
					<Route path="/search" 
						element={
							<Search
								SignInFunction={SignIn} 
								SignOutFunction={SignOut} 
								user_properties={frontendUserData} />
						} />
					<Route path="/anime/:id" 
						element={
							<Anime
								SignInFunction={SignIn} 
								SignOutFunction={SignOut} 
								user_properties={frontendUserData} />
						} />
					<Route path="/anime/:anime_id/episode/:episode_no" 
						element={
							<Episode
								SignInFunction={SignIn} 
								SignOutFunction={SignOut} 
								user_properties={frontendUserData} />
						} />
					<Route path="/track/:track_id/" 
						element={
							<Track
								SignInFunction={SignIn} 
								SignOutFunction={SignOut} 
								user_properties={frontendUserData} />
						} />
					<Route path="/chatbot/" 
						element={
							<ChatGPTBot 
								SignInFunction={SignIn} 
								SignOutFunction={SignOut} 
								user_properties={frontendUserData} />
						} />
					<Route path="/submission/track_add/:anime_id/" 
						element={
							<SubmitTrackAdd 
								SignInFunction={SignIn} 
								SignOutFunction={SignOut} 
								user_properties={frontendUserData} />
						} />
					<Route path="/submission/track_edit/:track_id/context_id/:occurrence_id" 
						element={
							<SubmitTrackEdit 
								SignInFunction={SignIn} 
								SignOutFunction={SignOut} 
								user_properties={frontendUserData} />
							} />
					<Route path="/request/:request_id" element={
						<TrackRequestView 
							SignInFunction={SignIn} 
							SignOutFunction={SignOut} 
							user_properties={frontendUserData} />
						} />
					<Route path="*" 
						element={
							<Home
								SignInFunction={SignIn} 
								SignOutFunction={SignOut} 
								user_properties={frontendUserData} />
						} />
				</Routes>
			</BrowserRouter>
		</div>
	)
}

export default App