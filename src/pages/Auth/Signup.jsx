// src/pages/Auth/Signup.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (!formData.displayName.trim()) {
      setError('Le nom d\'utilisateur est requis');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.displayName);
      navigate('/recipes');
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setError(
        error.code === 'auth/email-already-in-use'
          ? 'Cette adresse email est déjà utilisée'
          : 'Une erreur est survenue lors de l\'inscription'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-soft p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sage-900">Umami Lab</h1>
          <h2 className="mt-2 text-lg text-sage-600">Créer un compte</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-sage-700">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                focus:border-earth-500 focus:ring-earth-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                focus:border-earth-500 focus:ring-earth-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                focus:border-earth-500 focus:ring-earth-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage-700">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border-sage-300 shadow-soft
                focus:border-earth-500 focus:ring-earth-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-earth-600 text-white rounded-lg
              hover:bg-earth-700 transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création du compte...' : 'Créer un compte'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link 
            to="/login"
            className="text-earth-600 hover:text-earth-700"
          >
            Déjà inscrit ? Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;