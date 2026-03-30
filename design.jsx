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

// --- DESIGN TOKENS ---

const THEMES = {
  moonlit: {
    name: 'Moonlit Studio',
    id: 'dark',
    bg: 'bg-slate-950',
    surface: 'bg-indigo-950/20',
    card: 'bg-slate-900/60',
    border: 'border-white/10',
    text: 'text-slate-100',
    muted: 'text-slate-400',
    accent: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10',
    highlight: 'text-yellow-400',
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    shadow: 'shadow-indigo-500/20',
    texture: 'opacity-10 pointer-events-none'
  },
  storybook: {
    name: 'Storybook Atelier',
    id: 'light',
    // Integrated Light Blue & Green Palette
    bg: 'bg-gradient-to-br from-[#E0F7FA] via-[#F1F8E9] to-[#E8F5E9]', 
    surface: 'bg-white/60', 
    card: 'bg-white/90',
    border: 'border-emerald-100',
    text: 'text-slate-900', // Darker for better visibility
    muted: 'text-slate-600', // Darker for better visibility
    accent: 'text-teal-600',
    accentBg: 'bg-teal-50',
    highlight: 'text-sky-600',
    gradient: 'from-sky-400 via-teal-400 to-emerald-400', // Blue-Green gradient
    shadow: 'shadow-teal-900/5',
    texture: 'opacity-30 pointer-events-none'
  }
};

const CONTENT_ITEMS = [
  { 
    id: 1, 
    type: 'song', 
    title: 'Stars in my Pocket', 
    date: '2023-10-12', 
    category: 'Original Composition', 
    views: 1240, 
    status: 'Published', 
    visibility: 'public',
    sections: ['home', 'music', 'space'],
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600',
    description: "A melody found while staring at Orion.",
    story: "Ahana wrote this after her first visit to the planetarium. She hummed the melody for three days straight!",
    platforms: ['YouTube', 'Instagram'],
    medium: 'Acoustic & Vocals'
  },
  { 
    id: 2, 
    type: 'art', 
    title: 'The Mars Garden', 
    date: '2023-11-05', 
    category: 'Watercolor', 
    views: 850, 
    status: 'Published', 
    visibility: 'public',
    sections: ['home', 'art', 'space'],
    thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600',
    description: "Imagining botanicals in the red dust.",
    story: "We discussed how life might survive on Mars, and Ahana decided they would need 'glass bubbles' for sun.",
    platforms: ['Instagram'],
    medium: 'Watercolor & Ink'
  },
  { 
    id: 3, 
    type: 'video', 
    title: 'Nebula Flow', 
    date: '2023-12-01', 
    category: 'Dance', 
    views: 2100, 
    status: 'Scheduled', 
    visibility: 'private',
    sections: ['home', 'milestones'],
    thumbnail: 'https://images.unsplash.com/photo-1464802686167-b939a67e06a1?w=600',
    description: "Modern movements inspired by stardust.",
    story: "The costume was handmade by Ahana using recycled silk.",
    platforms: ['YouTube'],
    medium: 'Contemporary Dance'
  },
  { 
    id: 4, 
    type: 'reading', 
    title: 'The Girl Who Drank the Moon', 
    date: '2023-12-10', 
    category: 'Book Review', 
    views: 420, 
    status: 'Published', 
    visibility: 'public',
    sections: ['home', 'reading'],
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    description: "Why this story made me want to paint with purples.",
    story: "Ahana finished this book in two days and immediately asked for more moonlight-colored paint.",
    platforms: ['Website'],
    medium: 'Literary Reflection'
  }
];

const TABS = [
  { id: 'home', label: 'Home', icon: Sparkles },
  { id: 'music', label: 'Songs from the Stars', icon: Music },
  { id: 'art', label: 'From the Sketchbook', icon: Palette },
  { id: 'space', label: 'Tiny Science Wonders', icon: Rocket },
  { id: 'reading', label: 'Books That Spark', icon: BookOpen },
  { id: 'milestones', label: 'Growth Journey', icon: Award },
];

// --- COMPONENTS ---

