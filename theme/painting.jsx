import React, { useState, useMemo, useEffect } from 'react';
import { 
  Music, Palette, Rocket, BookOpen, ShieldCheck, 
  LayoutDashboard, Sparkles, Plus, TrendingUp, 
  Award, Clock, Upload, Send, Heart, Eye, 
  Share2, MessageCircle, Settings, LogOut, 
  ChevronRight, Star, Moon, Sun, Menu, X,
  CheckCircle2, AlertCircle, Calendar, Play,
  Mic, Camera, PenTool, Book, Info, Filter
} from 'lucide-react';

// --- ARTISTIC PAINTING TOKENS ---
const THEMES = {
  moonlit: {
    name: 'Nighttime Canvas',
    id: 'dark',
    bg: 'bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca]', 
    surface: 'bg-[#3730a3]',
    card: 'bg-white/95 rounded-[40px] shadow-[6px_8px_0px_#312e81]',
    text: 'text-indigo-950',
    muted: 'text-indigo-500',
    accentText: 'text-yellow-400',
  },
  storybook: {
    name: 'Painted Landscape',
    id: 'light',
    // Sky blue watercolor base
    bg: 'bg-[#e0f2fe]', 
    surface: 'bg-white', 
    card: 'bg-white/95 shadow-[8px_10px_0px_rgba(2,132,199,0.2)] border-2 border-sky-100', 
    text: 'text-[#0c4a6e]', 
    muted: 'text-[#0284c7]', 
    accentText: 'text-[#ea580c]', 
  }
};

