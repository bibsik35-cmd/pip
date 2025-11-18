
import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sprout, 
  Dna, 
  Skull, 
  Globe2, 
  TrendingUp, 
  Leaf, 
  AlertTriangle,
  Activity,
  Droplets,
  Layers,
  Microscope,
  Atom,
  Wind,
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar, ComposedChart
} from 'recharts';

// --- DATA & CONSTANTS ---

const AUTHORS = ["Багно Владислав", "Шемедюк Владислав", "Копитюк Орест"];

const THEMES = {
  green: { 
    bg: 'from-[#001a0f] via-[#000000] to-[#000f05]',
    accent: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    chartColor: '#34d399'
  },
  blue: { 
    bg: 'from-[#000f1a] via-[#000000] to-[#000510]',
    accent: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    chartColor: '#60a5fa'
  },
  red: { 
    bg: 'from-[#1a0000] via-[#000000] to-[#0f0000]',
    accent: 'text-rose-400',
    glow: 'shadow-rose-500/20',
    chartColor: '#f43f5e'
  },
  brown: { 
    bg: 'from-[#1a0d00] via-[#000000] to-[#0f0500]',
    accent: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    chartColor: '#fbbf24'
  },
};

const POPULATION_DATA = [
  { year: 1800, population: 1, food: 1.2 },
  { year: 1900, population: 1.6, food: 2.1 },
  { year: 1960, population: 3.0, food: 4.5 }, 
  { year: 2000, population: 6.1, food: 8.2 },
  { year: 2024, population: 8.0, food: 11.5 },
  { year: 2050, population: 9.7, food: 14.0 },
];

const PRODUCTION_DATA = [
  { name: 'Азія', rice: 90, wheat: 45 },
  { name: 'Європа', rice: 5, wheat: 80 },
  { name: 'Америка', rice: 15, wheat: 60 },
  { name: 'Африка', rice: 20, wheat: 15 },
];

const BROWN_REV_DATA = [
  { name: 'Ґрунти', value: 100, fill: '#d97706' },
  { name: 'Органіка', value: 80, fill: '#b45309' },
  { name: 'Вода', value: 60, fill: '#92400e' },
  { name: 'Енергія', value: 40, fill: '#78350f' },
];

const COMPLEX_FUTURE_DATA = Array.from({ length: 30 }, (_, i) => ({
  x: i,
  bio: 50 + i * 2 + Math.sin(i * 0.5) * 15,
  trad: 40 + i * 0.5 + Math.cos(i * 0.3) * 10,
}));

// Light noise pattern
const NOISE_PATTERN = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAA5OTkAAABERERmZmYzMzOZmZlVVVUbuH8iAAAACHRSTlMAMwA1MzMzM7O0s14AAABUSURBVDjLY2AYPoCRZQAAExDO4wrBsZ6e7u5I3Lm5uS6QYJ67u3sCkODu7u5eAJLozs3NDQFJ5O7u7t4AkujOzc0NAUnk7u7u3gCS6M7NzQ0BSeTu7u4eALk8OaF77fG1AAAAAElFTkSuQmCC";

// --- ANIMATION VARIANTS ---

// High-quality text reveal animation
const textContainerVars: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const textItemVars: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { 
      type: "spring", 
      damping: 12, 
      stiffness: 100 
    } 
  },
};

const chartBoxVars: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

// --- UI COMPONENTS ---

