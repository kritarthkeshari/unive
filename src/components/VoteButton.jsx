import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { api, isLoggedIn } from '../api/client';

export default function VoteButton({ pitchId, initialVotes, initialHasVoted = false, onVoteChange, size = 'md' }) {
  const navigate = useNavigate();
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [animating, setAnimating] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => { setVotes(initialVotes); }, [initialVotes]);
  useEffect(() => { setHasVoted(initialHasVoted); }, [initialHasVoted]);

  async function handleVote(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const willVote = !hasVoted;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    if (willVote) {
      const newParticles = Array.from({ length: 4 }, (_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 50,
        y: -(Math.random() * 30 + 10),
        text: '+1'
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 700);
    }

    try {
      const res = await api.toggleVote(pitchId);
      setVotes(res.votes);
      setHasVoted(res.hasVoted);
      if (onVoteChange) onVoteChange(res.votes);
    } catch (err) {
      if (err.status === 401) navigate('/login');
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1',
    md: 'px-4 py-2 text-sm gap-1.5',
    lg: 'px-6 py-3.5 text-base gap-2 w-full justify-center',
  };

  const iconSizes = { sm: 14, md: 16, lg: 22 };

  return (
    <div className="relative">
      {}
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute text-xs font-bold text-[#6C63FF] pointer-events-none vote-particle z-10"
          style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)` }}
        >
          {p.text}
        </span>
      ))}

      <button
        onClick={handleVote}
        className={`group relative inline-flex items-center rounded-xl font-semibold transition-all duration-300 btn-ripple cursor-pointer ${sizeClasses[size]}
          ${hasVoted
            ? 'bg-gradient-to-r from-[#6C63FF] to-[#7C74FF] text-white shadow-lg shadow-[#6C63FF]/30 hover:shadow-xl hover:shadow-[#6C63FF]/40'
            : 'bg-white text-[#6B7280] border-2 border-gray-200 hover:border-[#6C63FF]/50 hover:text-[#6C63FF] hover:bg-[#6C63FF]/5 hover:shadow-md'
          }
          ${animating ? 'scale-110' : 'hover:scale-[1.03]'}
        `}
      >
        <ChevronUp
          size={iconSizes[size]}
          className={`transition-transform duration-300 ${animating ? '-translate-y-1' : ''} ${hasVoted ? '' : 'group-hover:-translate-y-0.5'}`}
        />
        <span className="font-mono font-bold tabular-nums">{votes}</span>
        {size === 'lg' && <span className="text-xs opacity-70 ml-1 font-normal">{hasVoted ? 'Voted!' : 'Upvote'}</span>}
      </button>
    </div>
  );
}
