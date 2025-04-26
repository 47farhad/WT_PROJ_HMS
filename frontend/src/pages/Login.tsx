import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Logo from '../components/Logo';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const {login, isLoggingIn} = useAuthStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        const res = login({
            email: email,
            password: password
        });
        navigate('/Dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4"
            style={{
                background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)'
            }}>
            <div className="mt-6 flex flex-row items-center gap-3 mb-3 p-2 ml-1 hover:cursor-pointer" onClick={()=>{navigate('/')}}>
                <Logo size={50} />
                <span className="text-5xl text-[#243954] font-['Red_Hat_Display'] font-bold">
                    MedX
                </span> <br />
            </div>
            {/* Login Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden mb-17">
                {/* Header */}
                <div className="bg-[#243954] p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Portal Login</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] focus:border-[#243954] outline-none transition"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] focus:border-[#243954] outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-[#243954] focus:ring-[#243954] border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>

                        <a href="ForgotPassword" className="text-sm text-[#243954] hover:underline">
                            Forgot password?
                        </a>
                    </div>

                    {/* TODO: add a loader on the button while isLoggingIn is true */}
                    <button
                        type="submit"
                        className="w-full bg-[#243954] hover:bg-[#1a2c42] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-300"
                        disabled={isLoggingIn}
                    >
                        Sign In
                    </button>
                </form>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 text-center border-t">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <a className='text-[15px] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400' href='Signup'
                        >
                            Signup!
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;