import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuthStore } from '../store/useAuthStore';

function Signup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { signup, isSigningUp } = useAuthStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if(password.length < 8){
            setError('Password length must be atleast 8');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        signup({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        });
        navigate('/Dashboard'); // Redirect after signup
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 50%, #faf5ff 100%)'
            }}
        >
            {/* Logo/Title */}
            <div
                className="mt-6 flex flex-row items-center gap-3 mb-3 p-2 ml-1 hover:cursor-pointer"
                onClick={() => navigate('/')}
            >
                <Logo size={50} />
                <span className="text-5xl text-[#243954] font-['Red_Hat_Display'] font-bold">
                    MedX
                </span>
            </div>

            {/* Signup Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden mb-17">
                {/* Header */}
                <div className="bg-[#243954] p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value.trim())}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] focus:border-[#243954] outline-none transition"
                                placeholder="John"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value.trim())}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] focus:border-[#243954] outline-none transition"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

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
                            onChange={(e) => setPassword(e.target.value.trim())}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] focus:border-[#243954] outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value.trim())}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] focus:border-[#243954] outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* TODO: add a loader on the button while isSigningUp is true */}
                    <button
                        type="submit"
                        className="w-full bg-[#243954] text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                        disabled={isSigningUp}
                    >
                        Register
                    </button>
                </form>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 text-center border-t">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <a
                            href="/login"
                            className="text-[15px] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/login');
                            }}
                        >
                            Login!
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;