const App = () => {
  const [themeMode, setThemeMode] = useState('moonlit');
  const [view, setView] = useState('public'); 
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = THEMES[themeMode];

  useEffect(() => {
    setSelectedItem(null);
  }, [view]);

  const publicContent = useMemo(() => {
    return CONTENT_ITEMS.filter(item => 
      item.visibility === 'public' && 
      item.status === 'Published' && 
      (activeTab === 'home' || item.sections.includes(activeTab))
    );
  }, [activeTab]);

  // --- SUB-VIEWS ---

  const PublicSite = () => (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-700 relative overflow-hidden`}>
      <div className={`absolute inset-0 pointer-events-none ${t.texture} bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]`}></div>
      
      <nav className={`sticky top-0 z-50 ${t.bg}/90 backdrop-blur-xl border-b ${t.border} px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setActiveTab('home')} className="flex items-center gap-3 group">
            <div className={`w-10 h-10 bg-gradient-to-tr ${t.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className={`text-xl font-black tracking-tight italic ${t.text}`}>AHANA'S WORLD</span>
          </button>

          <div className="hidden lg:flex gap-1 bg-black/5 rounded-2xl p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? `bg-white shadow-sm border ${t.border} ${t.text}` 
                    : `${t.muted} hover:${t.text}`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setThemeMode(themeMode === 'moonlit' ? 'storybook' : 'moonlit')}
              className={`p-2 rounded-full border ${t.border} bg-white/20 hover:scale-110 transition active:scale-95`}
            >
              {themeMode === 'moonlit' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {activeTab === 'home' && (
        <header className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center relative">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 ${t.accentBg} blur-[120px] -z-10 rounded-full`}></div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1] tracking-tighter">
            Songs, Sketches, <br/>
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${t.gradient}`}>Stories & Stars.</span>
          </h1>
          <p className={`${t.muted} text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed`}>
            A 9-year-old’s journey through the creative universe. Safe, parent-managed, and fueled by imagination.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button className={`px-10 py-4 bg-gradient-to-r ${t.gradient} text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] transition active:scale-95`}>
              Watch Latest Piece
            </button>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {publicContent.map(item => (
            <ContentCard key={item.id} item={item} theme={t} onClick={() => setSelectedItem(item)} />
          ))}
        </div>
      </main>

      <footer className={`py-20 px-6 text-center border-t ${t.border} mt-24`}>
        <p className={`${t.muted} text-sm font-bold uppercase tracking-widest`}>Managed by Parents • Privacy First • © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );

  const StudioLedger = () => (
    <div className={`min-h-screen ${t.bg} ${t.text} flex transition-all duration-500`}>
      <aside className={`w-72 border-r ${t.border} ${themeMode === 'moonlit' ? 'bg-slate-900' : 'bg-white/80'} p-8 flex flex-col hidden lg:flex`}>
        <div className="flex items-center gap-4 mb-12">
          <div className={`w-10 h-10 bg-gradient-to-tr ${t.gradient} rounded-xl flex items-center justify-center text-white`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="font-black text-sm uppercase tracking-tighter">Studio Ledger</p>
        </div>

        <nav className="space-y-1">
          {['Creative Pulse', 'Release Calendar', 'Studio Notes', 'Archive Room', 'Discovery Insights'].map((link) => (
            <button key={link} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${link === 'Creative Pulse' ? `${t.accentBg} ${t.accent}` : `${t.muted} hover:bg-black/5`}`}>
              {link}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-black/5">
           <button onClick={() => setView('public')} className={`flex items-center gap-3 ${t.muted} hover:${t.text} font-bold text-xs uppercase tracking-widest`}>
             <LogOut className="w-4 h-4" /> Exit Ledger
           </button>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto relative">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black italic mb-2 tracking-tight">The release queue</h2>
            <p className={`${t.muted} font-medium`}>Managing Ahana's creative releases.</p>
          </div>
          <button className={`bg-gradient-to-r ${t.gradient} text-white px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2`}>
            <Plus className="w-5 h-5" /> New Studio Entry
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className={`xl:col-span-8 ${t.card} border ${t.border} rounded-[2.5rem] p-8 shadow-sm backdrop-blur-md`}>
            <div className="space-y-4">
              {CONTENT_ITEMS.map(item => (
                <div key={item.id} className={`flex items-center justify-between p-6 bg-black/5 rounded-3xl border border-transparent hover:border-emerald-500/20 transition group cursor-pointer`}>
                   <div className="flex items-center gap-6">
                      <img src={item.thumbnail} className="w-16 h-16 rounded-2xl object-cover shadow-md" alt="" />
                      <div>
                        <p className={`font-bold text-lg ${t.text}`}>{item.title}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}>{item.category} • {item.medium}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}>Status</p>
                        <p className={`text-xs font-bold ${item.status === 'Published' ? 'text-emerald-600' : 'text-amber-500'}`}>{item.status}</p>
                      </div>
                      <Settings className={`w-5 h-5 ${t.muted} group-hover:text-emerald-500`} />
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${t.gradient} text-white shadow-2xl relative overflow-hidden`}>
              <h4 className="font-bold text-xl mb-4">Discovery Spark</h4>
              <p className="text-white/90 text-sm leading-relaxed mb-6 font-medium">"Space Corner views grew 14% this week. Followers are responding deeply to the reading reflects."</p>
              <button className="bg-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/30 transition">View Details</button>
            </div>

            <div className={`${t.card} border ${t.border} p-8 rounded-[2.5rem] shadow-sm`}>
               <h4 className={`font-bold mb-6 flex items-center gap-2 ${t.text}`}><Clock className="w-5 h-5 text-teal-500" /> Weekly Practice</h4>
               <div className="space-y-6">
                  {['Singing', 'Painting'].map(type => (
                    <div key={type}>
                      <div className="flex justify-between text-xs font-bold uppercase mb-2">
                        <span className={t.text}>{type}</span>
                        <span className={t.muted}>4h / 5h</span>
                      </div>
                      <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${t.gradient} w-4/5`}></div>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  const GalaxyHub = () => (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-700 relative overflow-hidden flex flex-col`}>
      <div className={`absolute inset-0 pointer-events-none ${t.texture} bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] opacity-20`}></div>
      
      <header className="relative p-10 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-3xl bg-gradient-to-tr ${t.gradient} p-1 shadow-xl`}>
            <div className={`w-full h-full ${themeMode === 'moonlit' ? 'bg-indigo-950' : 'bg-white'} rounded-[1.4rem] flex items-center justify-center`}>
              <Sparkles className="w-8 h-8 text-teal-500" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter">AHANA'S STUDIO</h1>
            <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}>Ready to create something magic?</p>
          </div>
        </div>

        <div className="flex gap-4">
           <div className={`bg-white/80 border ${t.border} px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-xl shadow-sm`}>
              <Award className="text-teal-500 w-6 h-6" />
              <div className="text-right">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">Level</p>
                <p className="text-xl font-black text-teal-700">8</p>
              </div>
           </div>
           <button onClick={() => setView('public')} className={`bg-white/80 border ${t.border} p-4 rounded-2xl hover:bg-white transition backdrop-blur-xl shadow-sm`}>
              <LogOut className={`w-6 h-6 ${t.muted}`} />
           </button>
        </div>
      </header>

      <main className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 p-10 max-w-7xl mx-auto flex-1 content-start">
        <div className="lg:col-span-4 space-y-8">
           <div className={`bg-gradient-to-br ${t.gradient} p-10 rounded-[3rem] text-white shadow-2xl relative group overflow-hidden`}>
              <Sun className="absolute -top-10 -right-10 w-48 h-48 opacity-20 group-hover:scale-110 transition duration-1000" />
              <h2 className="text-4xl font-black mb-2">Capture!</h2>
              <p className="text-white/90 text-sm mb-8 font-medium">Add a new sketch, song, or story.</p>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { icon: Mic, label: 'Sing', color: 'bg-white/20' },
                   { icon: Camera, label: 'Show', color: 'bg-white/20' },
                   { icon: PenTool, label: 'Draw', color: 'bg-white/20' },
                   { icon: Book, label: 'Read', color: 'bg-white/20' },
                 ].map(act => (
                   <button key={act.label} className={`${act.color} py-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/30 transition active:scale-95 shadow-sm`}>
                     <act.icon className="w-6 h-6" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{act.label}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-5">
           <div className={`bg-white/80 border ${t.border} p-10 rounded-[3.5rem] h-full shadow-xl shadow-teal-900/5 flex flex-col`}>
              <h3 className={`text-2xl font-black italic mb-8 ${t.text}`}>Creative Quest</h3>
              <div className="space-y-4 flex-1">
                 {[
                   { t: "Practice the Nebula melody", xp: 50, done: false },
                   { t: "Pick one color for Mars", xp: 30, done: true },
                   { t: "Read the Moon Story", xp: 20, done: false },
                 ].map((m, i) => (
                   <div key={i} className={`p-5 rounded-2xl border ${m.done ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-transparent text-slate-800'} flex items-center justify-between group cursor-pointer hover:bg-white transition shadow-sm`}>
                      <div className="flex items-center gap-4">
                         <div className={`w-6 h-6 rounded-full border-2 ${m.done ? 'bg-emerald-500 border-emerald-500' : 'border-teal-400'} flex items-center justify-center`}>
                            {m.done && <CheckCircle2 className="w-4 h-4 text-white" />}
                         </div>
                         <span className="font-bold text-sm">{m.t}</span>
                      </div>
                      <span className="text-[10px] font-black opacity-60">+{m.xp} XP</span>
                   </div>
                 ))}
              </div>
              <div className={`mt-8 p-6 bg-sky-50 rounded-3xl flex items-center gap-4 border border-sky-100 shadow-inner`}>
                 <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-600">
                    <Rocket className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-sky-900">Space Challenge</p>
                    <p className={`text-[10px] font-medium text-sky-700`}>Why do the stars twinkle?</p>
                 </div>
                 <ChevronRight className={`ml-auto text-sky-400`} />
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
           <div className={`bg-white/80 border ${t.border} p-8 rounded-[3rem] shadow-xl shadow-teal-900/5`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-6">Badges Unlocked</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[Award, Rocket, Music, Palette].map((Ic, i) => (
                   <div key={i} className="aspect-square bg-teal-50 rounded-[1.5rem] flex items-center justify-center group cursor-pointer hover:scale-110 transition border border-teal-100">
                      <Ic className={`w-10 h-10 text-teal-500 group-hover:text-emerald-500 transition-colors`} />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="antialiased font-sans">
      {view === 'parent' ? <StudioLedger /> : view === 'child' ? <GalaxyHub /> : <PublicSite />}
      
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] ${t.card} border ${t.border} p-1 rounded-full shadow-2xl flex gap-1 backdrop-blur-xl`}>
        {['public', 'child', 'parent'].map(v => (
          <button 
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? `bg-gradient-to-r ${t.gradient} text-white shadow-lg` : `${t.muted} hover:${t.text}`}`}
          >
            {v}
          </button>
        ))}
      </div>

      {selectedItem && <DetailModal item={selectedItem} theme={t} onClose={() => setSelectedItem(null)} />}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ContentCard = ({ item, theme, onClick }) => {
  const isSong = item.type === 'song';
  return (
    <div 
      onClick={onClick}
      className={`group ${theme.card} border ${theme.border} rounded-[2.5rem] overflow-hidden hover:border-teal-400/50 transition-all cursor-pointer flex flex-col relative shadow-sm hover:shadow-xl`}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/30`}>
            {item.category}
          </span>
        </div>
        {isSong && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-teal-900/20 backdrop-blur-[2px]">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-2xl">
                <Play className="fill-current w-6 h-6 translate-x-0.5" />
             </div>
          </div>
        )}
      </div>
      
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-2xl font-black tracking-tight group-hover:text-teal-600 transition leading-tight ${theme.text}`}>{item.title}</h3>
          <ChevronRight className={`w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition ${theme.text}`} />
        </div>
        <p className={`${theme.muted} text-sm font-medium mb-6 line-clamp-2`}>{item.description}</p>
        <div className={`mt-auto pt-6 border-t ${theme.border} flex items-center justify-between opacity-60`}>
          <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>{item.medium}</span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>{item.date.split('-')[0]}</span>
        </div>
      </div>
    </div>
  );
};

