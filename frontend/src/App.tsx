import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

import MainPage from "./pages/MainPage.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import { useAuthStore } from "./store/useAuthStore.ts";
import { useEffect } from "react";
import NotFoundButton from "./components/NotFoundButton.tsx";
import Spinner from "./components/common/Spinner.tsx";

function App() {
	const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

	useEffect(() => {
		console.log("checkings");
		checkAuth();
	}, []);

	if (isCheckingAuth) {
		console.log("checking");
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route
					path="Login"
					element={
						authUser ? <Navigate to={"/Dashboard"} /> : <Login />
					}
				/>
				<Route
					path="Signup"
					element={
						authUser ? <Navigate to={"/Dashboard"} /> : <Signup />
					}
				/>

				<Route path="/404" element={<NotFoundButton />} />

				<Route path="/*" element={<MainPage />} />
			</Routes>

			<Toaster />
			<Analytics />
		</>
	);
}

export default App;
