import { Bell, CheckCircle2, Circle, Clock, Info, ShieldAlert, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Notifications() {
  const { notifications, currentUser, markNotificationRead, markAllNotificationsRead } = useApp();

  if (!currentUser) return null;
  
  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownToLine className="w-4 h-4 text-emerald-500" />;
      case 'withdraw': return <ArrowUpFromLine className="w-4 h-4 text-rose-500" />;
      case 'system': return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" /> Notifications
          </h2>
          <p className="text-xs text-slate-500">You have {unreadCount} unread messages.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllNotificationsRead(currentUser.id)}
            className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {userNotifications.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center opacity-70">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">No Notifications</h3>
            <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          userNotifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => markNotificationRead(notif.id)}
              className={`bg-white p-4 rounded-xl border shadow-sm transition-all cursor-pointer ${notif.isRead ? 'border-slate-200 opacity-70' : 'border-indigo-100 ring-1 ring-indigo-50'}`}
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {notif.type === 'deposit' && <div className="text-emerald-500 font-bold text-lg">+</div>}
                  {notif.type === 'withdraw' && <div className="text-rose-500 font-bold text-lg">-</div>}
                  {notif.type === 'system' && <ShieldAlert className="w-5 h-5 text-amber-500" />}
                  {notif.type === 'general' && <Info className="w-5 h-5 text-indigo-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-sm ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notif.title}
                    </h3>
                    {!notif.isRead ? (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1"></span>
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                    <Clock className="w-3 h-3" /> {notif.date}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