const ChartBox = memo(({ title, children, className = "" }: { title: string, children?: React.ReactNode, className?: string }) => (
  <motion.div 
    variants={chartBoxVars}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className={`flex flex-col w-full h-full bg-black/40 rounded-3xl border border-white/[0.08] overflow-hidden relative group backdrop-blur-md ${className}`}
  >
    <div className="px-6 py-4 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.02]">
      <h4 className="text-[10px] font-bold text-white/90 uppercase tracking-[0.25em] antialiased">{title}</h4>
      <div className="flex gap-1.5 opacity-30 group-hover:opacity-80 transition-opacity duration-500">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
    </div>
    <div className="flex-1 w-full p-4 relative min-h-0">
      {children}
      {/* Subtle Grid overlay for texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
    </div>
  </motion.div>
));

const AnimatedStat = memo(({ value, label, delay, color = "emerald" }: { value: string, label: string, delay: number, color?: string }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0, y: 20, filter: 'blur(10px)' }}
    whileInView={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all hover:-translate-y-1"
  >
    <div className={`absolute inset-0 bg-gradient-to-b from-${color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
    <span className="text-5xl md:text-6xl font-bold mb-2 tracking-tighter text-white drop-shadow-xl antialiased">
      {value}
    </span>
    <span className={`text-[10px] font-bold uppercase tracking-[0.25em] text-${color}-400/80 group-hover:text-${color}-400 transition-colors`}>{label}</span>
  </motion.div>
));

const PremiumCard = ({ children }: { children?: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smoother physics configuration
  const mouseX = useSpring(x, { stiffness: 40, damping: 30, mass: 2 });
  const mouseY = useSpring(y, { stiffness: 40, damping: 30, mass: 2 });

  // Very subtle rotation to avoid jitter
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["1deg", "-1deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-1deg", "1deg"]);
  
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = event.clientX - rect.left - width / 2;
    const mouseYFromCenter = event.clientY - rect.top - height / 2;
    
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="relative w-full h-full rounded-[40px] bg-[#080808]/90 border border-white/[0.08] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl will-change-transform"
    >
      {/* Ultra-subtle noise for texture (prevents banding) */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" 
        style={{ backgroundImage: `url("${NOISE_PATTERN}")`, backgroundSize: '120px' }} 
      />

      <div className="relative z-20 h-full w-full p-8 md:p-10 lg:p-12 flex flex-col antialiased subpixel-antialiased">
        {children}
      </div>
    </motion.div>
  );
};

// --- SLIDE COMPONENTS ---

const SlideIntro = memo(() => (
  <div className="h-full flex flex-col items-center justify-center relative z-10">
    {/* Background Ambient Glow */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2.5 }} 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    >
       <div className="w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
    </motion.div>
    
    <motion.div
      variants={textContainerVars}
      initial="hidden"
      animate="visible"
      className="relative text-center z-10"
    >
      <motion.h1 variants={textItemVars} className="text-7xl md:text-[9rem] font-bold leading-[0.85] tracking-tighter text-white drop-shadow-2xl">
        ЗЕЛЕНА
      </motion.h1>
      <motion.h1 variants={textItemVars} className="text-7xl md:text-[9rem] font-bold leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600">
        РЕВОЛЮЦІЯ
      </motion.h1>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
      className="mt-16 flex flex-col items-center gap-6"
    >
      <div className="flex flex-wrap justify-center gap-3">
        {AUTHORS.map((author, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 + i * 0.1 }}
            className="px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-white/70 tracking-wide transition-all hover:bg-white/[0.08] hover:text-white"
          >
            {author}
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
));

const SlideDefinition = memo(() => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 h-full items-center">
    <motion.div 
      variants={textContainerVars}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-6"
    >
      <div>
        <motion.h2 variants={textItemVars} className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
          Що це?
        </motion.h2>
        <motion.p variants={textItemVars} className="text-xl md:text-2xl font-light text-white/80 leading-relaxed">
          Період <span className="text-emerald-400 font-semibold">глобальної трансформації</span> (1940-1970), що змінив саму суть виживання.
        </motion.p>
      </div>
      
      {/* Compact grid to fix overflow issues - Reduced padding and gaps */}
      <div className="grid gap-2.5">
        {[
          { icon: Sprout, text: "Високоврожайні сорти" },
          { icon: Droplets, text: "Масштабна іригація" },
          { icon: Atom, text: "Хімізація та захист" },
          { icon: Globe2, text: "Боротьба з голодом" }
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={textItemVars}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-emerald-500/20 transition-all group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <item.icon size={18} />
            </div>
            <span className="text-base md:text-lg text-white/90 font-light tracking-wide">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>

    <div className="relative h-full flex items-center justify-center">
      {/* Static Ring Animation - Centered and Stable */}
      <div className="relative w-[300px] h-[300px] lg:w-[400px] lg:h-[400px]">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
           className="w-full h-full relative"
         >
            <div className="absolute inset-0 rounded-full border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]" />
            <div className="absolute inset-12 rounded-full border border-emerald-500/20 border-dashed" />
         </motion.div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Sprout className="w-40 h-40 lg:w-64 lg:h-64 text-emerald-400 drop-shadow-[0_0_60px_rgba(52,211,153,0.5)]" strokeWidth={0.8} />
         </div>
      </div>
    </div>
  </div>
));

const SlideResults = memo(() => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between mb-8">
       <motion.h2 
         initial={{ opacity: 0, x: -20 }} 
         whileInView={{ opacity: 1, x: 0 }} 
         className="text-5xl font-bold tracking-tight text-white"
       >
         Результати
       </motion.h2>
       <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Impact Analysis</div>
    </div>
    
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <AnimatedStat value="×3" label="Врожайність" delay={0} />
      <AnimatedStat value="1B+" label="Врятованих життів" delay={0.15} />
      <AnimatedStat value="+250%" label="Калорійність" delay={0.3} />
    </div>
    
    <div className="flex-[2] min-h-0">
       <ChartBox title="Динаміка Росту">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={POPULATION_DATA}>
                <defs>
                   <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '12px'}} 
                  itemStyle={{color: '#fff', fontSize: '14px', fontWeight: 500}} 
                  cursor={{stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1}}
                />
                <Area 
                  type="monotone" 
                  dataKey="food" 
                  stroke="#34d399" 
                  strokeWidth={3} 
                  fill="url(#colorFood)" 
                  isAnimationActive={true}
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
                <Area 
                  type="monotone" 
                  dataKey="population" 
                  stroke="#fff" 
                  strokeWidth={2} 
                  fill="transparent" 
                  strokeDasharray="4 4"
                  opacity={0.4}
                  isAnimationActive={true}
                  animationDuration={2000}
                  animationEasing="ease-out"
                  animationBegin={500}
                />
             </AreaChart>
          </ResponsiveContainer>
       </ChartBox>
    </div>
  </div>
));

