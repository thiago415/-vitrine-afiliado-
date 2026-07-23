import React, { useState, useEffect } from 'react';
import { Language, AffiliateProduct, SocialChannel } from './types';
import { AFFILIATE_PRODUCTS, SOCIAL_CHANNELS, PROFILE } from './data/websiteData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AffiliateShowcase } from './components/AffiliateShowcase';
import { SocialIntegrations } from './components/SocialIntegrations';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { Services } from './components/Services';
import { ContentFeed } from './components/ContentFeed';
import { LinksSection } from './components/LinksSection';
import { ProjectCalculator } from './components/ProjectCalculator';
import { ContactModal } from './components/ContactModal';
import { AffiliateAdminModal } from './components/AffiliateAdminModal';
import { AuthModal } from './components/AuthModal';
import { SocialConnectModal } from './components/SocialConnectModal';
import { LinktreeMobilePreviewModal } from './components/LinktreeMobilePreviewModal';
import { SocialPlannerStudio } from './components/SocialPlannerStudio';
import { BeaconsMediaKit } from './components/BeaconsMediaKit';
import { Footer } from './components/Footer';
import { auth, db, onAuthStateChanged, doc, setDoc, getDoc, onSnapshot, User } from './lib/firebase';
import { compressImage } from './lib/imageCompressor';
import { Sparkles, UserCheck, Share2, Copy, Check } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('pt');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [contactOpen, setContactOpen] = useState<boolean>(false);
  const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [socialConnectOpen, setSocialConnectOpen] = useState<boolean>(false);
  const [linktreePreviewOpen, setLinktreePreviewOpen] = useState<boolean>(false);
  const [contactInitialMessage, setContactInitialMessage] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [pixKey, setPixKey] = useState<string>(() => {
    return localStorage.getItem('affiliate_pix_key') || 'thiagolino974@gmail.com';
  });

  const handleSavePixKey = (key: string) => {
    setPixKey(key);
    localStorage.setItem('affiliate_pix_key', key);
  };

  // Profile Custom Avatar State
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('affiliate_user_avatar') || PROFILE.avatarUrl;
  });

  const handleUpdateAvatar = async (newAvatarUrl: string) => {
    const compressed = await compressImage(newAvatarUrl, 350, 350, 0.8);
    setCustomAvatarUrl(compressed);
    try {
      localStorage.setItem('affiliate_user_avatar', compressed);
    } catch (e) {
      console.warn('LocalStorage full', e);
    }
    if (userProfile) {
      setUserProfile({ ...userProfile, avatarUrl: compressed });
    }
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      setDoc(userRef, { avatarUrl: compressed }, { merge: true }).catch(console.error);
    }
  };

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    handle: string;
    bio: string;
    avatarUrl: string;
    whatsappNumber: string;
    telegramChannel: string;
  } | null>(null);

  // Affiliate products state with Firestore & LocalStorage persistence
  const [products, setProducts] = useState<AffiliateProduct[]>(() => {
    try {
      const saved = localStorage.getItem('affiliate_products_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return AFFILIATE_PRODUCTS;
  });

  // Social channels state
  const [channels, setChannels] = useState<SocialChannel[]>(() => {
    try {
      const saved = localStorage.getItem('affiliate_channels_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SOCIAL_CHANNELS;
  });

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load User Profile from Firestore
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as any;
          setUserProfile(data);
        } else {
          // Initialize user profile in Firestore
          const newProfile = {
            name: user.displayName || user.email?.split('@')[0] || 'Afiliado VIP',
            handle: `@${user.email?.split('@')[0] || 'afiliado'}`,
            bio: 'Afiliado de produtos digitais, cursos e tecnologia.',
            avatarUrl: user.photoURL || PROFILE.avatarUrl,
            whatsappNumber: '',
            telegramChannel: ''
          };
          await setDoc(userRef, newProfile, { merge: true });
          setUserProfile(newProfile);
        }

        // Listen to User's custom products in Firestore
        const unsubProducts = onSnapshot(doc(db, 'users', user.uid, 'settings', 'store'), (snap) => {
          if (snap.exists()) {
            const storeData = snap.data();
            if (storeData.products && Array.isArray(storeData.products)) {
              setProducts(storeData.products);
            }
            if (storeData.channels && Array.isArray(storeData.channels)) {
              setChannels(storeData.channels);
            }
          }
        });

        return () => unsubProducts();
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save profile to Firestore
  const handleSaveProfile = async (profileData: {
    name: string;
    handle: string;
    bio: string;
    avatarUrl: string;
    whatsappNumber: string;
    telegramChannel: string;
  }) => {
    const compressedAvatar = await compressImage(profileData.avatarUrl, 350, 350, 0.8);
    const updated = { ...profileData, avatarUrl: compressedAvatar };
    setUserProfile(updated);
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, updated, { merge: true });
    }
  };

  // Save products
  const handleSaveProducts = async (updatedProducts: AffiliateProduct[]) => {
    // Compress any raw uploaded base64 product images
    const sanitizedProducts = await Promise.all(
      updatedProducts.map(async (prod) => {
        if (prod.imageUrl && prod.imageUrl.startsWith('data:image')) {
          const compressed = await compressImage(prod.imageUrl, 500, 500, 0.8);
          return { ...prod, imageUrl: compressed };
        }
        return prod;
      })
    );
    setProducts(sanitizedProducts);
    try {
      localStorage.setItem('affiliate_products_data', JSON.stringify(sanitizedProducts));
      if (currentUser) {
        const storeRef = doc(db, 'users', currentUser.uid, 'settings', 'store');
        await setDoc(storeRef, { products: sanitizedProducts, channels }, { merge: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save channels
  const handleSaveChannels = async (updatedChannels: SocialChannel[]) => {
    setChannels(updatedChannels);
    try {
      localStorage.setItem('affiliate_channels_data', JSON.stringify(updatedChannels));
      if (currentUser) {
        const storeRef = doc(db, 'users', currentUser.uid, 'settings', 'store');
        await setDoc(storeRef, { products, channels: updatedChannels }, { merge: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset demo data
  const handleResetData = async () => {
    setProducts(AFFILIATE_PRODUCTS);
    setChannels(SOCIAL_CHANNELS);
    localStorage.removeItem('affiliate_products_data');
    localStorage.removeItem('affiliate_channels_data');
    if (currentUser) {
      const storeRef = doc(db, 'users', currentUser.uid, 'settings', 'store');
      await setDoc(storeRef, { products: AFFILIATE_PRODUCTS, channels: SOCIAL_CHANNELS }, { merge: true });
    }
  };

  // Track product click
  const handleProductClick = (productId: string) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, clicks: p.clicks + 1 };
      }
      return p;
    });
    handleSaveProducts(updated);
  };

  const toggleLanguage = () => {
    setLang(prev => (prev === 'pt' ? 'en' : 'pt'));
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleOpenContactWithService = (serviceName: string) => {
    setContactInitialMessage(
      lang === 'pt'
        ? `Olá! Gostaria de solicitar uma proposta para o serviço: ${serviceName}.`
        : `Hello! I would like to request a proposal for: ${serviceName}.`
    );
    setContactOpen(true);
  };

  const handleSendEstimate = (summary: string) => {
    setContactInitialMessage(
      lang === 'pt'
        ? `Olá! Realizei uma simulação de projeto no seu site:\n\n${summary}\n\nGostaria de agendar uma reunião.`
        : `Hello! I ran a project estimate on your website:\n\n${summary}\n\nI would like to schedule a call.`
    );
    setContactOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Banner when logged in as an affiliate */}
      {currentUser && (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border-b border-indigo-500/30 text-white text-xs py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-xl truncate">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1 shrink-0">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Afiliado Ativo' : 'Active Affiliate'}</span>
            </span>
            <span className="truncate">
              {lang === 'pt'
                ? `Sua vitrine está sincronizada (${userProfile?.handle || currentUser.email})`
                : `Your showcase is live (${userProfile?.handle || currentUser.email})`}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setAuthOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/60 hover:bg-indigo-600 text-[11px] font-bold transition"
            >
              {lang === 'pt' ? 'Editar Meu Perfil' : 'Edit Profile'}
            </button>
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold flex items-center gap-1 transition"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Copiar Link' : 'Copy Link')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        lang={lang}
        onLanguageToggle={toggleLanguage}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
        onOpenContact={() => {
          setContactInitialMessage('');
          setContactOpen(true);
        }}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenLinktreePreview={() => setLinktreePreviewOpen(true)}
        currentUser={currentUser}
        userProfile={userProfile}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Main Page Content */}
      <main>
        {/* Hero Section */}
        <Hero
          lang={lang}
          onOpenContact={() => {
            setContactInitialMessage('');
            setContactOpen(true);
          }}
          onOpenCalculator={() => setCalculatorOpen(true)}
          onOpenAdmin={() => setAdminOpen(true)}
          onOpenLinktreePreview={() => setLinktreePreviewOpen(true)}
          isDarkMode={isDarkMode}
          customAvatarUrl={customAvatarUrl}
          onUpdateAvatar={handleUpdateAvatar}
        />

        {/* Affiliate Showcase & Product Deals Grid */}
        <AffiliateShowcase
          lang={lang}
          isDarkMode={isDarkMode}
          products={products}
          onProductClick={handleProductClick}
          onOpenAdmin={() => setAdminOpen(true)}
        />

        {/* Connected Social Channels Hub */}
        <SocialIntegrations
          lang={lang}
          isDarkMode={isDarkMode}
          channels={channels}
          onOpenConnectModal={() => setSocialConnectOpen(true)}
          onSaveChannels={handleSaveChannels}
          products={products}
          onSaveProducts={handleSaveProducts}
        />

        {/* AI Social Content Studio & Publisher (Metricool/Publer/Blog2Social) */}
        <SocialPlannerStudio
          lang={lang}
          isDarkMode={isDarkMode}
          channels={channels}
          products={products}
          onOpenContact={() => setContactOpen(true)}
        />

        {/* Creator Media Kit & Rate Card (Beacons.ai/Lnk.Bio) */}
        <BeaconsMediaKit
          lang={lang}
          isDarkMode={isDarkMode}
          onOpenContact={(initialMsg) => {
            if (initialMsg) setContactInitialMessage(initialMsg);
            setContactOpen(true);
          }}
          pixKey={pixKey}
        />

        {/* Services & Sponsorships */}
        <Services
          lang={lang}
          isDarkMode={isDarkMode}
          onOpenContactWithService={handleOpenContactWithService}
        />

        {/* Portfolio & Case Studies */}
        <Projects lang={lang} isDarkMode={isDarkMode} />

        {/* About & Bio */}
        <About lang={lang} isDarkMode={isDarkMode} />

        {/* Content Feed & Videos */}
        <ContentFeed lang={lang} isDarkMode={isDarkMode} />

        {/* All Links Quick List */}
        <LinksSection
          lang={lang}
          isDarkMode={isDarkMode}
          channels={channels}
          products={products}
          pixKey={pixKey}
          onOpenConnectModal={() => setSocialConnectOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer lang={lang} isDarkMode={isDarkMode} />

      {/* Modals */}
      <AuthModal
        lang={lang}
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        currentUser={currentUser}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        isDarkMode={isDarkMode}
      />

      <ProjectCalculator
        lang={lang}
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        onSendEstimate={handleSendEstimate}
        isDarkMode={isDarkMode}
      />

      <ContactModal
        lang={lang}
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        initialMessage={contactInitialMessage}
        isDarkMode={isDarkMode}
      />

      <AffiliateAdminModal
        lang={lang}
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        onSaveProducts={handleSaveProducts}
        channels={channels}
        onSaveChannels={handleSaveChannels}
        onResetData={handleResetData}
        isDarkMode={isDarkMode}
        customAvatarUrl={customAvatarUrl}
        onUpdateAvatar={handleUpdateAvatar}
      />

      <SocialConnectModal
        lang={lang}
        isOpen={socialConnectOpen}
        onClose={() => setSocialConnectOpen(false)}
        channels={channels}
        onSaveChannels={handleSaveChannels}
        products={products}
        onSaveProducts={handleSaveProducts}
        isDarkMode={isDarkMode}
      />

      <LinktreeMobilePreviewModal
        lang={lang}
        isOpen={linktreePreviewOpen}
        onClose={() => setLinktreePreviewOpen(false)}
        channels={channels}
        products={products}
        pixKey={pixKey}
        onOpenAdmin={() => {
          setLinktreePreviewOpen(false);
          setAdminOpen(true);
        }}
        isDarkMode={isDarkMode}
        customAvatarUrl={customAvatarUrl}
      />

    </div>
  );
}
