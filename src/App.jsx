import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Post from './pages/Post';
import About from './pages/About';
import ShortsPage from './pages/Shorts';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CitizenJournalist from './pages/CitizenJournalist';


import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import AllStories from './pages/dashboard/AllStories';
import AddStory from './pages/dashboard/AddStory';
import EditStory from './pages/dashboard/EditStory';
import Categories from './pages/dashboard/Categories';
import Team from './pages/dashboard/Team';
import PendingApproval from './pages/dashboard/PendingApproval';
import ApprovedPosts from './pages/dashboard/ApprovedPosts';
import RejectedPosts from './pages/dashboard/RejectedPosts';
import HiddenPosts from './pages/dashboard/HiddenPosts';
import Newsletter from './pages/dashboard/Newsletter';
import Shorts from './pages/dashboard/Shorts';
import Leads from './pages/dashboard/Leads';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';


function LenisWrapper({ children }) {
  const location = useLocation();

  useEffect(() => {
    
    if (location.pathname.startsWith('/dashboard')) {
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      direction: 'vertical',
      gestureDirection: 'vertical',
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [location.pathname]);

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <LenisWrapper>
        <Routes>
         
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shorts" element={<ShortsPage />} />
            <Route path="contact" element={<Contact />} />
             <Route path="CitizenJournalist" element={<CitizenJournalist />} />
            <Route path="about" element={<About />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path=":category/:slug" element={<Post />} />
          </Route>

         
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Layout />
              </PublicRoute>
            }
          >
            <Route index element={<Login />} />
          </Route>

         
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="stories" element={<AllStories />} />
            <Route path="stories/add" element={<AddStory />} />
            <Route path="stories/edit/:id" element={<EditStory />} />
            <Route path="categories" element={<Categories />} />
            <Route path="team" element={<Team />} />
            <Route path="leads" element={<Leads mode="contact" />} />
            <Route path="citizen-journalist" element={<Leads mode="citizen" />} />
            <Route path="pending-approval" element={<PendingApproval />} />
            <Route path="approved-posts" element={<ApprovedPosts />} />
            <Route path="rejected-posts" element={<RejectedPosts />} />
            <Route path="hidden-posts" element={<HiddenPosts />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="shorts" element={<Shorts />} />
          </Route>
        </Routes>
      </LenisWrapper>
    </BrowserRouter>
  );
}

export default App;