const SlideBiotech = memo(() => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
    <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit">
        <Dna className="w-4 h-4 text-blue-400" />
        <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">Біотехнології</span>
      </motion.div>
      
      <motion.div variants={textContainerVars} initial="hidden" whileInView="visible" className="space-y-4">
        <motion.h2 variants={textItemVars} className="text-5xl lg:text-6xl font-bold leading-tight text-white">
          Редагування <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Коду Життя</span>
        </motion.h2>
        
        <motion.p variants={textItemVars} className="text-xl text-white/70 leading-relaxed">
          Від простої селекції до точкового редагування геному. Ми більше не чекаємо на еволюцію — ми її пришвидшуємо.
        </motion.p>
      </motion.div>

      <div className="space-y-3">
        {['CRISPR/Cas9', 'ГМО Культури', 'In Vitro Клонування'].map((tech, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.2 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border-l-2 border-blue-500 backdrop-blur-sm hover:bg-white/[0.06] transition-colors"
          >
             <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
             <span className="text-lg font-medium text-white/90">{tech}</span>
          </motion.div>
        ))}
      </div>
    </div>

    <div className="lg:col-span-7 h-full min-h-[300px]">
      <ChartBox title="Прогноз Ефективності">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={COMPLEX_FUTURE_DATA}>
            <defs>
               <linearGradient id="gradBio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.5}/>
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0}/>
               </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
            <Area 
              type="monotone" 
              dataKey="bio" 
              stroke="#60a5fa" 
              strokeWidth={3} 
              fill="url(#gradBio)" 
              isAnimationActive={true}
              animationDuration={2500}
            />
            <Line 
              type="monotone" 
              dataKey="trad" 
              stroke="#94a3b8" 
              strokeWidth={2} 
              strokeDasharray="4 4" 
              dot={false} 
              opacity={0.4} 
              isAnimationActive={true}
              animationDuration={2500}
              animationBegin={500}
            />
            <Tooltip cursor={{stroke: 'rgba(255,255,255,0.1)'}} contentStyle={{backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartBox>
    </div>
  </div>
));

