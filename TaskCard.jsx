const ORDER = ['todo', 'in_progress', 'review', 'done'];
const LABELS = { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' };

export default function TaskCard({ task, busy, canDelete, onMove, onDelete }) {
  const index = ORDER.indexOf(task.status);
  const prev = ORDER[index - 1];
  const next = ORDER[index + 1];

  return (
    <article className="task" aria-busy={busy}>
      <div className="task-top">
        <h3>{task.title}</h3>
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
      </div>
      {task.description && <p>{task.description}</p>}
      <p className="muted">
        {task.project?.title}
        {task.assignee ? ` · ${task.assignee.name}` : ' · Unassigned'}
        {task.dueDate ? ` · Due ${new Date(task.dueDate).toLocaleDateString()}` : ''}
      </p>
      <div className="task-actions">
        {prev && (
          <button type="button" className="btn btn-small btn-ghost" disabled={busy} onClick={() => onMove(task, prev)}>
            ← {LABELS[prev]}
          </button>
        )}
        {next && (
          <button type="button" className="btn btn-small" disabled={busy} onClick={() => onMove(task, next)}>
            Move to {LABELS[next]} →
          </button>
        )}
        {canDelete && (
          <button type="button" className="btn btn-small btn-danger" disabled={busy} onClick={() => onDelete(task)}>
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
