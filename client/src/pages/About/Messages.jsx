import React, { useEffect, useState } from 'react';
import { getMessages } from '../../utils/api.js';

const MESSAGE_THEMES = [
  {
    cardBg: 'from-lime-500 via-emerald-500 to-teal-500',
    positionBadge: 'bg-emerald-900/20 text-white',
    avatarRing: 'ring-emerald-300'
  },
  {
    cardBg: 'from-sky-500 via-blue-500 to-indigo-500',
    positionBadge: 'bg-blue-900/20 text-white',
    avatarRing: 'ring-blue-300'
  },
  {
    cardBg: 'from-amber-400 via-orange-500 to-rose-500',
    positionBadge: 'bg-rose-900/20 text-white',
    avatarRing: 'ring-orange-300'
  }
];

const getInitials = (name = '') => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'MS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
};

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMessageId, setOpenMessageId] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getMessages();
        const incoming = Array.isArray(res?.data) ? res.data : [];
        setMessages(incoming);
        if (incoming.length > 0) {
          setOpenMessageId(String(incoming[0]?._id || 'message-0'));
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl font-bold text-center md:text-left">Messages</h1>
        <p className="mt-2 text-center text-emerald-100 md:text-left">
          Messages from our leadership and key figures.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          No messages available right now.
        </div>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {messages.map((message, index) => {
              const theme = MESSAGE_THEMES[index % MESSAGE_THEMES.length];
              const messageId = String(message?._id || `message-${index}`);
              const isOpen = openMessageId === messageId;
              const isReverse = index % 2 === 1;
              const panelId = `message-panel-${messageId}`;

              return (
                <article key={messageId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenMessageId((prev) => (prev === messageId ? '' : messageId))}
                    className={`w-full bg-gradient-to-r ${theme.cardBg} p-4 text-left`}
                  >
                    <div className={`flex items-center gap-3 ${isReverse ? 'flex-row-reverse' : 'flex-row'}`}>
                      {message.image ? (
                        <img
                          src={message.image}
                          alt={message.name || 'Leader'}
                          className={`h-24 w-24 rounded-full object-cover ring-2 ring-white/80 shadow-md sm:h-28 sm:w-28 ${theme.avatarRing}`}
                        />
                      ) : (
                        <div
                          className={`flex h-24 w-24 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-gray-700 ring-2 ring-white/80 shadow-md sm:h-28 sm:w-28 ${theme.avatarRing}`}
                        >
                          {getInitials(message.name)}
                        </div>
                      )}

                      <div className={`min-w-0 flex-1 ${isReverse ? 'text-right' : 'text-left'}`}>
                        <h3 className="truncate text-base font-bold text-white sm:text-lg">{message.name || 'Team Member'}</h3>
                        <p className="truncate text-xs text-white/90 sm:text-sm">{message.position || 'Leadership Message'}</p>
                      </div>

                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform ${
                          isOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                      >
                        v
                      </span>
                    </div>
                  </button>

                  {isOpen ? (
                    <div id={panelId} className="border-t border-gray-100 bg-white p-4">
                      <p className="whitespace-pre-line break-words text-sm leading-7 text-gray-700">
                        {String(message.message || '').trim() || 'Message content is not available.'}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="hidden space-y-8 lg:block">
            {messages.map((message, index) => {
              const theme = MESSAGE_THEMES[index % MESSAGE_THEMES.length];
              const isReverse = index % 2 === 1;
              const wrapperDirection = isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row';

              return (
                <article
                  key={message._id}
                  className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${theme.cardBg} p-7 shadow-lg`}
                >
                  <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15" />
                  <div className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-white/10" />

                  <div className={`relative z-10 flex items-start gap-5 ${wrapperDirection}`}>
                    <div className="shrink-0 self-center lg:self-auto">
                      <div className="flex flex-col items-center text-center gap-2.5">
                        {message.image ? (
                          <img
                            src={message.image}
                            alt={message.name || 'Leader'}
                            className={`h-32 w-32 rounded-full object-cover ring-4 ring-white/80 shadow-xl ${theme.avatarRing}`}
                          />
                        ) : (
                          <div
                            className={`flex h-32 w-32 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-gray-700 ring-4 ring-white/80 shadow-xl ${theme.avatarRing}`}
                          >
                            {getInitials(message.name)}
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-white drop-shadow-sm">
                          {message.name || 'Team Member'}
                        </h3>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${theme.positionBadge}`}>
                          {message.position || 'Leadership Message'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur-[1px]">
                      <p className="whitespace-pre-line break-words text-gray-700 leading-7">
                        {String(message.message || '').trim() || 'Message content is not available.'}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Messages;
