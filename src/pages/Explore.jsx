import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StartupCard from '../components/StartupCard';
import FilterBar from '../components/FilterBar';
import { api } from '../api/client';

const PAGE_SIZE = 10;

function getPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function Explore() {
  const [searchParams] = useSearchParams();
  const [startups, setStartups] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeDomain, setActiveDomain] = useState(searchParams.get('domain') || 'All');
  const [sortBy, setSortBy] = useState('votes');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.getStartups().then(setStartups).catch(() => setStartups([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeDomain, sortBy, roleFilter]);

  const filtered = startups
    .filter(s => {
      const matchesDomain = activeDomain === 'All' || s.domain === activeDomain;
      const query = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        s.title.toLowerCase().includes(query) ||
        s.tagline.toLowerCase().includes(query) ||
        s.tags.some(t => t.toLowerCase().includes(query));

      let matchesRole = true;
      if (roleFilter === 'Looking for Dev') matchesRole = s.rolesNeeded?.includes('Developer');
      else if (roleFilter === 'Looking for Designer') matchesRole = s.rolesNeeded?.includes('Designer');
      else if (roleFilter === 'Looking for Marketer') matchesRole = s.rolesNeeded?.includes('Marketer');

      return matchesDomain && matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === 'votes') return b.votes - a.votes;
      if (sortBy === 'newest') return new Date(b.postedAt) - new Date(a.postedAt);
      if (sortBy === 'comments') return (b.comments?.length || 0) - (a.comments?.length || 0);
      if (sortBy === 'trending') return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) || b.votes - a.votes;
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      <Navbar />

      <FilterBar
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        activeDomain={activeDomain} setActiveDomain={setActiveDomain}
        sortBy={sortBy} setSortBy={setSortBy}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
        totalCount={startups.length} filteredCount={filtered.length}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6">
        <div className="mb-8">
          <h1 className="font-[Syne] text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-2 tracking-tight">
            {activeDomain === 'All' ? 'All Startups' : activeDomain}
          </h1>
          <p className="text-[#9CA3AF]">Discover the next big thing from college founders</p>
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pageItems.map((startup, i) => (
                <div key={startup.id} className="animate-fade-up opacity-0" style={{ animationDelay: `${i * 0.04}s` }}>
                  <StartupCard startup={startup} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <nav className="flex items-center gap-1.5" aria-label="Pagination">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#1A1A2E] hover:border-[#6C63FF] hover:text-[#6C63FF] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E2E8F0] disabled:hover:text-[#1A1A2E]"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  {getPageList(currentPage, totalPages).map((p, idx) =>
                    p === '...' ? (
                      <span key={`e${idx}`} className="w-10 h-10 flex items-center justify-center text-[#9CA3AF]">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        aria-current={p === currentPage ? 'page' : undefined}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition ${
                          p === currentPage
                            ? 'bg-[#6C63FF] text-white shadow-sm'
                            : 'border border-[#E2E8F0] bg-white text-[#1A1A2E] hover:border-[#6C63FF] hover:text-[#6C63FF]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#1A1A2E] hover:border-[#6C63FF] hover:text-[#6C63FF] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E2E8F0] disabled:hover:text-[#1A1A2E]"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </nav>
                <p className="text-sm text-[#9CA3AF]">
                  Showing {rangeStart}–{rangeEnd} of {filtered.length}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-5">
              <Compass size={28} className="text-[#9CA3AF]" />
            </div>
            <h3 className="font-[Syne] text-xl font-bold text-[#1A1A2E] mb-2">No startups found</h3>
            <p className="text-[#9CA3AF] max-w-sm mx-auto">Try adjusting your filters or search query to discover more pitches</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
