const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// Update imports
if (!content.includes('MoreHorizontal')) {
  content = content.replace('X } from \'lucide-react\';', 'X, MoreHorizontal, Globe } from \'lucide-react\';');
}

// Extract everything before the Feed Section
const parts = content.split('{/* Feed Section */}');
const beforeFeed = parts[0];

const newFeed = `      {/* Feed Section */}
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
`;

fs.writeFileSync('src/pages/Home.tsx', beforeFeed + newFeed);
console.log('Home.tsx updated with new feed design.');
