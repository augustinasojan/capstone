const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const v = require('../utils/validate');

const { STATUSES, PRIORITIES } = Task;
const populateTask = (q) => q.populate('assignee', 'name email').populate('project', 'title');
const same = (a, b) => String(a) === String(b);

async function checkAssignee(id) {
  if (!id) return null;
  const user = await User.findById(id);
  if (!user || user.role !== 'member') throw new HttpError(400, 'Assignee must be an existing team member');
  return user._id;
}

// Managers see tasks in their own projects. Members see only tasks assigned to them.
exports.list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 200);
  const projectId = v.objectId(req.query.projectId, 'projectId');

  const filter = {};
  if (req.user.role === 'manager') {
    const ids = await Project.distinct('_id', { owner: req.user._id });
    if (projectId && !ids.some((id) => same(id, projectId))) throw new HttpError(404, 'Project not found');
    filter.project = projectId || { $in: ids };
  } else {
    filter.assignee = req.user._id;
    if (projectId) filter.project = projectId;
  }

  const [data, total] = await Promise.all([
    populateTask(Task.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)),
    Task.countDocuments(filter),
  ]);
  res.json({ data, page, limit, total });
});

exports.create = asyncHandler(async (req, res) => {
  const b = req.body;
  const projectId = v.objectId(b.projectId, 'Project', { required: true });
  const project = await Project.findOne({ _id: projectId, owner: req.user._id });
  if (!project) throw new HttpError(404, 'Project not found');

  const task = await Task.create({
    title: v.str(b.title, 'Title', { required: true, min: 3, max: 120 }),
    description: v.str(b.description, 'Description', { max: 1000 }) || '',
    priority: v.oneOf(b.priority, 'Priority', PRIORITIES) || 'medium',
    dueDate: v.date(b.dueDate, 'Due date'),
    assignee: await checkAssignee(v.objectId(b.assigneeId, 'Assignee')),
    project: project._id,
    createdBy: req.user._id,
  });
  res.status(201).json({ task: await populateTask(Task.findById(task._id)) });
});

exports.update = asyncHandler(async (req, res) => {
  v.objectId(req.params.id, 'Task id', { required: true });
  const task = await Task.findById(req.params.id);
  if (!task) throw new HttpError(404, 'Task not found');
  const project = await Project.findById(task.project);
  const b = req.body;

  const isOwner = req.user.role === 'manager' && project && same(project.owner, req.user._id);
  const isAssignee = task.assignee && same(task.assignee, req.user._id);
  if (!isOwner && !isAssignee) throw new HttpError(404, 'Task not found'); // do not reveal other users' tasks

  if (isOwner) {
    if ('title' in b) task.title = v.str(b.title, 'Title', { required: true, min: 3, max: 120 });
    if ('description' in b) task.description = v.str(b.description, 'Description', { max: 1000 }) || '';
    if ('priority' in b) task.priority = v.oneOf(b.priority, 'Priority', PRIORITIES, { required: true });
    if ('dueDate' in b) task.dueDate = v.date(b.dueDate, 'Due date');
    if ('assigneeId' in b) task.assignee = await checkAssignee(v.objectId(b.assigneeId, 'Assignee'));
  } else if (Object.keys(b).some((k) => k !== 'status')) {
    throw new HttpError(403, 'Team members can only change the status of their tasks');
  }
  if ('status' in b) task.status = v.oneOf(b.status, 'Status', STATUSES, { required: true });

  await task.save();
  res.json({ task: await populateTask(Task.findById(task._id)) });
});

exports.remove = asyncHandler(async (req, res) => {
  v.objectId(req.params.id, 'Task id', { required: true });
  const task = await Task.findById(req.params.id);
  const project = task && (await Project.findById(task.project));
  if (!task || !project || !same(project.owner, req.user._id)) throw new HttpError(404, 'Task not found');
  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});