const DetailModal = ({ item, theme, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
    <div className={`${theme.bg} ${theme.text} w-full max-w-6xl h-[85vh] rounded-[3.5rem] shadow-2xl overflow-hidden border ${theme.border} flex flex-col md:flex-row relative shadow-teal-900/10`}>
      <button onClick={onClose} className="absolute top-8 right-8 z-10 p-2 bg-black/10 rounded-full hover:bg-black/20 text-white transition">
        <X className="w-8 h-8" />
      </button>

      <div className="md:w-3/5 bg-slate-900 relative flex items-center justify-center overflow-hidden">
        <img src={item.thumbnail} className="w-full h-full object-cover opacity-80" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-12 left-12">
           <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4">{item.title}</h2>
           <div className="flex gap-3">
              {item.platforms.map(p => <span key={p} className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold text-white border border-white/30 uppercase tracking-widest">{p}</span>)}
           </div>
        </div>
      </div>

      <div className="md:w-2/5 p-12 overflow-y-auto">
        <div className="space-y-12">
          <section>
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-4">The Story Behind</h4>
             <p className={`text-xl font-medium leading-relaxed italic ${theme.text}`}>"{item.story}"</p>
          </section>

          <section className={`p-8 rounded-[2rem] bg-teal-50 border border-teal-100`}>
             <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h4 className="font-black uppercase text-[10px] tracking-widest text-teal-800">Inspiration Detail</h4>
             </div>
             <p className="text-sm font-medium leading-relaxed text-teal-900">{item.description}</p>
          </section>

          <div className={`pt-8 border-t ${theme.border} grid grid-cols-2 gap-8`}>
             <div>
                <p className="text-[10px] font-black uppercase opacity-50 mb-1">Medium</p>
                <p className={`font-bold text-sm ${theme.text}`}>{item.medium}</p>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase opacity-50 mb-1">Discovery Count</p>
                <p className={`font-bold text-sm text-teal-600`}>{item.views.toLocaleString()} sparks</p>
             </div>
          </div>

          <button className={`w-full py-5 bg-gradient-to-r ${theme.gradient} text-white rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] transition active:scale-95 shadow-teal-500/20`}>
             Share Ahana's Light
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default App;