import React, { useEffect, useState } from 'react';
import { Skill, SkillCategory } from '../types';
import { loadSkills, saveSkills } from '../services/storageService';

const SkillTreeView: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeCategory, setActiveCategory] = useState<SkillCategory>(SkillCategory.PLANCHE);
  const [animatingSkillId, setAnimatingSkillId] = useState<string | null>(null);

  useEffect(() => {
    setSkills(loadSkills());
  }, []);

  const handleMasterSkill = (skillId: string) => {
      // 1. Trigger animation
      setAnimatingSkillId(skillId);

      // 2. Logic: Unlock children
      setTimeout(() => {
          const updatedSkills = skills.map(skill => {
             // Unlock direct children of the mastered skill
             if (skill.parentId === skillId) {
                 return { ...skill, unlocked: true };
             }
             return skill;
          });
          
          setSkills(updatedSkills);
          saveSkills(updatedSkills);
          setAnimatingSkillId(null);
      }, 1500); // 1.5s animation
  };

  const categories = Object.values(SkillCategory);
  const filteredSkills = skills.filter(s => s.category === activeCategory);

  // Determine if a skill is the "latest" unlocked one in its chain (leaf of unlocked path)
  // Logic: It is unlocked, AND any of its children are LOCKED (or it has no children).
  const isMasterable = (skill: Skill) => {
      if (!skill.unlocked) return false;
      const children = skills.filter(s => s.parentId === skill.id);
      if (children.length === 0) return true; // It's a final skill
      return children.some(child => !child.unlocked); // If next step is locked, this is the current step
  };

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden pb-24 pt-6">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 px-4 mb-4 z-10 bg-black">
          <h1 className="text-2xl font-bold text-white mb-2">Skill Progressions</h1>
          <p className="text-zinc-500 text-sm">Select a discipline to view the path.</p>
      </div>

      {/* Fixed Tabs Section */}
      <div className="flex-shrink-0 px-4 mb-2 z-10 bg-black border-b border-zinc-800 pb-4">
          <div className="flex overflow-x-auto gap-2 no-scrollbar">
              {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${
                        activeCategory === cat 
                        ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                      {cat.replace('_', ' ')}
                  </button>
              ))}
          </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 px-4 relative overflow-y-auto no-scrollbar pt-4">
        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-zinc-800"></div>
        
        <div className="space-y-8 relative pb-8">
          {filteredSkills.map((skill) => {
             const canMaster = isMasterable(skill);
             const isAnimating = animatingSkillId === skill.id;

             return (
                <div key={skill.id} className="relative pl-10">
                {/* Node Dot */}
                <div
                    className={`absolute left-2.5 top-6 w-4 h-4 rounded-full border-2 transform -translate-x-1/2 transition-colors z-10 ${
                    skill.unlocked
                        ? 'bg-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                        : 'bg-black border-zinc-700'
                    }`}
                ></div>

                {/* Content Card */}
                <div
                    className={`rounded-xl p-5 border transition-all relative overflow-hidden ${
                    skill.unlocked
                        ? 'bg-zinc-900 border-yellow-500/50'
                        : 'bg-black border-zinc-800 opacity-60'
                    }`}
                >
                    {/* Success Overlay Animation */}
                    {isAnimating && (
                        <div className="absolute inset-0 bg-emerald-500 z-20 flex items-center justify-center animate-pulse">
                            <span className="text-black font-black text-xl uppercase tracking-widest transform scale-110">
                                Unlocked!
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-lg ${skill.unlocked ? 'text-white' : 'text-zinc-500'}`}>
                        {skill.name}
                    </h3>
                    {skill.unlocked && !canMaster && <i className="fas fa-check-circle text-emerald-500 text-lg"></i>}
                    {!skill.unlocked && <i className="fas fa-lock text-zinc-700 text-sm"></i>}
                    </div>
                    
                    <p className="text-zinc-400 text-sm mb-3 font-light">{skill.description}</p>
                    
                    <div className="bg-black/40 rounded p-2 text-[10px] font-mono text-zinc-300 border border-zinc-800 flex items-center mb-3">
                    <i className="fas fa-clipboard-list text-yellow-600 mr-2"></i>
                    {skill.requirements}
                    </div>

                    {/* Master Button */}
                    {canMaster && (
                        <button 
                            onClick={() => handleMasterSkill(skill.id)}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold uppercase py-2 rounded border border-zinc-700 hover:border-emerald-500/50 hover:text-emerald-500 transition-all flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-level-up-alt"></i>
                            Complete & Unlock Next
                        </button>
                    )}
                </div>
                </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillTreeView;