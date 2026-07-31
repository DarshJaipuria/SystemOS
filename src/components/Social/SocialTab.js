// FILE: src/components/Social/SocialTab.js
'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_PEERS, COMMUNITY_FEED } from '@/lib/demoData';
import { gamificationStore } from '@/lib/gamificationStore';
import { Trophy, Flame, Target, MessageCircle, Heart, Users, CheckCircle, Zap } from 'lucide-react';

const CHALLENGES = [
  { id: 'hydration_7', emoji: '💧', title: '7-Day Hydration Sprint', desc: 'Drink 8 glasses every day for 7 days', participants: 142, duration: '7 days', reward: '100 XP + Hydration Hero badge' },
  { id: 'no_phone', emoji: '📵', title: 'No Phone After 10 PM', desc: 'Put your phone away by 10 PM for 7 days', participants: 89, duration: '7 days', reward: '75 XP + Digital Detox badge' },
  { id: 'exam_blitz', emoji: '📚', title: 'Exam Prep Blitz', desc: 'Study 3+ hours daily for 5 days', participants: 234, duration: '5 days', reward: '150 XP + Exam Ready badge' }
];

export default function SocialTab({ user }) {
  const [leaderboardTab, setLeaderboardTab] = useState('Weekly Streak');
  const [feedLimit, setFeedLimit] = useState(10);
  const [reactions, setReactions] = useState({});
  const [joinedChallenges, setJoinedChallenges] = useState({});
  const [toast, setToast] = useState(null);
  const [cheeredUsers, setCheeredUsers] = useState({});
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReactions(JSON.parse(localStorage.getItem('sysos_social_reactions') || '{}'));
    setJoinedChallenges(JSON.parse(localStorage.getItem('sysos_social_challenges') || '{}'));
    setCheeredUsers(JSON.parse(localStorage.getItem('sysos_social_cheers') || '{}'));

    // Combine user with MOCK_PEERS
    const gState = gamificationStore.getState();
    const currentUser = {
      id: 'current',
      name: user?.name || 'You',
      avatar: '👤',
      level: gState.level,
      xp: gState.xp,
      streak: 5, // mock current streak
      habitsDone: 42, // mock completions
      isCurrentUser: true
    };
    
    setLeaderboardData([...MOCK_PEERS, currentUser]);
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReact = (feedId, type) => {
    const key = `${feedId}_${type}`;
    const newReactions = { ...reactions, [key]: (reactions[key] || 0) + 1 };
    setReactions(newReactions);
    localStorage.setItem('sysos_social_reactions', JSON.stringify(newReactions));
  };

  const toggleChallenge = (id) => {
    const isJoined = joinedChallenges[id];
    const newChallenges = { ...joinedChallenges, [id]: !isJoined };
    setJoinedChallenges(newChallenges);
    localStorage.setItem('sysos_social_challenges', JSON.stringify(newChallenges));
    if (!isJoined) showToast('Joined challenge successfully!');
  };

  const handleCheer = (peerId, peerName) => {
    const newCheers = { ...cheeredUsers, [peerId]: Date.now() };
    setCheeredUsers(newCheers);
    localStorage.setItem('sysos_social_cheers', JSON.stringify(newCheers));
    showToast(`🔥 Cheer sent to ${peerName}!`);
  };

  // Sort Leaderboard
  const sortedLeaderboard = [...leaderboardData].sort((a, b) => {
    if (leaderboardTab === 'Weekly Streak') return b.streak - a.streak;
    if (leaderboardTab === 'Monthly Completions') return b.habitsDone - a.habitsDone;
    return (b.xp / 25) - (a.xp / 25); // Focus Hours approx
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '1rem 2rem', borderRadius: '30px', zIndex: 1000, boxShadow: '0 4px 15px rgba(16,185,129,0.3)', fontWeight: 'bold' }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* 1. Leaderboard */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
            <Trophy size={20} color="#f59e0b" /> Leaderboard
          </h2>
          
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '0.25rem', marginBottom: '1rem' }}>
            {['Weekly Streak', 'Monthly Completions', 'Focus Hours'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setLeaderboardTab(tab)}
                style={{ flex: 1, padding: '0.5rem', border: 'none', background: leaderboardTab === tab ? '#fff' : 'transparent', borderRadius: '6px', fontSize: '0.8rem', fontWeight: leaderboardTab === tab ? 'bold' : 'normal', color: leaderboardTab === tab ? '#1f2937' : '#6b7280', cursor: 'pointer', boxShadow: leaderboardTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1, maxHeight: '400px' }}>
            {sortedLeaderboard.map((u, i) => {
              let val = u.streak;
              if (leaderboardTab === 'Monthly Completions') val = u.habitsDone;
              if (leaderboardTab === 'Focus Hours') val = Math.floor(u.xp / 25);
              
              let trophy = null;
              if (i === 0) trophy = '🥇';
              else if (i === 1) trophy = '🥈';
              else if (i === 2) trophy = '🥉';

              return (
                <div key={u.id} className={`leaderboard-row ${u.isCurrentUser ? 'current-user' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: u.isCurrentUser ? '#eff6ff' : '#f9fafb', border: u.isCurrentUser ? '1px solid #bfdbfe' : '1px solid transparent', borderRadius: '8px', animation: `slideUp 0.3s ease forwards ${i * 0.05}s`, opacity: 0, transform: 'translateY(10px)' }}>
                  <div style={{ width: '24px', fontWeight: 'bold', color: '#9ca3af', textAlign: 'center' }}>
                    {trophy || `${i+1}.`}
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>{u.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {u.name} {u.isCurrentUser && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#3b82f6', color: '#fff', borderRadius: '10px' }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Level {u.level}</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: leaderboardTab === 'Weekly Streak' ? '#f59e0b' : '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {val} {leaderboardTab === 'Weekly Streak' ? '🔥' : leaderboardTab === 'Monthly Completions' ? '✓' : 'h'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Community Feed */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
            <Users size={20} color="#3b82f6" /> Community Activity
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, maxHeight: '400px', paddingRight: '0.5rem' }}>
            {COMMUNITY_FEED.slice(0, feedLimit).map(item => (
              <div key={item.id} className="feed-item" style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div className="feed-avatar" style={{ fontSize: '2rem', background: '#f3f4f6', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.userAvatar || '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                      <span style={{ fontWeight: 'bold' }}>{item.userName}</span> {item.action} <span style={{ fontWeight: 'bold' }}>{item.target}</span>
                    </div>
                    <div className="feed-time" style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      {item.timeAgo}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      {[
                        { type: 'fire', icon: '🔥' },
                        { type: 'clap', icon: '👏' },
                        { type: 'heart', icon: '❤️' }
                      ].map(r => {
                        const count = (item.reactions?.[r.type] || 0) + (reactions[`${item.id}_${r.type}`] || 0);
                        return (
                          <button 
                            key={r.type}
                            onClick={() => handleReact(item.id, r.type)}
                            style={{ padding: '0.25rem 0.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                            onMouseOut={e => e.currentTarget.style.background = '#f9fafb'}
                          >
                            {r.icon} {count > 0 && count}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {feedLimit < COMMUNITY_FEED.length && (
              <button 
                onClick={() => setFeedLimit(prev => prev + 5)}
                style={{ padding: '0.75rem', background: 'transparent', border: '1px dashed #d1d5db', borderRadius: '8px', color: '#6b7280', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Load More
              </button>
            )}
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* 3. Group Challenges */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
            <Target size={20} color="#ef4444" /> Active Challenges
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {CHALLENGES.map(c => {
              const joined = joinedChallenges[c.id];
              const progressWidth = `${(c.participants / 300) * 100}%`;
              return (
                <div key={c.id} className="challengeCard" style={{ border: `1px solid ${joined ? '#10b981' : '#e5e7eb'}`, borderRadius: '12px', padding: '1rem', background: joined ? '#f0fdf4' : '#fff', transition: 'all 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '2rem' }}>{c.emoji}</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#1f2937' }}>{c.title}</h3>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{c.duration}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleChallenge(c.id)}
                      style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', background: joined ? '#10b981' : '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      {joined ? <><CheckCircle size={14} /> Joined</> : 'Join'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: '0.5rem 0' }}>{c.desc}</p>
                  <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                    <Trophy size={14} /> Reward: {c.reward}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      <span>👥 {c.participants + (joined ? 1 : 0)} students joined</span>
                      <span>Goal: 300</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: progressWidth, height: '100%', background: '#ef4444', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Encourage Friends */}
        <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
            <Zap size={20} color="#8b5cf6" /> Encourage Friends
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {MOCK_PEERS.slice(0, 6).map(peer => {
              const lastCheered = cheeredUsers[peer.id];
              const canCheer = !lastCheered || (Date.now() - lastCheered > 24 * 60 * 60 * 1000);
              const statusColor = peer.streak > 3 ? '#10b981' : peer.streak > 0 ? '#f59e0b' : '#9ca3af';

              return (
                <div key={peer.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '10px', height: '10px', borderRadius: '50%', background: statusColor }}></div>
                  <div style={{ fontSize: '2.5rem', background: '#f3f4f6', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {peer.avatar}
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.9rem', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {peer.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Lvl {peer.level} • {peer.streak}🔥
                  </div>
                  <button 
                    onClick={() => handleCheer(peer.id, peer.name)}
                    disabled={!canCheer}
                    style={{ marginTop: '0.5rem', width: '100%', padding: '0.4rem', border: 'none', background: canCheer ? '#f3e8ff' : '#f3f4f6', color: canCheer ? '#7e22ce' : '#9ca3af', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: canCheer ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', transition: 'background 0.2s' }}
                  >
                    <Flame size={14} /> {canCheer ? 'Encourage' : 'Cheered'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