const SlideMalthus = memo(() => (
  <div className="h-full flex flex-col relative overflow-hidden">
    <div className="absolute -right-40 -top-40 w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-[150px] pointer-events-none" />
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      className="flex items-center gap-6 mb-8 relative z-10"
    >
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
        <Skull className="w-8 h-8 text-rose-500" />
      </div>
      <div>
        <h2 className="text-4xl md:text-5xl font-bold text-white">Мальтузіанська Пастка</h2>
        <p className="text-rose-400 font-mono text-xs mt-2 uppercase tracking-[0.3em]">Теорія Кризи (1798)</p>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 relative z-10">
      <div className="flex flex-col justify-center gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="bg-white/[0.03] p-8 rounded-3xl border-l-4 border-rose-500 backdrop-blur-sm relative overflow-hidden"
        >
          <div className="absolute top-4 left-4 text-6xl text-rose-500/20 font-serif">"</div>
          <p className="text-2xl font-serif italic text-white/90 leading-relaxed relative z-10">
            Сила народонаселення нескінченно більша, ніж сила землі виробляти засоби до існування.
          </p>
          <p className="mt-4 text-white/40 text-right font-serif">— Томас Мальтус</p>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4">
           <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="p-6 bg-rose-500/5 rounded-2xl border border-rose-500/10">
              <h4 className="text-rose-400 text-[10px] uppercase font-bold mb-2 tracking-wider">Населення</h4>
              <div className="text-2xl font-bold text-white">Геометрична</div>
              <div className="text-xs text-white/40 mt-1 font-mono">1, 2, 4, 8, 16...</div>
           </motion.div>
           <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <h4 className="text-emerald-400 text-[10px] uppercase font-bold mb-2 tracking-wider">Ресурси</h4>
              <div className="text-2xl font-bold text-white">Арифметична</div>
              <div className="text-xs text-white/40 mt-1 font-mono">1, 2, 3, 4, 5...</div>
           </motion.div>
        </div>
      </div>
      
      <ChartBox title="Точка Катастрофи">
         <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[{t:0,p:10,r:10}, {t:2,p:20,r:20}, {t:4,p:40,r:30}, {t:6,p:80,r:40}, {t:8,p:160,r:50}]}>
               <CartesianGrid stroke="rgba(255,255,255,0.03)" />
               <Line 
                  type="monotone" 
                  dataKey="p" 
                  stroke="#f43f5e" 
                  strokeWidth={4} 
                  dot={{r:6, fill:'#f43f5e', strokeWidth: 0}} 
                  isAnimationActive={true}
                  animationDuration={3000}
               />
               <Line 
                  type="monotone" 
                  dataKey="r" 
                  stroke="#34d399" 
                  strokeWidth={4} 
                  strokeDasharray="8 8" 
                  isAnimationActive={true}
                  animationDuration={3000}
               />
               <Tooltip cursor={false} contentStyle={{backgroundColor: '#111', border: 'none', borderRadius: '8px'}} />
            </LineChart>
         </ResponsiveContainer>
      </ChartBox>
    </div>
  </div>
));

const SlideQuestion = memo(() => (
  <div className="h-full flex flex-col items-center justify-center text-center relative z-10">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      className="relative mb-12"
    >
       <Globe2 className="w-48 h-48 md:w-64 md:h-64 text-blue-500/40" strokeWidth={0.5} />
       <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
    </motion.div>
    
    <motion.div variants={textContainerVars} initial="hidden" whileInView="visible">
      <motion.h2 variants={textItemVars} className="text-6xl md:text-8xl font-bold leading-tight mb-8 tracking-tighter text-white">
        9.7 МЛРД<br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 text-4xl md:text-5xl tracking-normal font-semibold">до 2050 року</span>
      </motion.h2>
      
      <div className="flex gap-12 justify-center mt-12">
        <motion.div variants={textItemVars} className="text-center">
           <span className="block text-4xl md:text-5xl font-bold text-rose-400">-20%</span>
           <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2 block">Орних земель</span>
        </motion.div>
        <div className="w-px bg-white/10" />
        <motion.div variants={textItemVars} className="text-center">
           <span className="block text-4xl md:text-5xl font-bold text-emerald-400">+70%</span>
           <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2 block">Потреба в їжі</span>
        </motion.div>
      </div>
    </motion.div>
  </div>
));

