import './Messages.css';
import { useContext, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../context/AuthContext';
import {
  listConversations,
  getThread,
  sendMessage,
  type ChatMessage,
  type Conversation,
  type GetThreadResponse,
  type ListConversationsResponse,
  type ThreadPartner,
} from '../../services/chatService';
import { ApiError } from '../../services/apiError';

const THREAD_PAGE_SIZE: number = 30;
const MESSAGE_MAX_LENGTH: number = 2000;

export default function Messages() {
  const params: { partnerId?: string } = useParams();
  const authContext: AuthContextType = useContext(AuthContext);
  const partnerId: string | null = params.partnerId ?? null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isConversationsLoading, setIsConversationsLoading] = useState<boolean>(true);
  const [conversationsError, setConversationsError] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThreadLoading, setIsThreadLoading] = useState<boolean>(false);
  const [threadError, setThreadError] = useState<string>('');
  const [oldestLoadedPage, setOldestLoadedPage] = useState<number>(1);
  const [threadTotalPages, setThreadTotalPages] = useState<number>(1);
  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);
  const [partner, setPartner] = useState<ThreadPartner | null>(null);

  const [draft, setDraft] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string>('');

  const messageListRef = useRef<HTMLDivElement>(null);
  const pendingScrollHeightRef = useRef<number | null>(null);

  useEffect(() => {
    const userId: string | null = authContext.userId;

    if (!userId || !partnerId) {
      setMessages([]);
      setPartner(null);
      setThreadError('');
      setIsThreadLoading(false);
      return;
    }

    let cancelled: boolean = false;

    setMessages([]);
    setPartner(null);
    setOldestLoadedPage(1);
    setThreadTotalPages(1);
    setThreadError('');
    setSendError('');
    setDraft('');
    setIsThreadLoading(true);

    const fetchThread = async (): Promise<void> => {
      try {
        const data: GetThreadResponse = await getThread(userId, partnerId, {
          page: 1,
          pageSize: THREAD_PAGE_SIZE,
        });

        if (cancelled) return;
        setMessages(data.messages);
        setPartner(data.partner);
        setThreadTotalPages(data.totalPages);
      } catch (err) {
        if (cancelled) return;
        setThreadError(err instanceof ApiError ? err.message : 'Failed to load messages.');
      } finally {
        if (!cancelled) setIsThreadLoading(false);
      }
    };
    fetchThread();

    return () => {
      cancelled = true;
    };
  }, [authContext.userId, partnerId]);

  useEffect(() => {
    const userId: string | null = authContext.userId;

    if (!userId) {
      setConversations([]);
      setIsConversationsLoading(false);
      return;
    }

    let cancelled: boolean = false;
    setIsConversationsLoading(true);
    setConversationsError('');

    const fetchConversations = async (): Promise<void> => {
      try {
        const data: ListConversationsResponse = await listConversations(userId);

        if (cancelled) return;
        setConversations(data.conversations);
      } catch (err) {
        if (cancelled) return;
        setConversationsError(err instanceof ApiError ? err.message : 'Failed to load conversations.');
      } finally {
        if (!cancelled) setIsConversationsLoading(false);
      }
    };
    fetchConversations();

    return () => {
      cancelled = true;
    };
  }, [authContext.userId]);

  useEffect(() => {
    const list: HTMLDivElement | null = messageListRef.current;
    if (!list) return;

    if (pendingScrollHeightRef.current !== null) {
      list.scrollTop += list.scrollHeight - pendingScrollHeightRef.current;
      pendingScrollHeightRef.current = null;
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [messages]);

  async function handleLoadOlderMessages(): Promise<void> {
    if (!authContext.userId || !partnerId) return;
    if (isLoadingOlder || oldestLoadedPage >= threadTotalPages) return;

    const nextPage: number = oldestLoadedPage + 1;
    setIsLoadingOlder(true);

    try {
      const data: GetThreadResponse = await getThread(authContext.userId, partnerId, {
        page: nextPage,
        pageSize: THREAD_PAGE_SIZE,
      });

      pendingScrollHeightRef.current = messageListRef.current?.scrollHeight ?? null;
      setMessages((prev) => {
        const knownIds: Set<string> = new Set(prev.map((message) => message.chatId));
        const older: ChatMessage[] = data.messages.filter((message) => !knownIds.has(message.chatId));
        if (older.length === 0) return prev;
        return [...older, ...prev];
      });
      setOldestLoadedPage(nextPage);
      setThreadTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error loading older messages:', err);
    } finally {
      setIsLoadingOlder(false);
    }
  }

  async function handleSendMessage(e: FormEvent): Promise<void> {
    e.preventDefault();

    const userId: string | null = authContext.userId;
    const trimmedDraft: string = draft.trim();
    if (!userId || !partnerId || trimmedDraft === '' || isSending) return;

    setIsSending(true);
    setSendError('');
    setDraft('');

    try {
      await sendMessage(userId, partnerId, { message: trimmedDraft });
    } catch (err) {
      console.error('Error sending message:', err);
      setDraft(trimmedDraft);
      setSendError(err instanceof ApiError ? err.message : 'Failed to send message.');
      setIsSending(false);
      return;
    }

    try {
      const [thread, conversationList]: [GetThreadResponse, ListConversationsResponse] = await Promise.all([
        getThread(userId, partnerId, { page: 1, pageSize: THREAD_PAGE_SIZE }),
        listConversations(userId),
      ]);
      setMessages(thread.messages);
      setOldestLoadedPage(1);
      setThreadTotalPages(thread.totalPages);
      setConversations(conversationList.conversations);
    } catch (err) {
      console.error('Error refreshing conversation:', err);
    } finally {
      setIsSending(false);
    }
  }

  if (!authContext.userId) {
    return (
      <div className="messages page">
        <p className="messages-empty muted">
          <Link to="/auth/login">Log in</Link> to see your messages.
        </p>
      </div>
    );
  }

  const partnerUsername: string = partner?.username ?? '';
  const partnerAvatarPath: string = partner?.avatarPath ?? '';
  const partnerTagline: string = partner?.tagline ?? '';

  return (
    <div className="messages page">
      <div className={partnerId ? 'messages-body has-thread' : 'messages-body'}>
        <aside className="messages-list-pane">
          <h2 className="messages-pane-title">Conversations</h2>
          {conversationsError !== '' && <p className="messages-error error-text">{conversationsError}</p>}
          {conversationsError === '' && !isConversationsLoading && conversations.length === 0 && (
            <p className="messages-empty muted">No conversations yet. Open a player's profile and hit Message.</p>
          )}
          <ul className="conversation-list">
            {conversations.map((conversation) => (
              <li key={conversation.partnerId}>
                <Link
                  className={conversation.partnerId === partnerId ? 'conversation-item active' : 'conversation-item'}
                  to={`/messages/${conversation.partnerId}`}
                >
                  <img
                    className="conversation-avatar avatar"
                    src={conversation.avatarPath}
                    alt={conversation.username}
                  />
                  <div className="conversation-text stack">
                    <span className="conversation-username">{conversation.username}</span>
                    <span className="conversation-preview ellipsis">
                      {conversation.lastMessageSenderId === authContext.userId && 'You: '}
                      {conversation.lastMessage}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <section className="messages-thread-pane">
          {!partnerId ? (
            <p className="messages-empty thread-placeholder muted center">Select a conversation to start reading.</p>
          ) : (
            <>
              <header className="thread-header">
                <Link className="thread-back center" to="/messages" aria-label="Back to conversations">
                  <svg
                    className="thread-back-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </Link>
                {partnerAvatarPath !== '' && (
                  <Link to={`/dashboard/${partnerId}`}>
                    <img className="thread-avatar avatar" src={partnerAvatarPath} alt={partnerUsername} />
                  </Link>
                )}
                <div className="thread-identity stack">
                  <Link className="thread-username" to={`/dashboard/${partnerId}`}>
                    {partnerUsername}
                  </Link>
                  {partnerTagline !== '' && <span className="thread-tagline ellipsis">{partnerTagline}</span>}
                </div>
              </header>
              <div className="thread-messages" ref={messageListRef}>
                {oldestLoadedPage < threadTotalPages && (
                  <button
                    type="button"
                    className="thread-load-older"
                    onClick={handleLoadOlderMessages}
                    disabled={isLoadingOlder}
                  >
                    {isLoadingOlder ? 'Loading...' : 'Load older messages'}
                  </button>
                )}
                {threadError !== '' && <p className="messages-error error-text">{threadError}</p>}
                {threadError === '' && !isThreadLoading && messages.length === 0 && (
                  <p className="messages-empty muted">No messages yet. Say hi!</p>
                )}
                {messages.map((message) => (
                  <div
                    key={message.chatId}
                    className={message.senderId === authContext.userId ? 'message-row own' : 'message-row'}
                  >
                    <div className="message-bubble">
                      <p className="message-text">{message.message}</p>
                      <span className="message-date">
                        {new Date(message.date).toLocaleString('en-GB', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <form className="thread-composer" onSubmit={handleSendMessage}>
                <input
                  className="thread-composer-input"
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={MESSAGE_MAX_LENGTH}
                />
                <button type="submit" className="btn btn-green" disabled={isSending || draft.trim() === ''}>
                  Send
                </button>
              </form>
              {sendError !== '' && <p className="messages-error error-text">{sendError}</p>}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
