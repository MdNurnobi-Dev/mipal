import { useState } from 'react';
import { MessageSquare, Check, X, Trash2, Search, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminPosts() {
  const { posts, approvePost, rejectPost, deletePost } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" /> Community Posts
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review and manage user posts before they appear on the public feed.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-white border border-slate-200 text-xs rounded-lg px-3 py-1.5 outline-none font-medium text-slate-700"
            >
              <option value="all">All Posts</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="text-xs font-medium text-slate-500">
            {filteredPosts.length} post(s) found
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No posts found for this filter.
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors">
                <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full bg-slate-100" />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{post.userName}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500">{new Date(post.createdAt).toLocaleString()}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          post.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          post.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {post.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => approvePost(post.id)}
                            className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="Approve Post"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => rejectPost(post.id)}
                            className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Reject Post"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => {
                          if(confirm('Are you sure you want to delete this post completely?')) {
                            deletePost(post.id);
                          }
                        }}
                        className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors ml-2"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700 shadow-sm">
                    {post.content}
                  </div>
                  
                  <div className="flex gap-4 mt-3 text-[11px] font-medium text-slate-500">
                    <span>❤️ {post.likes} Likes</span>
                    <span>💬 {post.comments} Comments</span>
                    <span>🔗 {post.shares} Shares</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