const SlideMap = memo(() => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
    <div className="lg:col-span-2 h-full min-h-[300px]">
       <ChartBox title="Світові Виробники">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={PRODUCTION_DATA} layout="vertical" margin={{left: 20, right: 20, bottom: 20, top: 20}}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" horizontal={false} />
                <XAxis type="number" stroke="#666" hide />
                <YAxis dataKey="name" type="category" stroke="#fff" width={80} tick={{fontSize: 12, fill: 'white', fontWeight: 600}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#111', border: 'none', borderRadius: '8px'}} />
                <Bar 
                  dataKey="rice" 
                  stackId="a" 
                  fill="#34d399" 
                  radius={[0,0,0,0]} 
                  barSize={30} 
                  isAnimationActive={true}
                  animationDuration={1500}
                />
                <Bar 
                  dataKey="wheat" 
                  stackId="a" 
                  fill="#fbbf24" 
                  radius={[0,4,4,0]} 
                  barSize={30} 
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationBegin={300}
                />
             </BarChart>
          </ResponsiveContainer>
       </ChartBox>
    </div>
    <div className="flex flex-col gap-4 justify-center">
       {[
         { t: "Азія", d: "Рис: Основа життя", c: "border-emerald-500" },
         { t: "Америка", d: "Кукурудза та Соя", c: "border-blue-500" },
         { t: "Україна", d: "Зерновий Коридор", c: "border-yellow-500" }
       ].map((item, i) => (
         <motion.div 
           key={i}
           initial={{ opacity: 0, x: 20 }}
           whileInView={{ opacity: 1, x: 0 }}
           transition={{ delay: i * 0.15 }}
           className={`p-6 rounded-2xl bg-white/[0.03] border-l-4 ${item.c} hover:bg-white/[0.08] transition-colors cursor-default`}
         >
            <h3 className="text-xl font-bold mb-1 text-white">{item.t}</h3>
            <p className="text-sm text-white/50">{item.d}</p>
         </motion.div>
       ))}
    </div>
  </div>
));

const SlideRisks = memo(() => (
  <div className="h-full flex flex-col items-center justify-center z-10">
     <motion.div initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-16">
        <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20">
           <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-5xl font-bold text-white">Аналіз Ризиків</h2>
     </motion.div>
     
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {[
          { title: "Виснаження", desc: "Інтенсивне землеробство вбиває мікробіом ґрунту.", color: "rose" },
          { title: "Монокультури", desc: "Генетична однорідність - рай для епідемій.", color: "amber" },
          { title: "Екологія", desc: "Забруднення ґрунтових вод нітратами.", color: "emerald" }
        ].map((risk, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, type: "spring" }}
            className={`relative p-8 rounded-[32px] bg-white/[0.03] border border-white/[0.08] overflow-hidden group hover:bg-white/[0.05] transition-colors`}
          >
             {/* Hover glow */}
             <div className={`absolute -right-10 -top-10 bg-${risk.color}-500/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-${risk.color}-500/20 transition-colors duration-500 opacity-0 group-hover:opacity-100`} />
             
             <h3 className={`text-2xl font-bold text-${risk.color}-400 mb-4 relative z-10`}>{risk.title}</h3>
             <p className="text-white/70 text-base relative z-10 leading-relaxed">{risk.desc}</p>
          </motion.div>
        ))}
     </div>
  </div>
));