const CONTENT_ITEMS = [
  { id: 1, type: 'song', title: 'Stars in my Pocket', date: '12 Oct', category: 'Original', views: 1240, status: 'Published', visibility: 'public', sections: ['home', 'music', 'space'], thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600', description: "A melody found while staring at Orion.", story: "Ahana wrote this after her first visit to the planetarium. She hummed the melody for three days straight!", platforms: ['YouTube', 'Instagram'], medium: 'Acoustic & Vocals' },
  { id: 2, type: 'art', title: 'The Mars Garden', date: '05 Nov', category: 'Watercolor', views: 850, status: 'Published', visibility: 'public', sections: ['home', 'art', 'space'], thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600', description: "Imagining botanicals in the red dust.", story: "We discussed how life might survive on Mars, and Ahana decided they would need 'glass bubbles' for sun.", platforms: ['Instagram'], medium: 'Watercolor & Ink' },
  { id: 3, type: 'video', title: 'Nebula Flow', date: '01 Dec', category: 'Dance', views: 2100, status: 'Scheduled', visibility: 'private', sections: ['home', 'milestones'], thumbnail: 'https://images.unsplash.com/photo-1464802686167-b939a67e06a1?w=600', description: "Modern movements inspired by stardust.", story: "The costume was handmade by Ahana using recycled silk.", platforms: ['YouTube'], medium: 'Contemporary Dance' },
  { id: 4, type: 'reading', title: 'Girl Who Drank the Moon', date: '10 Dec', category: 'Reading', views: 420, status: 'Published', visibility: 'public', sections: ['home', 'reading'], thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', description: "Why this story made me want to paint with purples.", story: "Ahana finished this book in two days and immediately asked for more moonlight-colored paint.", platforms: ['Website'], medium: 'Literary Reflection' }
];

const TABS = [
  { id: 'home', label: 'Home', icon: Sparkles },
  { id: 'music', label: 'Songs', icon: Music },
  { id: 'art', label: 'Sketches', icon: Palette },
  { id: 'space', label: 'Science', icon: Rocket },
  { id: 'reading', label: 'Books', icon: BookOpen },
  { id: 'milestones', label: 'Journey', icon: Award },
];

// --- HELPER COMPONENTS ---

const Cloud = ({ className }) => (
  <div className={`absolute pointer-events-none opacity-90 ${className}`}>
    <div className="w-32 h-10 bg-white/90 backdrop-blur-sm relative shadow-[inset_-3px_-5px_10px_rgba(0,0,0,0.05)] paint-box">
      <div className="absolute w-16 h-16 bg-white/90 rounded-[40%_60%_70%_30%] -top-8 left-2 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8)]"></div>
      <div className="absolute w-20 h-20 bg-white/90 rounded-[50%_50%_40%_60%] -top-10 right-2 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8)]"></div>
    </div>
  </div>
);

// Watercolor Splatters for the background
const WatercolorWash = ({ color, size, position }) => (
  <div className={`absolute ${position} ${size} rounded-full blur-[80px] mix-blend-multiply opacity-50 pointer-events-none ${color} z-0`}></div>
);

// --- MAIN APP ---

const App = () => {
  const [themeMode, setThemeMode] = useState('storybook');
  const [view, setView] = useState('child'); 
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);

  const t = THEMES[themeMode];

  useEffect(() => setSelectedItem(null), [view]);

  const publicContent = useMemo(() => {
    return CONTENT_ITEMS.filter(item => 
      item.visibility === 'public' && 
      item.status === 'Published' && 
      (activeTab === 'home' || item.sections.includes(activeTab))
    );
  }, [activeTab]);

  return (
    <div className="antialiased min-h-screen font-friendly overflow-x-hidden bg-[#fafaf9]">
      {/* --- CSS FOR BRUSH STROKES, OIL PAINTING SHADOWS, & CANVAS TEXTURE --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Nunito:wght@400..900&display=swap');
        
        .font-brush { font-family: 'Caveat', cursive; }
        .font-friendly { font-family: 'Nunito', sans-serif; }
        
        /* Canvas Texture Overlay */
        .canvas-texture {
            background-image: url("https://www.transparenttextures.com/patterns/white-wall.png");
        }

        /* Hand-painted irregular box effect */
        .paint-box {
            border-radius: 255px 15px 225px 15px/15px 225px 15px 255px;
        }

        .paint-card {
            border-radius: 15px 40px 20px 30px/30px 20px 40px 15px;
        }

        /* Oil Paint Impasto Buttons */
        .paint-btn-green {
            background: linear-gradient(135deg, #a3e635, #65a30d);
            border-radius: 255px 20px 225px 20px/20px 225px 20px 255px;
            box-shadow: 4px 6px 0px #4d7c0f, inset 2px 2px 5px rgba(255,255,255,0.4);
            color: white;
            transition: all 0.2s ease;
            border: 2px solid #bef264;
        }
        .paint-btn-green:active {
            transform: translate(2px, 4px);
            box-shadow: 2px 2px 0px #4d7c0f;
        }

        .paint-btn-orange {
            background: linear-gradient(135deg, #fb923c, #ea580c);
            border-radius: 20px 255px 20px 225px/225px 20px 255px 20px;
            box-shadow: 4px 6px 0px #9a3412, inset 2px 2px 5px rgba(255,255,255,0.4);
            color: white;
            transition: all 0.2s ease;
            border: 2px solid #fdba74;
        }
        .paint-btn-orange:active {
            transform: translate(2px, 4px);
            box-shadow: 2px 2px 0px #9a3412;
        }

        /* Painted Ribbon */
        .painted-ribbon {
            position: absolute;
            top: 20px;
            left: -15px;
            background: linear-gradient(135deg, #38bdf8, #0284c7);
            color: white;
            padding: 8px 20px;
            border-radius: 255px 10px 10px 255px/10px 255px 255px 10px;
            box-shadow: 3px 4px 0px #0369a1;
            font-family: 'Caveat', cursive;
            font-size: 1.25rem;
            font-weight: 700;
            z-index: 10;
        }
        .painted-ribbon::before {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 5px;
            border-top: 10px solid #075985;
            border-left: 10px solid transparent;
        }

        /* Bubbly Date Badge (Watercolor style) */
        .painted-badge {
            position: absolute;
            top: -20px;
            right: 20px;
            background: linear-gradient(135deg, #fca5a5, #ef4444);
            border: 3px solid #fecaca;
            color: white;
            width: 70px;
            height: 70px;
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            line-height: 1;
            box-shadow: 4px 5px 0px #b91c1c;
            z-index: 10;
            transform: rotate(5deg);
        }

        /* Image Oil Filter Effect */
        .oil-filter {
            filter: contrast(1.1) saturate(1.2) sepia(0.1);
        }

        /* Animations */
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -15px); }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
      `}} />

      {/* --- 1. PUBLIC SITE --- */}
      {view === 'public' && (
        <div className={`min-h-screen ${t.bg} canvas-texture transition-colors duration-500 relative pb-40`}>
          
          {/* Watercolor Splatters & Clouds */}
          {themeMode === 'storybook' && (
             <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <WatercolorWash color="bg-cyan-300" size="w-[500px] h-[500px]" position="-top-20 -left-20" />
                <WatercolorWash color="bg-yellow-200" size="w-[600px] h-[600px]" position="top-40 right-10" />
                <WatercolorWash color="bg-emerald-200" size="w-[400px] h-[400px]" position="bottom-40 left-1/4" />

                <Cloud className="top-20 left-[10%] animate-float-slow scale-150" />
                <Cloud className="top-40 right-[15%] animate-float-slow scale-100" style={{ animationDelay: '2s' }} />
                <Cloud className="top-80 left-[30%] animate-float-slow scale-75 opacity-60" style={{ animationDelay: '4s' }} />
                
                {/* Whimsical Drawn Elements */}
                <div className="absolute top-[15%] right-[25%] text-6xl animate-float-slow opacity-80" style={{ animationDelay: '1s' }}>🪁</div>
                <div className="absolute top-[25%] left-[5%] text-6xl animate-float-slow opacity-80" style={{ animationDelay: '3s' }}>🎈</div>
             </div>
          )}

          {/* Painted Rolling Hills at Bottom */}
          {themeMode === 'storybook' && (
            <div className="absolute bottom-0 left-0 w-full h-72 z-0 overflow-hidden pointer-events-none">
               <div className="absolute bottom-[-150px] left-[-15%] w-[70%] h-[350px] bg-gradient-to-t from-[#4d7c0f] to-[#84cc16] paint-box border-4 border-[#65a30d] opacity-90 shadow-[inset_0_20px_40px_rgba(255,255,255,0.3)]"></div>
               <div className="absolute bottom-[-180px] right-[-10%] w-[80%] h-[400px] bg-gradient-to-t from-[#3f6212] to-[#a3e635] rounded-[40%_60%_100%_0%] border-4 border-[#84cc16] shadow-[inset_0_20px_30px_rgba(255,255,255,0.2)]"></div>
            </div>
          )}
          
          <nav className="relative z-50 px-6 py-6">
            <div className="max-w-6xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-md p-4 paint-box shadow-[6px_8px_0px_rgba(2,132,199,0.15)] border-2 border-white">
              
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-4 pl-2 group">
                <div className="text-4xl group-hover:rotate-12 transition-transform">🎨</div>
                <span className="text-5xl font-brush font-bold text-[#ea580c] tracking-wide mt-1 drop-shadow-sm">Ahana's World</span>
              </button>

              <div className="hidden lg:flex gap-3">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2.5 font-brush font-bold text-3xl transition-all ${
                      activeTab === tab.id 
                        ? `paint-btn-green tracking-wide` 
                        : `text-[#0f766e] hover:bg-white/50 paint-box tracking-wide`
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button className={`paint-btn-orange px-8 py-2 font-brush font-bold text-3xl hidden md:block tracking-wide`}>
                Say Hello!
              </button>
            </div>
          </nav>

          <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
            {activeTab === 'home' && (
              <header className="text-center mb-24 relative">
                <h1 className="text-7xl md:text-8xl font-brush font-bold mb-6 text-[#0f766e] drop-shadow-[2px_2px_0px_rgba(255,255,255,0.8)] leading-none">
                  Songs, Sketches <br/>
                  <span className="text-[#ea580c]">& Stars!</span>
                </h1>
                <p className="text-2xl max-w-2xl mx-auto font-brush text-[#0c4a6e] bg-white/70 p-6 paint-box border-2 border-white backdrop-blur-sm shadow-sm leading-relaxed">
                  Welcome to my painted canvas. A magical place where I sing, mix watercolors, and explore the universe.
                </p>
                <div className="mt-10">
                  <button className="paint-btn-orange px-12 py-3 font-brush text-4xl tracking-wide">
                    Explore Gallery
                  </button>
                </div>
              </header>
            )}

            {/* Painted Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">
              {publicContent.map((item, index) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`${t.card} paint-card relative cursor-pointer hover:-translate-y-3 transition-transform duration-300 flex flex-col group ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0`}
                >
                  <div className="painted-ribbon tracking-wide">{item.category}</div>
                  
                  <div className="painted-badge font-brush">
                    <span className="text-3xl font-bold leading-none mt-1">{item.date.split(' ')[0]}</span>
                    <span className="text-sm uppercase leading-none">{item.date.split(' ')[1]}</span>
                  </div>

                  <div className="p-5 pb-0">
                    <div className="aspect-[4/3] paint-box overflow-hidden relative shadow-inner border-[3px] border-slate-100">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover oil-filter group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  </div>
                  
                  <div className="p-8 text-center flex-1 flex flex-col items-center">
                    <h3 className="text-4xl font-brush font-bold text-[#0f766e] mb-2 leading-none">{item.title}</h3>
                    <p className="text-[#0c4a6e] font-bold text-sm mb-8 line-clamp-2 px-2">{item.description}</p>
                    
                    <button className="paint-btn-orange px-8 py-2 font-brush text-2xl mt-auto tracking-wide">
                      Read Story
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      {/* --- 2. PARENT ADMIN --- */}
      {view === 'parent' && (
        <div className={`min-h-screen bg-[#f8fafc] canvas-texture ${t.text} flex relative`}>
          <aside className={`w-80 bg-white/80 backdrop-blur-sm shadow-[8px_0_0_rgba(14,165,233,0.1)] p-8 flex flex-col hidden lg:flex z-10 border-r-2 border-sky-100`}>
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#38bdf8] to-[#0284c7] paint-box shadow-[4px_6px_0_#0369a1] flex items-center justify-center text-white">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <p className="font-brush text-5xl font-bold text-[#0c4a6e] mt-2">Parent HQ</p>
            </div>
            <nav className="space-y-4">
              {['Creative Pulse', 'Release Calendar', 'Studio Notes', 'Archive'].map((link) => (
                <button key={link} className={`w-full text-left px-6 py-4 paint-box font-brush text-3xl transition-all ${link === 'Creative Pulse' ? `bg-sky-100 text-[#0284c7] border-2 border-sky-200 font-bold shadow-sm` : `text-slate-500 hover:bg-white border-2 border-transparent`}`}>
                  {link}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 p-12 overflow-y-auto z-10">
            <header className="flex justify-between items-end mb-12 bg-white/80 backdrop-blur-sm p-8 paint-box shadow-[6px_8px_0px_rgba(14,165,233,0.15)] border-2 border-white">
              <div>
                <h2 className="text-6xl font-brush font-bold text-[#ea580c] mb-1">The Release Queue</h2>
                <p className="font-bold text-slate-500 text-lg">Managing Ahana's canvas.</p>
              </div>
              <button className="paint-btn-green px-8 py-3 font-brush text-3xl flex items-center gap-2">
                <Plus className="w-6 h-6" /> Add New
              </button>
            </header>

            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white/90 backdrop-blur-sm paint-card p-10 shadow-[8px_10px_0px_rgba(14,165,233,0.15)] border-2 border-white">
                <div className="space-y-6">
                  {CONTENT_ITEMS.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 paint-box border-[3px] border-slate-100 hover:border-sky-300 transition cursor-pointer">
                       <div className="flex items-center gap-6">
                          <img src={item.thumbnail} className="w-24 h-24 paint-box object-cover shadow-sm oil-filter border-2 border-white" alt="" />
                          <div>
                            <p className="font-brush text-4xl font-bold text-[#0c4a6e]">{item.title}</p>
                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wide">{item.category} • {item.medium}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <span className={`px-6 py-2 paint-box border-2 font-brush text-2xl font-bold ${item.status === 'Published' ? 'bg-[#d1fae5] text-[#047857] border-[#34d399]' : 'bg-[#fef08a] text-[#a16207] border-[#facc15]'}`}>
                            {item.status}
                          </span>
                          <Settings className="w-6 h-6 text-slate-400" />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* --- 3. CHILD HUB (The Magic Landscape) --- */}
      {view === 'child' && (
        <div className={`min-h-screen ${t.bg} canvas-texture transition-colors duration-500 relative flex flex-col pb-40`}>
          
          {/* Watercolor Background & Clouds */}
          {themeMode === 'storybook' && (
             <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <WatercolorWash color="bg-cyan-400" size="w-[600px] h-[600px]" position="-top-32 -left-32" />
                <WatercolorWash color="bg-emerald-300" size="w-[500px] h-[500px]" position="top-1/3 -right-32" />
                <WatercolorWash color="bg-pink-300" size="w-[700px] h-[700px]" position="bottom-10 left-1/4" />

                <Cloud className="top-10 left-[20%] animate-float-slow scale-125" />
                <Cloud className="top-32 right-[20%] animate-float-slow scale-100" style={{ animationDelay: '2.5s' }} />
                
                {/* Drawn stickers floating */}
                <div className="absolute top-[20%] left-[10%] text-6xl animate-float-slow drop-shadow-sm opacity-90" style={{ animationDelay: '1s' }}>🦋</div>
                <div className="absolute top-[10%] right-[10%] text-6xl animate-float-slow drop-shadow-sm opacity-90" style={{ animationDelay: '4s' }}>🎈</div>
             </div>
          )}

          {/* Painted Grass Footer */}
          {themeMode === 'storybook' && (
            <div className="absolute bottom-0 left-0 w-full h-80 z-0 overflow-hidden pointer-events-none">
               <div className="absolute bottom-[-150px] left-[-20%] w-[80%] h-[400px] bg-gradient-to-t from-[#4d7c0f] to-[#84cc16] rounded-[50%_40%_0_0] opacity-90 border-t-4 border-[#65a30d]"></div>
               <div className="absolute bottom-[-200px] right-[-20%] w-[90%] h-[450px] bg-gradient-to-t from-[#3f6212] to-[#a3e635] rounded-[40%_60%_0_0] shadow-[inset_0_20px_30px_rgba(255,255,255,0.2)] border-t-4 border-[#84cc16]"></div>
               <div className="absolute bottom-[80px] left-[15%] text-7xl drop-shadow-[2px_4px_0px_rgba(0,0,0,0.2)]">🍄</div>
               <div className="absolute bottom-[40px] right-[25%] text-7xl drop-shadow-[2px_4px_0px_rgba(0,0,0,0.2)]">🦒</div>
            </div>
          )}

          <header className="relative p-8 md:p-12 flex justify-between items-center z-10">
            <div className="flex items-center gap-6 bg-white/80 backdrop-blur-md p-4 pr-10 paint-box shadow-[6px_8px_0px_rgba(2,132,199,0.15)] border-2 border-white">
              <div className="w-20 h-20 bg-gradient-to-br from-[#fca5a5] to-[#ef4444] paint-box shadow-[4px_5px_0_#b91c1c] flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-6xl font-brush font-bold text-[#0c4a6e] leading-none mt-2">Ahana's Studio</h1>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border-2 border-white px-8 py-4 paint-box flex items-center gap-4 shadow-[6px_8px_0px_rgba(2,132,199,0.15)]">
              <Award className="text-yellow-500 w-12 h-12 fill-yellow-500" />
              <div className="text-right">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Level</p>
                <p className="text-5xl font-brush font-black text-yellow-500 leading-none mt-2">8</p>
              </div>
            </div>
          </header>

          <main className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 md:p-12 max-w-[1400px] mx-auto flex-1 content-start z-10 w-full">
            
            {/* CAPTURE WIDGET */}
            <div className="lg:col-span-5 relative">
               <div className={`${t.card} paint-card p-10 relative`}>
                  <div className="painted-ribbon">NEW CANVAS</div>
                  <h2 className="text-6xl font-brush font-bold text-[#ea580c] mb-1 mt-8">Capture!</h2>
                  <p className="font-bold text-[#0f766e] text-lg mb-8">What did you paint or play today?</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                     {[
                       { icon: Mic, label: 'Sing', color: 'paint-btn-orange' },
                       { icon: Camera, label: 'Photo', color: 'paint-btn-green' },
                       { icon: PenTool, label: 'Draw', color: 'bg-gradient-to-br from-[#fcd34d] to-[#d97706] shadow-[4px_6px_0_#b45309,inset_2px_2px_5px_rgba(255,255,255,0.4)] text-white paint-box border-2 border-[#fde047]' },
                       { icon: Book, label: 'Read', color: 'bg-gradient-to-br from-[#c084fc] to-[#9333ea] shadow-[4px_6px_0_#7e22ce,inset_2px_2px_5px_rgba(255,255,255,0.4)] text-white paint-box border-2 border-[#d8b4fe]' },
                     ].map(act => (
                       <button key={act.label} className={`${act.color} p-6 flex flex-col items-center justify-center gap-3 transition-transform active:translate-y-[4px] active:shadow-[2px_2px_0_rgba(0,0,0,0.5)]`}>
                         <div className="bg-white/20 p-4 paint-box border-2 border-white/50 backdrop-blur-sm">
                            <act.icon className="w-10 h-10" />
                         </div>
                         <span className="text-4xl font-brush font-bold">{act.label}</span>
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* QUESTS LIST */}
            <div className="lg:col-span-4 relative">
               <div className={`${t.card} paint-card p-10 h-full flex flex-col`}>
                  <div className="painted-ribbon !bg-gradient-to-br !from-[#a3e635] !to-[#65a30d] !shadow-[#4d7c0f] before:!border-r-[#3f6212]">MISSIONS</div>
                  <h3 className="text-5xl font-brush font-bold text-[#0c4a6e] mb-6 mt-8">Today's Quest</h3>
                  <div className="space-y-6 flex-1">
                     {[
                       { t: "Practice Nebula melody", xp: 50, done: false },
                       { t: "Pick a color for Mars", xp: 30, done: true },
                       { t: "Read the Moon Story", xp: 20, done: false },
                     ].map((m, i) => (
                       <div key={i} className={`p-4 paint-box flex items-center justify-between cursor-pointer border-[3px] transition-all ${m.done ? 'bg-[#d1fae5] border-[#34d399]' : 'bg-slate-50 border-slate-200 hover:border-sky-300'}`}>
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 paint-box flex items-center justify-center shadow-inner ${m.done ? 'bg-[#10b981]' : 'bg-white border-2 border-slate-300'}`}>
                                {m.done && <CheckCircle2 className="w-6 h-6 text-white" />}
                             </div>
                             <span className="font-bold text-lg text-[#0c4a6e]">{m.t}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* BADGES / STAFF CIRCLES */}
            <div className="lg:col-span-3 space-y-8 relative">
               <div className={`${t.card} paint-card p-10 text-center`}>
                  <div className="painted-ribbon !bg-gradient-to-br !from-[#c084fc] !to-[#9333ea] !shadow-[#7e22ce] before:!border-r-[#581c87]">AWARDS</div>
                  <h3 className="text-5xl font-brush font-bold text-[#ea580c] mb-8 mt-8">Badges</h3>
                  <div className="grid grid-cols-2 gap-6">
                     {[
                       { icon: Award, gradient: 'from-[#fde047] to-[#eab308]', shadow: '#ca8a04' },
                       { icon: Rocket, gradient: 'from-[#7dd3fc] to-[#0284c7]', shadow: '#0369a1' },
                       { icon: Music, gradient: 'from-[#f9a8d4] to-[#db2777]', shadow: '#be185d' },
                       { icon: Palette, gradient: 'from-[#a7f3d0] to-[#10b981]', shadow: '#047857' },
                     ].map((BadgeItem, i) => (
                       <div key={i} className={`aspect-square bg-gradient-to-br ${BadgeItem.gradient} paint-box border-[3px] border-white flex items-center justify-center shadow-[4px_6px_0_${BadgeItem.shadow}] hover:-translate-y-2 transition-transform cursor-pointer`}>
                          <BadgeItem.icon className="w-12 h-12 text-white" />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </main>
        </div>
      )}

      {/* --- DEV NAVIGATION BAR --- */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-md border-[3px] border-sky-100 p-2 paint-box shadow-[6px_8px_0px_rgba(2,132,199,0.2)] flex gap-2">
        {['public', 'child', 'parent'].map(v => (
          <button 
            key={v}
            onClick={() => setView(v)}
            className={`px-8 py-3 paint-box font-brush text-3xl tracking-wide transition-all ${view === v ? `paint-btn-green` : `text-slate-500 hover:bg-slate-100`}`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0c4a6e]/70 backdrop-blur-sm canvas-texture">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] paint-card shadow-[12px_15px_0px_#0284c7] overflow-hidden border-4 border-white flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200">
            
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-10 w-14 h-14 bg-white paint-box shadow-[4px_5px_0px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-110 active:scale-95 transition border-2 border-slate-100">
              <X className="w-8 h-8 text-[#0f766e]" />
            </button>

            <div className="md:w-1/2 p-6 bg-slate-50 relative flex flex-col border-r-2 border-slate-100">
              <div className="flex-1 paint-box overflow-hidden relative shadow-inner border-[3px] border-slate-200">
                  <img src={selectedItem.thumbnail} className="w-full h-full object-cover oil-filter" alt="" />
                  <div className="painted-ribbon !shadow-xl">{selectedItem.category}</div>
              </div>
            </div>

            <div className="md:w-1/2 p-10 md:p-14 overflow-y-auto">
              <h2 className="text-7xl font-brush font-bold mb-6 leading-none text-[#ea580c]">{selectedItem.title}</h2>
              
              <div className="space-y-8">
                <div>
                   <h4 className="text-lg font-bold uppercase tracking-widest text-[#14b8a6] mb-4">The Canvas Story</h4>
                   <p className="text-2xl font-brush text-[#0c4a6e] leading-relaxed bg-sky-50 p-6 paint-box border-[3px] border-sky-100">
                     "{selectedItem.story}"
                   </p>
                </div>

                <div className="pt-6 border-t-[3px] border-dashed border-slate-200">
                   <p className="text-sm font-black uppercase text-slate-400 mb-1">Medium</p>
                   <p className="font-brush text-4xl font-bold text-[#0f766e]">{selectedItem.medium}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;