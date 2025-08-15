import React, { useState } from 'react';
import { useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react';
import { MessageSquare, CheckCircle, X } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [signedUpEmail, setSignedUpEmail] = useState('');

  const { signInEmailPassword, isLoading: isSigningIn } = useSignInEmailPassword();
  const { signUpEmailPassword, isLoading: isSigningUp } = useSignUpEmailPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      const result = await signUpEmailPassword(email, password);

      if (result.error) {
        setErrorMessage(result.error.message);
        setShowErrorPopup(true);
      } else {
        setSignedUpEmail(email); // Save email for success popup
        setShowSuccessPopup(true);
        setEmail(''); // Clear form fields
        setPassword('');
        setIsSignUp(false);
      }
    } else {
      const result = await signInEmailPassword(email, password);

      if (result.error) {
        const errorMsg = result.error.message?.toLowerCase() || '';
        if (
          errorMsg.includes('invalid') ||
          errorMsg.includes('user') ||
          errorMsg.includes('not found') ||
          errorMsg.includes('email') ||
          errorMsg.includes('password')
        ) {
          setErrorMessage('Please sign up, your email is not valid.');
        } else {
          setErrorMessage(result.error.message);
        }
        setShowErrorPopup(true);
      }
    }
  };

  const closeSuccessPopup = () => setShowSuccessPopup(false);
  const closeErrorPopup = () => setShowErrorPopup(false);

  const isLoading = isSigningIn || isSigningUp;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Hexagonal pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.3) 2px, transparent 2px),
            radial-gradient(circle at 75px 75px, rgba(59, 130, 246, 0.2) 2px, transparent 2px)
          `,
          backgroundSize: '100px 100px'
        }}></div>
      </div>
      
      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button
              onClick={closeErrorPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900 rounded-full mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Sign In Failed</h2>
              <p className="text-gray-300 mb-6">{errorMessage}</p>
              <button
                onClick={closeErrorPopup}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button
              onClick={closeSuccessPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Account Created Successfully!</h2>
              <p className="text-gray-300 mb-6">
                Your account has been successfully created! A verification link has been sent to <strong>{signedUpEmail}</strong>. 
                Please verify your email to continue. Don't forget to check your spam folder if you don’t see the email in your inbox.
              </p>
              <button
                onClick={closeSuccessPopup}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login/Signup Form */}
      <div className="w-full max-w-md">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">AI Assistant - Chatbot</h1>
            <p className="text-gray-300">{isSignUp ? 'Create your account' : 'Welcome back'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
