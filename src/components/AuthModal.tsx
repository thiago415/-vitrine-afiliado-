import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, LogIn, UserPlus, LogOut, ShieldCheck, Mail, Lock, Sparkles, Check, AtSign, Phone, Send, Image as ImageIcon, KeyRound } from 'lucide-react';
import { Language } from '../types';
import { auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, db, doc, setDoc, getDoc, User } from '../lib/firebase';

interface AuthModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  userProfile: {
    name: string;
    handle: string;
    bio: string;
    avatarUrl: string;
    whatsappNumber: string;
    telegramChannel: string;
  } | null;
  onSaveProfile: (profile: {
    name: string;
    handle: string;
    bio: string;
    avatarUrl: string;
    whatsappNumber: string;
    telegramChannel: string;
  }) => Promise<void>;
  isDarkMode: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  lang,
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onSaveProfile,
  isDarkMode
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>(currentUser ? 'profile' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile fields state
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramChannel, setTelegramChannel] = useState('');

  useEffect(() => {
    if (currentUser) {
      setMode('profile');
      if (userProfile) {
        setName(userProfile.name || currentUser.displayName || '');
        setHandle(userProfile.handle || `@${currentUser.email?.split('@')[0] || 'afiliado'}`);
        setBio(userProfile.bio || '');
        setAvatarUrl(userProfile.avatarUrl || currentUser.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80');
        setWhatsappNumber(userProfile.whatsappNumber || '');
        setTelegramChannel(userProfile.telegramChannel || '');
      } else {
        setName(currentUser.displayName || currentUser.email?.split('@')[0] || 'Afiliado VIP');
        setHandle(`@${currentUser.email?.split('@')[0] || 'afiliado'}`);
        setAvatarUrl(currentUser.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80');
      }
    } else {
      setMode('login');
    }
  }, [currentUser, userProfile]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg(lang === 'pt' ? 'Login realizado com sucesso!' : 'Login successful!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMsg(lang === 'pt' ? 'E-mail ou senha incorretos.' : 'Invalid email or password.');
      } else {
        setErrorMsg(err.message || 'Erro ao realizar login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      
      const defaultProfile = {
        name: name || user.email?.split('@')[0] || 'Novo Afiliado',
        handle: handle ? (handle.startsWith('@') ? handle : `@${handle}`) : `@${user.email?.split('@')[0]}`,
        bio: bio || (lang === 'pt' ? 'Afiliado de produtos digitais, cursos e tecnologia.' : 'Digital products & tech affiliate.'),
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
        whatsappNumber: whatsappNumber || '',
        telegramChannel: telegramChannel || ''
      };

      await onSaveProfile(defaultProfile);
      setSuccessMsg(lang === 'pt' ? 'Conta de Afiliado criada com sucesso!' : 'Affiliate account created successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg(lang === 'pt' ? 'Este e-mail já está cadastrado. Tente entrar.' : 'Email already in use.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg(lang === 'pt' ? 'A senha deve ter pelo menos 6 caracteres.' : 'Password must be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Erro ao criar conta.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMsg(lang === 'pt' ? 'Login via Google realizado!' : 'Google sign in successful!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao entrar com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await onSaveProfile({
        name,
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        bio,
        avatarUrl,
        whatsappNumber,
        telegramChannel
      });
      setSuccessMsg(lang === 'pt' ? 'Perfil atualizado com sucesso!' : 'Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao salvar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMode('login');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`relative w-full max-w-md my-8 rounded-3xl border shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/40 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">
                {currentUser ? (lang === 'pt' ? 'Minha Conta de Afiliado' : 'Affiliate Account') : (lang === 'pt' ? 'Área do Afiliado' : 'Affiliate Portal')}
              </h3>
              <p className="text-xs text-slate-400">
                {currentUser ? currentUser.email : (lang === 'pt' ? 'Entre ou crie sua conta para montar sua vitrine' : 'Login or sign up to manage your showcase')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        {!currentUser ? (
          <div className="flex border-b border-slate-800/40 bg-slate-950/20">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Entrar' : 'Login'}</span>
            </button>

            <button
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Criar Conta' : 'Sign Up'}</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80'}
                alt={name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500"
              />
              <div>
                <span className="text-xs font-bold block">{name || 'Afiliado VIP'}</span>
                <span className="text-[11px] text-indigo-400 font-mono">{handle || '@afiliado'}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Sair' : 'Logout'}</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && !currentUser && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Seu E-mail' : 'Your Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="exemplo@afiliado.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Senha' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 transition hover:scale-[1.01]"
              >
                {loading ? (lang === 'pt' ? 'Entrando...' : 'Logging in...') : (lang === 'pt' ? 'Entrar na Conta' : 'Login to Account')}
              </button>

              <div className="relative my-4 text-center">
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 relative z-10">
                  {lang === 'pt' ? 'ou continue com' : 'or continue with'}
                </span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center gap-2 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && !currentUser && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Nome Completo / Canal' : 'Full Name or Channel'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Thiago Lino Afiliado"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Seu Handle (@)' : 'Your Handle (@)'}
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={e => setHandle(e.target.value)}
                    placeholder="thiagolino"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Seu E-mail' : 'Your Email'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@afiliado.com"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Crie uma Senha' : 'Create a Password'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="No mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 transition hover:scale-[1.01]"
              >
                {loading ? (lang === 'pt' ? 'Criando Conta...' : 'Creating Account...') : (lang === 'pt' ? 'Cadastrar e Montar Minha Vitrine' : 'Register & Build Showcase')}
              </button>
            </form>
          )}

          {/* EDIT PROFILE FORM (LOGGED IN) */}
          {currentUser && (
            <form onSubmit={handleSaveProfileSubmit} className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-indigo-400 tracking-wider">
                {lang === 'pt' ? 'Editar Informações da Sua Vitrine' : 'Edit Showcase Profile'}
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Nome do Afiliado / Canal' : 'Affiliate Name / Channel'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Handle (@)' : 'Handle (@)'}
                </label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'URL da Sua Foto de Perfil (Avatar)' : 'Avatar Photo URL'}
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Bio / Apresentação' : 'Bio / Tagline'}
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp (DDD + Número)
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="5511999999999"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Canal do Telegram
                  </label>
                  <input
                    type="text"
                    value={telegramChannel}
                    onChange={e => setTelegramChannel(e.target.value)}
                    placeholder="t.me/seucanal"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition hover:scale-[1.01]"
              >
                {loading ? (lang === 'pt' ? 'Salvando...' : 'Saving...') : (lang === 'pt' ? 'Salvar Perfil' : 'Save Profile')}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
