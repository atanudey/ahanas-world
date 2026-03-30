import React, { useState, useMemo, useEffect } from 'react';
import { 
  Music, Palette, Rocket, BookOpen, ShieldCheck, 
  Sparkles, Plus, Award, Clock, Settings, LogOut, 
  ChevronRight, Moon, Sun, Menu, X,
  CheckCircle2, Play, Mic, Camera, PenTool, Book, Pickaxe
} from 'lucide-react';

// --- MINECRAFT CONTENT DATA ---
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

// --- HELPER COMPONENT: REAL PIXEL MOBS ---
// Renders external pixel art images with a fallback to emojis if the URL fails to load.
const McMob = ({ src, alt, fallback, className }) => {
  const [imgError, setImgError] = useState(false);
  return imgError ? (
    <div className={`absolute flex items-center justify-center text-7xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] ${className}`}>
      {fallback}
    </div>
  ) : (
    <img 
      src={src} 
      alt={alt} 
      className={`absolute pixelated-img drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] animate-mob-breathe ${className}`} 
      onError={() => setImgError(true)} 
    />
  );
};

// --- MAIN APP ---

const App = () => {
  const [view, setView] = useState('child'); 
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => setSelectedItem(null), [view]);

  const publicContent = useMemo(() => {
    return CONTENT_ITEMS.filter(item => 
      item.visibility === 'public' && 
      item.status === 'Published' && 
      (activeTab === 'home' || item.sections.includes(activeTab))
    );
  }, [activeTab]);

  return (
    // We apply the uploaded village image directly to the root container.
    <div className="antialiased min-h-screen font-mc overflow-x-hidden bg-cover bg-center bg-fixed"
         style={{ backgroundImage: 'url("smw1_fieldsvillage.jpg")' }}>
         
      {/* --- MINECRAFT CSS STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        
        .font-mc { 
            font-family: 'VT323', monospace; 
            letter-spacing: 1px;
        }
        
        /* Text Shadows to ensure readability over the village background */
        .mc-text-shadow { text-shadow: 2px 2px 0px #000000, 3px 3px 0px rgba(0,0,0,0.5); }
        .mc-text-shadow-sm { text-shadow: 2px 2px 0px #000000; }
        
        /* Vibrant UI Blocks */
        .mc-glass {
            background-color: rgba(0, 0, 0, 0.55);
            border: 4px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(4px);
            color: #ffffff;
            box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
        }

        .mc-glass-light {
            background-color: rgba(255, 255, 255, 0.2);
            border: 4px solid rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(8px);
            color: #ffffff;
        }

        .mc-wood-block {
            background-color: #A06F3F;
            border: 4px solid #5D4028;
            box-shadow: inset 4px 4px 0px rgba(255,255,255,0.2), inset -4px -4px 0px rgba(0,0,0,0.3);
            color: white;
            transition: transform 0.1s;
        }
        .mc-wood-block:active {
            transform: scale(0.97);
        }

        .mc-grass-block {
            background: linear-gradient(to bottom, #5E9D34 0%, #5E9D34 30%, #866043 30%, #866043 100%);
            border: 4px solid #3A2617;
            border-top-color: #72B942;
            color: white;
        }

        .mc-inventory-slot {
            background-color: #8b8b8b;
            border: 4px solid;
            border-color: #373737 #ffffff #ffffff #373737;
            box-shadow: inset 4px 4px 10px rgba(0,0,0,0.4);
        }

        /* Image Pixelation */
        .pixelated-img {
            image-rendering: pixelated;
        }
        
        /* Mob Animation */
        @keyframes mob-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-mob-breathe { animation: mob-breathe 3s ease-in-out infinite; }

        * { border-radius: 0 !important; }
      `}} />

      {/* Global Overlay to slightly darken the background image for UI readability */}
      <div className="fixed inset-0 bg-black/10 pointer-events-none z-0"></div>

      {/* --- 1. PUBLIC SITE --- */}
      {view === 'public' && (
        <div className="relative z-10 pb-40">
          <nav className="px-6 py-6">
            <div className="max-w-6xl mx-auto flex items-center justify-between mc-glass p-4">
              
              <button onClick={() => setActiveTab('home')} className="flex items-center gap-4 pl-2 group">
                <div className="text-4xl mc-text-shadow group-hover:-translate-y-2 transition-transform">💎</div>
                <span className="text-5xl font-mc text-[#55FF55] mc-text-shadow tracking-wide mt-1">Ahana's World</span>
              </button>

              <div className="hidden lg:flex gap-4">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2 text-3xl font-mc mc-text-shadow-sm transition-all ${
                      activeTab === tab.id 
                        ? `mc-wood-block text-white` 
                        : `text-gray-300 hover:text-white hover:bg-white/10 border-4 border-transparent`
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button className={`mc-grass-block px-8 py-2 text-3xl mc-text-shadow-sm hidden md:block hover:brightness-110 active:translate-y-1`}>
                Say Hello!
              </button>
            </div>
          </nav>

          <main className="max-w-6xl mx-auto px-6 py-12">
            {activeTab === 'home' && (
              <header className="text-center mb-24 mc-glass p-12 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-20"><Sparkles className="w-64 h-64 text-white" /></div>
                <h1 className="text-7xl md:text-8xl font-mc text-white mc-text-shadow mb-6 leading-none relative z-10">
                  Songs, Sketches <br/>
                  <span className="text-[#FFFF55]">& Stars!</span>
                </h1>
                <p className="text-4xl max-w-3xl mx-auto font-mc text-gray-200 mc-text-shadow-sm leading-relaxed mt-4 relative z-10">
                  Welcome to my Overworld. A magical place where I sing, craft, and explore the universe.
                </p>
                <div className="mt-12 relative z-10">
                  <button className="mc-wood-block px-12 py-4 text-5xl mc-text-shadow-sm tracking-wide">
                    Explore Inventory
                  </button>
                </div>
              </header>
            )}

            {/* Blocky Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-16">
              {publicContent.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`mc-glass relative cursor-pointer hover:border-white transition-all flex flex-col group`}
                >
                  <div className="absolute top-[-20px] left-[-20px] mc-grass-block px-4 py-1 text-2xl mc-text-shadow-sm font-bold z-20 shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                    {item.category}
                  </div>

                  <div className="p-4 pb-0">
                    <div className="aspect-[4/3] overflow-hidden relative border-4 border-black/50">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover pixelated-img group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-5xl font-mc text-[#55FFFF] mc-text-shadow mb-2 leading-none">{item.title}</h3>
                    <p className="text-gray-300 text-3xl mb-6 line-clamp-2 mc-text-shadow-sm">{item.description}</p>
                    
                    <button className="mc-wood-block px-8 py-2 text-3xl mt-auto tracking-wide w-full mc-text-shadow-sm">
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
        <div className={`min-h-screen bg-black/60 backdrop-blur-md flex relative z-10`}>
          <aside className={`w-80 mc-glass p-6 flex flex-col hidden lg:flex border-l-0 border-t-0 border-b-0 border-r-8 border-white/20`}>
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 mc-wood-block flex items-center justify-center text-white">
                <Pickaxe className="w-10 h-10 drop-shadow-md" />
              </div>
              <p className="text-6xl font-mc text-[#FF5555] mc-text-shadow mt-2">Admin HQ</p>
            </div>
            <nav className="space-y-4">
              {['Creative Pulse', 'Release Calendar', 'Studio Notes', 'Archive'].map((link) => (
                <button key={link} className={`w-full text-left px-6 py-4 text-3xl mc-text-shadow-sm transition-all ${link === 'Creative Pulse' ? `mc-grass-block text-white` : `text-gray-300 hover:text-white hover:bg-white/10 border-4 border-transparent`}`}>
                  {link}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 p-12 overflow-y-auto">
            <header className="flex justify-between items-end mb-12 mc-glass p-8">
              <div>
                <h2 className="text-7xl font-mc text-white mc-text-shadow mb-1">The Release Queue</h2>
                <p className="text-gray-300 mc-text-shadow-sm text-4xl">Managing Ahana's blocks.</p>
              </div>
              <button className="mc-grass-block px-8 py-3 text-4xl mc-text-shadow-sm flex items-center gap-2 hover:brightness-110">
                <Plus className="w-8 h-8" /> Add New Block
              </button>
            </header>

            <div className="grid grid-cols-1 gap-8">
              <div className="mc-glass p-10">
                <div className="space-y-6">
                  {CONTENT_ITEMS.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-6 bg-black/40 border-4 border-white/10 hover:border-white/50 transition cursor-pointer">
                       <div className="flex items-center gap-6">
                          <img src={item.thumbnail} className="w-24 h-24 border-4 border-black object-cover pixelated-img" alt="" />
                          <div>
                            <p className="text-5xl font-mc text-[#55FFFF] mc-text-shadow">{item.title}</p>
                            <p className="text-3xl text-gray-300 mc-text-shadow-sm mt-1 uppercase tracking-wide">{item.category} • {item.medium}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <span className={`px-6 py-2 border-4 text-3xl mc-text-shadow-sm ${item.status === 'Published' ? 'bg-[#55FF55]/20 border-[#55FF55] text-[#55FF55]' : 'bg-[#FFFF55]/20 border-[#FFFF55] text-[#FFFF55]'}`}>
                            {item.status}
                          </span>
                          <Settings className="w-8 h-8 text-gray-300 hover:text-white" />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* --- 3. CHILD HUB (The Crafting Table) --- */}
      {view === 'child' && (
        <div className="relative z-10 flex flex-col pb-40 min-h-screen">
          
          {/* Mobs Overlay: Rendered using external pixel images */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Steve */}
            <McMob 
              src="https://static.wikia.nocookie.net/minecraft_gamepedia/images/c/c5/Steve_JE2_BE1.png" 
              alt="Steve" 
              fallback="🧍‍♂️"
              className="bottom-[5%] left-[8%] h-72" 
            />
            {/* Pig */}
            <McMob 
              src="https://static.wikia.nocookie.net/minecraft_gamepedia/images/3/30/Pig_JE3_BE2.png" 
              alt="Pig" 
              fallback="🐷"
              className="bottom-[15%] left-[25%] h-32" 
            />
            {/* Horse */}
            <McMob 
              src="https://static.wikia.nocookie.net/minecraft_gamepedia/images/3/3b/Horse_JE2_BE2.png" 
              alt="Horse" 
              fallback="🐴"
              className="bottom-[20%] right-[10%] h-80" 
              style={{ animationDelay: '1s' }}
            />
            {/* Tuxedo Cat */}
            <McMob 
              src="https://static.wikia.nocookie.net/minecraft_gamepedia/images/1/13/Tuxedo_Cat_JE1_BE1.png" 
              alt="Cat" 
              fallback="🐱"
              className="bottom-[5%] right-[25%] h-24" 
              style={{ animationDelay: '0.5s' }}
            />
            {/* Tabby Cat */}
            <McMob 
              src="https://static.wikia.nocookie.net/minecraft_gamepedia/images/1/1b/Tabby_Cat_JE1_BE1.png" 
              alt="Cat" 
              fallback="🐈"
              className="bottom-[12%] left-[40%] h-24" 
              style={{ animationDelay: '1.5s' }}
            />
            {/* Kitten (Ocelot used as tiny kitten) */}
            <McMob 
              src="https://static.wikia.nocookie.net/minecraft_gamepedia/images/d/df/Ocelot_JE2_BE1.png" 
              alt="Kitten" 
              fallback="🐾"
              className="bottom-[8%] left-[45%] h-16" 
              style={{ animationDelay: '0.2s' }}
            />
          </div>

          <header className="relative p-8 md:p-12 flex justify-between items-center z-10">
            <div className="flex items-center gap-6 mc-glass p-4 pr-10">
              <div className="w-20 h-20 mc-inventory-slot flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-[#FFFF55] drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-7xl font-mc text-white mc-text-shadow leading-none mt-2">Ahana's Base</h1>
              </div>
            </div>

            <div className="mc-glass px-8 py-4 flex items-center gap-4">
              <Award className="text-[#FFFF55] drop-shadow-md w-12 h-12" />
              <div className="text-right">
                <p className="text-3xl text-gray-300 mc-text-shadow-sm uppercase tracking-widest leading-none">XP Level</p>
                <p className="text-6xl font-mc text-[#55FF55] mc-text-shadow leading-none mt-2">8</p>
              </div>
            </div>
          </header>

          <main className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 md:p-12 max-w-[1400px] mx-auto flex-1 content-start z-10 w-full">
            
            {/* CAPTURE WIDGET / CRAFTING */}
            <div className="lg:col-span-5 relative">
               <div className={`mc-glass p-10 relative bg-black/60`}>
                  <div className="absolute top-[-20px] left-[-20px] bg-[#FFFF55] border-4 border-[#AAAA00] text-[#3F3F00] px-4 py-1 text-3xl font-bold shadow-[4px_4px_0_rgba(0,0,0,0.5)]">CRAFTING</div>
                  <h2 className="text-7xl font-mc text-[#FF5555] mc-text-shadow mb-1 mt-8">Capture!</h2>
                  <p className="text-gray-300 mc-text-shadow-sm text-4xl mb-8">What did you craft today?</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                     {[
                       { icon: Mic, label: 'Sing', color: 'mc-wood-block' },
                       { icon: Camera, label: 'Photo', color: 'mc-wood-block' },
                       { icon: PenTool, label: 'Draw', color: 'mc-wood-block' },
                       { icon: Book, label: 'Read', color: 'mc-wood-block' },
                     ].map(act => (
                       <button key={act.label} className={`${act.color} p-6 flex flex-col items-center justify-center gap-3 hover:brightness-110`}>
                         <div className="mc-inventory-slot p-4">
                            <act.icon className="w-10 h-10 text-white drop-shadow-md" />
                         </div>
                         <span className="text-5xl font-mc mc-text-shadow-sm">{act.label}</span>
                       </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* QUESTS LIST */}
            <div className="lg:col-span-4 relative">
               <div className={`mc-glass p-10 h-full flex flex-col bg-black/60`}>
                  <div className="absolute top-[-20px] left-[-20px] mc-grass-block px-4 py-1 text-3xl font-bold shadow-[4px_4px_0_rgba(0,0,0,0.5)] mc-text-shadow-sm">MISSIONS</div>
                  <h3 className="text-6xl font-mc text-[#55FFFF] mc-text-shadow mb-6 mt-8">Today's Quest</h3>
                  <div className="space-y-6 flex-1">
                     {[
                       { t: "Practice Nebula melody", xp: 50, done: false },
                       { t: "Pick a color for Mars", xp: 30, done: true },
                       { t: "Read the Moon Story", xp: 20, done: false },
                     ].map((m, i) => (
                       <div key={i} className={`p-4 flex items-center justify-between cursor-pointer border-4 transition-all ${m.done ? 'bg-[#55FF55]/20 border-[#55FF55]' : 'bg-black/40 border-white/20 hover:border-white/50'}`}>
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 border-4 flex items-center justify-center shadow-inner ${m.done ? 'bg-[#55FF55] border-[#00AA00]' : 'bg-black/50 border-black'}`}>
                                {m.done && <CheckCircle2 className="w-10 h-10 text-[#003F00]" />}
                             </div>
                             <span className={`text-3xl mc-text-shadow-sm ${m.done ? 'text-[#55FF55]' : 'text-white'}`}>{m.t}</span>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* BADGES / ADVANCEMENTS */}
            <div className="lg:col-span-3 space-y-8 relative">
               <div className={`mc-glass p-10 text-center bg-black/60`}>
                  <div className="absolute top-[-20px] left-[-20px] bg-[#FF55FF] border-4 border-[#AA00AA] text-[#FFFFFF] mc-text-shadow-sm px-4 py-1 text-3xl font-bold shadow-[4px_4px_0_rgba(0,0,0,0.5)]">ADVANCEMENTS</div>
                  <h3 className="text-6xl font-mc text-[#FFFF55] mc-text-shadow mb-8 mt-8">Badges</h3>
                  <div className="grid grid-cols-2 gap-6">
                     {[
                       { icon: Award, color: 'text-[#FFFF55]' },
                       { icon: Rocket, color: 'text-[#55FFFF]' },
                       { icon: Music, color: 'text-[#FF55FF]' },
                       { icon: Palette, color: 'text-[#55FF55]' },
                     ].map((BadgeItem, i) => (
                       <div key={i} className={`aspect-square mc-inventory-slot flex items-center justify-center hover:bg-[#a0a0a0] cursor-pointer transition-colors`}>
                          <BadgeItem.icon className={`w-16 h-16 ${BadgeItem.color} drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]`} />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </main>
        </div>
      )}

      {/* --- DEV NAVIGATION BAR --- */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] mc-glass p-2 flex gap-2 shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
        {['public', 'child', 'parent'].map(v => (
          <button 
            key={v}
            onClick={() => setView(v)}
            className={`px-8 py-3 text-4xl mc-text-shadow-sm tracking-wide transition-all ${view === v ? `mc-grass-block` : `text-gray-300 hover:text-white border-4 border-transparent hover:border-white/20`}`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* --- DETAIL MODAL (LARGE CHEST UI) --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="mc-glass bg-black/80 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative shadow-[16px_16px_0px_rgba(0,0,0,0.8)]">
            
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-10 w-14 h-14 bg-black/50 border-4 border-white/50 flex items-center justify-center hover:bg-[#FF5555] hover:border-[#AA0000] transition-colors">
              <X className="w-8 h-8 text-white drop-shadow-md" />
            </button>

            <div className="md:w-1/2 p-6 bg-black/40 relative flex flex-col border-r-8 border-white/20">
              <div className="flex-1 mc-glass overflow-hidden relative shadow-inner p-2">
                  <img src={selectedItem.thumbnail} className="w-full h-full object-cover pixelated-img border-4 border-black" alt="" />
                  <div className="absolute top-6 left-6 mc-grass-block px-4 py-1 text-3xl font-bold mc-text-shadow-sm shadow-[4px_4px_0_rgba(0,0,0,0.5)]">{selectedItem.category}</div>
              </div>
            </div>

            <div className="md:w-1/2 p-10 md:p-14 overflow-y-auto">
              <h2 className="text-7xl font-mc mb-6 leading-none text-[#55FFFF] mc-text-shadow">{selectedItem.title}</h2>
              
              <div className="space-y-8">
                <div>
                   <h4 className="text-4xl font-bold uppercase tracking-widest text-gray-400 mc-text-shadow-sm mb-4">Lore</h4>
                   <p className="text-4xl font-mc text-white bg-black/40 border-4 border-white/20 p-6 leading-relaxed shadow-inner mc-text-shadow-sm">
                     "{selectedItem.story}"
                   </p>
                </div>

                <div className="pt-6 border-t-4 border-white/20">
                   <p className="text-3xl font-black uppercase text-gray-400 mc-text-shadow-sm mb-1">Item Type</p>
                   <p className="font-mc text-5xl text-[#55FF55] mc-text-shadow">{selectedItem.medium}</p>
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