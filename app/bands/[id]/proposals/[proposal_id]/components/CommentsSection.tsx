'use client';

import { useState } from 'react';
import Button from '@/components/Button';

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: {
    displayName: string;
  };
  replies?: Reply[];
}

interface Reply {
  id: string;
  body: string;
  createdAt: string;
  author: {
    displayName: string;
  };
}

interface CommentsSectionProps {
  comments: Comment[];
  currentUserName: string;
  onAddComment: (body: string) => void;
  onReply: (commentId: string, body: string) => void;
  onEditComment: (commentId: string, newBody: string) => void;
  onEditReply: (commentId: string, replyId: string, newBody: string) => void;
  onDeleteComment: (commentId: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
}

export default function CommentsSection({
  comments,
  currentUserName,
  onAddComment,
  onReply,
  onEditComment,
  onEditReply,
  onDeleteComment,
  onDeleteReply,
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setAddingComment(true);
    await onAddComment(newComment);
    setNewComment('');
    setAddingComment(false);
  };

  const handleEditComment = (commentId: string, currentBody: string) => {
    setEditingCommentId(commentId);
    setEditText(currentBody);
  };

  const handleEditReply = (commentId: string, replyId: string, currentBody: string) => {
    setEditingReplyId(`${commentId}-${replyId}`);
    setEditText(currentBody);
  };

  const handleSaveCommentEdit = (commentId: string) => {
    if (editText.trim()) {
      onEditComment(commentId, editText);
    }
    setEditingCommentId(null);
    setEditText('');
  };

  const handleSaveReplyEdit = (commentId: string, replyId: string) => {
    if (editText.trim()) {
      onEditReply(commentId, replyId, editText);
    }
    setEditingReplyId(null);
    setEditText('');
  };

  const handleReply = (commentId: string) => {
    const replyText = prompt('Your reply:');
    if (replyText?.trim()) {
      onReply(commentId, replyText);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-earth-900 mb-4">Discussion ({comments.length})</h2>
      
      {/* Comment List */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <p className="text-earth-600 text-sm italic">No comments yet. Start the discussion!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-earth-200 pb-4 last:border-b-0">
              {/* Main Comment */}
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-8 h-8 bg-rust-light bg-opacity-20 rounded-full flex items-center justify-center text-rust font-medium text-sm">
                  {comment.author.displayName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-earth-900 text-sm">{comment.author.displayName}</span>
                    <span className="text-xs text-earth-600">{formatTimestamp(comment.createdAt)}</span>
                    
                    {/* Edit/Delete icons - only show for current user's comments */}
                    {comment.author.displayName === currentUserName && editingCommentId !== comment.id && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditComment(comment.id, comment.body)}
                          className="text-earth-600 hover:text-rust text-xs"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDeleteComment(comment.id)}
                          className="text-earth-600 hover:text-red-600 text-xs"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Edit mode for comment */}
                  {editingCommentId === comment.id ? (
                    <div className="mb-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none resize-none text-sm"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveCommentEdit(comment.id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-earth-700 text-sm mb-2">{comment.body}</p>
                      
                      {/* Reply button */}
                      <button
                        onClick={() => handleReply(comment.id)}
                        className="text-xs text-rust hover:text-rust-dark font-medium"
                      >
                        Reply
                      </button>
                    </>
                  )}

                  {/* Replies (one level deep only) */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-6 space-y-3 border-l-2 border-earth-200 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3 group">
                          <div className="flex-shrink-0 w-6 h-6 bg-rust-light bg-opacity-20 rounded-full flex items-center justify-center text-rust font-medium text-xs">
                            {reply.author.displayName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-earth-900 text-xs">{reply.author.displayName}</span>
                              <span className="text-xs text-earth-600">{formatTimestamp(reply.createdAt)}</span>
                              
                              {/* Edit/Delete for replies */}
                              {reply.author.displayName === currentUserName && editingReplyId !== `${comment.id}-${reply.id}` && (
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEditReply(comment.id, reply.id, reply.body)}
                                    className="text-earth-600 hover:text-rust text-xs"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => onDeleteReply(comment.id, reply.id)}
                                    className="text-earth-600 hover:text-red-600 text-xs"
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {/* Edit mode for reply */}
                            {editingReplyId === `${comment.id}-${reply.id}` ? (
                              <div className="mb-2">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none resize-none text-xs"
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleSaveReplyEdit(comment.id, reply.id)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setEditingReplyId(null);
                                      setEditText('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-earth-700 text-xs">{reply.body}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment */}
      <div className="border-t border-earth-200 pt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your thoughts..."
          rows={3}
          className="w-full px-4 py-3 border border-earth-300 rounded-lg focus:ring-2 focus:ring-rust focus:border-transparent outline-none resize-none text-sm"
        />
        <div className="flex justify-end mt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || addingComment}
            loading={addingComment}
          >
            Add Comment
          </Button>
        </div>
      </div>
    </div>
  );
}