const SlideBrownRev = memo(() => (
  <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
     <div className="z-10 space-y-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
           <Layers size={14} /> Наступна Ера
        </motion.div>
        
        <motion.h1 variants={textContainerVars} initial="hidden" whileInView="visible" className="text-6xl lg:text-7xl font-bold text-white">
           Коричнева<br/>
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Революція</span>
        </motion.h1>
        
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xl text-white/80 leading-relaxed font-light">
           Повернення до <strong className="text-amber-400">живого ґрунту</strong>. Це не про добрива, це про екосистему.
        </motion.p>
     </div>

     <div className="grid grid-cols-2 gap-4">
        {[
           { label: "No-Till", desc: "Нульова обробка", icon: Wind, delay: 0 },
           { label: "Cover Crops", desc: "Покривні культури", icon: Leaf, delay: 0.1 },
           { label: "Compost", desc: "Живлення ґрунту", icon: Sprout, delay: 0.2 },
           { label: "Rotation", desc: "Розумна сівозміна", icon: Activity, delay: 0.3 },
        ].map((item, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: item.delay + 0.5 }}
             className="p-6 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl flex flex-col items-center text-center gap-4 hover:bg-white/[0.08] transition-colors group"
           >
              <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                 <item.icon size={24} />
              </div>
              <div>
                 <div className="font-bold text-lg text-white mb-1">{item.label}</div>
                 <div className="text-xs text-white/40 uppercase tracking-wide">{item.desc}</div>
              </div>
           </motion.div>
        ))}
     </div>
  </div>
));

const SlideBrownData = memo(() => (
  <div className="h-full flex flex-col">
     <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-xl bg-amber-500/20">
           <Microscope className="w-6 h-6 text-amber-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white">Ефективність Регенерації</h2>
     </div>

     <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <ChartBox title="Відновлення Екосистеми">
           <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="30%" outerRadius="100%" data={BROWN_REV_DATA} startAngle={180} endAngle={0}>
                 <RadialBar 
                    label={{ fill: '#fff', position: 'insideStart', fontSize: 12, fontWeight: 600 }} 
                    background={{ fill: 'rgba(255,255,255,0.05)' }} 
                    dataKey="value" 
                    cornerRadius={10} 
                    isAnimationActive={true}
                    animationDuration={2000}
                 />
                 <Legend iconSize={8} layout="vertical" verticalAlign="middle" wrapperStyle={{right: 0, color: '#fff', fontSize: '12px'}} />
              </RadialBarChart>
           </ResponsiveContainer>
        </ChartBox>
        
        <div className="flex flex-col justify-center gap-4">
           <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="p-8 rounded-3xl bg-gradient-to-r from-amber-900/20 to-transparent border border-amber-500/10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-4">
                   <span className="text-5xl font-bold text-white tracking-tight">30%</span>
                   <span className="text-emerald-400 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><TrendingUp size={14}/> CO2 Capture</span>
                </div>
                <div className="w-px bg-white/10 h-1.5 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: "30%" }} transition={{ duration: 1.5 }} className="h-full bg-emerald-500" />
                </div>
                <p className="mt-4 text-sm text-white/60 leading-relaxed">Ґрунт стає найбільшим резервуаром вуглецю.</p>
              </div>
           </motion.div>

           <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/20 to-transparent border border-blue-500/10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-4">
                   <span className="text-5xl font-bold text-white tracking-tight">50%</span>
                   <span className="text-blue-400 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><Droplets size={14}/> Water Retention</span>
                </div>
                <div className="w-px bg-white/10 h-1.5 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: "50%" }} transition={{ duration: 1.5 }} className="h-full bg-blue-500" />
                </div>
                <p className="mt-4 text-sm text-white/60 leading-relaxed">Здорова структура ґрунту утримує вологу набагато довше.</p>
              </div>
           </motion.div>
        </div>
     </div>
  </div>
));

const SlideConclusion = memo(() => (
   <div className="h-full flex flex-col justify-center items-center text-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent blur-3xl opacity-50 pointer-events-none" />
      
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-bold mb-16 relative z-10 tracking-tight text-white"
      >
        Синтез Майбутнього
      </motion.h2>
      
      <div className="grid grid-cols-3 gap-8 md:gap-12 w-full max-w-4xl relative z-10">
         {[
            { icon: Sprout, title: "Зелена", role: "Основа", color: "text-emerald-400", bg: "bg-emerald-500" },
            { icon: Dna, title: "Біотех", role: "Інструмент", color: "text-blue-400", bg: "bg-blue-500" },
            { icon: Layers, title: "Коричнева", role: "Середовище", color: "text-amber-400", bg: "bg-amber-500" },
         ].map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.2 }}
               whileHover={{ y: -10 }}
               className="flex flex-col items-center gap-6 group cursor-default"
             >
                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[40px] ${item.bg}/5 flex items-center justify-center border border-${item.bg}/10 group-hover:${item.bg}/20 transition-all shadow-2xl backdrop-blur-sm`}>
                   <item.icon size={40} className={item.color} />
                </div>
                <div>
                   <h3 className="text-2xl font-bold mb-2 text-white">{item.title}</h3>
                   <p className="text-[10px] text-white/40 uppercase tracking-[0.25em]">{item.role}</p>
                </div>
             </motion.div>
         ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-20 px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md relative z-10"
      >
         <p className="text-lg font-light text-white/80">Лише поєднання цих трьох революцій врятує світ.</p>
      </motion.div>
   </div>
));

// --- APP CONTROLLER ---

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = useMemo(() => [
    { id: 0, component: <SlideIntro />, theme: 'green' },
    { id: 1, component: <SlideDefinition />, theme: 'green' },
    { id: 2, component: <SlideResults />, theme: 'green' },
    { id: 3, component: <SlideBiotech />, theme: 'blue' },
    { id: 4, component: <SlideMalthus />, theme: 'red' },
    { id: 5, component: <SlideQuestion />, theme: 'blue' },
    { id: 6, component: <SlideMap />, theme: 'green' },
    { id: 7, component: <SlideRisks />, theme: 'red' },
    { id: 8, component: <SlideBrownRev />, theme: 'brown' },
    { id: 9, component: <SlideBrownData />, theme: 'brown' },
    { id: 10, component: <SlideConclusion />, theme: 'blue' },
  ], []);

  const navigate = (dir: number) => {
    setCurrentSlide(prev => {
      const next = prev + dir;
      if (next >= 0 && next < slides.length) {
        setDirection(dir);
        return next;
      }
      return prev;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        navigate(1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(-1);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const currentTheme = THEMES[slides[currentSlide].theme as keyof typeof THEMES];

  return (
    <div className={`h-screen w-screen bg-black overflow-hidden relative font-sans text-white subpixel-antialiased selection:bg-emerald-500/30`}>
      
      {/* Dynamic Background Gradients */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.bg} transition-colors duration-[1500ms] ease-in-out`} />
      
      {/* Subtle atmospheric fog */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Content Layer */}
      <main className="h-full w-full flex items-center justify-center p-4 md:p-8 lg:p-12 relative z-20">
        <AnimatePresence mode='wait' custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -30, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Custom bezier for iOS feel
            className="w-full max-w-[1600px] h-full max-h-[90vh] perspective-[2000px]"
          >
             <PremiumCard>
                {/* Card Header */}
                <div className="absolute top-8 left-10 z-50 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
                   <div className={`w-2 h-2 rounded-full ${currentTheme.accent.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} />
                   <span className="text-[10px] font-bold tracking-[0.2em] uppercase font-mono">Research Terminal</span>
                </div>
                
                <div className="absolute top-8 right-10 font-mono text-[10px] text-white/30 tracking-[0.2em] z-50">
                  SLIDE {String(currentSlide + 1).padStart(2, '0')} — {String(slides.length).padStart(2, '0')}
                </div>

                {slides[currentSlide].component}
             </PremiumCard>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-6 px-8 py-4 bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl ring-1 ring-white/5">
          <button 
            onClick={() => navigate(-1)}
            disabled={currentSlide === 0}
            className="p-2 rounded-full hover:bg-white/10 transition-all disabled:opacity-20 active:scale-90 text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2 items-center">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentSlide ? 1 : -1);
                  setCurrentSlide(idx);
                }}
                className={`rounded-full transition-all duration-500 ease-out ${
                  idx === currentSlide 
                    ? 'w-8 h-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                    : 'w-1 h-1 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={() => navigate(1)}
            disabled={currentSlide === slides.length - 1}
            className="p-2 rounded-full hover:bg-white/10 transition-all disabled:opacity-20 active:scale-90 text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
