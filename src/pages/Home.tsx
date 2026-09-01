import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Send, Trophy, TrendingUp, Zap, Gift, ArrowRight, X, MoreHorizontal, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockPosts } from '../data';
import { Post } from '../types';
import { cn, useCooldownHidden } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { useSiteSettings } from '../hooks/useSiteSettings';
import FaqSection from '../components/FaqSection';
import RecentActivity from '../components/RecentActivity';

const topEarners = [
  { id: 'bd-1', name: 'Md. Faruk Hossain', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Faruk', earnings: 2350.00, rank: 1 },
  { id: 'bd-2', name: 'Sumaiya Akter', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sumaiya', earnings: 1420.00, rank: 2 },
  { id: 'bd-3', name: 'Tanvir Ahmed', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tanvir', earnings: 850.50, rank: 3 },
  { id: 'bd-4', name: 'Shakil Mahmud', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shakil', earnings: 780.00, rank: 4 },
];

export default function Home() {
  const { currentUser, plans, giveawayBanners, posts, addPost, togglePostLike, addPostComment, sharePost } = useApp();
  const { siteSettings } = useSiteSettings();
  const navigate = useNavigate();
  const [newPostContent, setNewPostContent] = useState('');

  

  const activeBanners = giveawayBanners.filter(b => b.isActive);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hideBanner, setHideBanner] = useCooldownHidden('hide_home_banner', 12);
  const [hideLeaderboard, setHideLeaderboard] = useCooldownHidden('hide_home_leaderboard', 12);
  const [hideRecentActivity, setHideRecentActivity] = useCooldownHidden('hide_home_recent_activity', 12);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    addPost({
      userId: currentUser?.id,
      userName: currentUser?.name,
      userAvatar: currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`,
      content: newPostContent
    });

    setNewPostContent('');
    alert('Post submitted and is pending admin approval. It will only be visible to you until approved.');
  };

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  
  const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addPostComment(postId, {
      userId: currentUser?.id,
      userName: currentUser?.name,
      userAvatar: currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`,
      content: commentText
    });
    setCommentText('');
  };

  const activePlan = plans.find(p => p.id === currentUser?.activePlanId);
  const today = new Date().toISOString().split('T')[0];
  const currentDailyEarned = currentUser?.lastEarnedDate === today ? (currentUser?.dailyEarned || 0) : 0;
  const { formatCurrency } = useCurrency();


  if (!currentUser) return null;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Image Giveaway Banner Carousel */}
      {activeBanners.length > 0 && !hideBanner && (
        <div className="relative rounded-2xl overflow-hidden aspect-[21/9] sm:aspect-[21/8] bg-slate-900 shadow-sm group">
          <button 
            onClick={(e) => { e.stopPropagation(); setHideBanner(); }}
            className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 transition-colors"
            aria-label="Close Banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div 
            className="flex transition-transform duration-500 ease-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {activeBanners.map(banner => (
              <div key={banner.id} className="min-w-full h-full relative cursor-pointer" onClick={() => banner.actionUrl && window.open(banner.actionUrl, '_blank')}>
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                ) : (
                  <div className={cn("absolute inset-0 w-full h-full", banner.color || "bg-indigo-600")} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-5">
                  <h3 className="text-white font-bold text-base sm:text-lg leading-tight mb-1">{banner.title}</h3>
                  <p className="text-white/80 text-[10px] sm:text-xs font-medium max-w-[85%]">{banner.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress Indicators */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {activeBanners.map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn("h-1 rounded-full transition-all duration-300", currentSlide === idx ? "w-4 bg-white" : "w-1.5 bg-white/40")}
                />
              ))}
            </div>
          )}
          
          {/* Badge */}
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg z-10 animate-pulse">
            Special Offer
          </div>
        </div>
      )}

      {/* Leaderboard Section */}
      {!hideLeaderboard && (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        <button 
          onClick={() => setHideLeaderboard()}
          className="absolute top-2.5 right-2.5 z-10 w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors"
          aria-label="Close Leaderboard"
        >
          <X className="w-3 h-3" />
        </button>
        <div className="p-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Top Earners This Week
          </h3>
        </div>
        <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {topEarners.map(earner => (
            <div key={earner.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded flex items-center justify-center font-bold text-xs", 
                  earner.rank === 1 ? 'bg-amber-100 text-amber-700' :
                  earner.rank === 2 ? 'bg-slate-200 text-slate-700' :
                  earner.rank === 3 ? 'bg-orange-100 text-orange-700' :
                  'bg-indigo-50 text-indigo-600'
                )}>
                  #{earner.rank}
                </div>
                <img src={earner.avatar} alt={earner.name} className="w-6 h-6 rounded-full bg-white shadow-sm border border-slate-200" />
                <p className="text-xs font-bold text-slate-700">{earner.name}</p>
              </div>
              <span className="text-xs font-bold text-green-600">{formatCurrency(earner.earnings)}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Create Post Section */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-2.5">
          <img 
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full bg-slate-100 object-cover" 
          />
          <form onSubmit={handlePost} className="flex-1">
            <input
              type="text"
              placeholder="Share your earnings or thoughts..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <div className="flex justify-between items-center mt-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Balance: <span className="text-green-600">{formatCurrency(currentUser?.balance)}</span>
                </span>
              </div>
              <button 
                type="submit"
                disabled={!newPostContent.trim()}
                className="bg-indigo-600 text-white p-1.5 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {!hideRecentActivity && (
        <RecentActivity onClose={() => setHideRecentActivity()} />
      )}
      <FaqSection />

            {/* Feed Section */}
      <div className="space-y-4">
        {posts.filter(p => p.status === 'approved' || p.userId === currentUser?.id).map(post => (
          <div key={post.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Post Header */}
            <div className="px-3 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-xs" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-slate-900 leading-none">{post.userName}</span>
                    {post.status === 'pending' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold leading-none tracking-wide uppercase">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 mt-1">
                    <span>{post.createdAt}</span>
                    <span>•</span>
                    <Globe className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-full transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            {/* Post Content */}
            <div className="px-3 pb-3">
              <p className="text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>
            
            {/* Post Stats */}
            {(post.likes > 0 || post.comments > 0 || post.shares > 0) && (
              <div className="px-3 py-2 flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100/60 mx-2">
                <div className="flex items-center gap-1">
                  {post.likes > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="bg-indigo-500 rounded-full p-0.5">
                        <Heart className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                      <span className="font-medium">{post.likes}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2.5 font-medium">
                  {post.comments > 0 && <span>{post.comments} comments</span>}
                  {post.shares > 0 && <span>{post.shares} shares</span>}
                </div>
              </div>
            )}
            
            {/* Post Actions */}
            <div className="px-2 py-1 flex items-center justify-between border-t border-slate-100/60 mt-1">
              <button 
                onClick={() => togglePostLike(post.id, currentUser?.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-colors text-[11px] font-bold",
                  post.likedBy?.includes(currentUser?.id) ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Heart className={cn("w-4 h-4", post.likedBy?.includes(currentUser?.id) && "fill-current")} />
                Like
              </button>
              <button 
                onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-[11px] font-bold"
              >
                <MessageCircle className="w-4 h-4" />
                Comment
              </button>
              <button 
                onClick={() => { sharePost(post.id); alert('Link copied to clipboard!'); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-[11px] font-bold"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
            
            {/* Comments Section */}
            {activeCommentPostId === post.id && (
              <div className="px-3 pb-3 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3">
                {/* Existing Comments */}
                {post.commentsList && post.commentsList.length > 0 && (
                  <div className="space-y-3 mt-1">
                    {post.commentsList.map(comment => (
                      <div key={comment.id} className="flex gap-2.5 items-start">
                        <img src={comment.userAvatar} alt={comment.userName} className="w-7 h-7 rounded-full object-cover shadow-xs border border-slate-200 mt-0.5" />
                        <div className="flex flex-col">
                          <div className="bg-slate-200/60 px-3 py-2 rounded-2xl rounded-tl-sm text-left shadow-sm">
                            <span className="text-[11px] font-bold text-slate-900 block leading-tight mb-0.5">{comment.userName}</span>
                            <span className="text-[12px] text-slate-700 leading-snug">{comment.content}</span>
                          </div>
                          <div className="flex items-center gap-3 px-2 mt-1 text-[10px] font-bold text-slate-500">
                            <button className="hover:text-slate-800 transition-colors">Like</button>
                            <button className="hover:text-slate-800 transition-colors">Reply</button>
                            <span className="font-medium text-slate-400">Just now</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Comment Input */}
                <div className="flex gap-2 items-center mt-3">
                  <img src={currentUser?.avatar} alt={currentUser?.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex-1 flex items-center bg-white rounded-full px-3 py-1.5 border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 shadow-xs transition-all">
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400"
                    />
                    <button 
                      type="submit" 
                      disabled={!commentText.trim()} 
                      className="text-indigo-600 disabled:opacity-40 p-1 hover:bg-indigo-50 rounded-full transition-colors ml-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
