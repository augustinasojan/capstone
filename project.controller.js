const Project = require('../models/Project');
const Task = require('../models/Task');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const v = require('../utils/validate');

// Managers see projects they own. Members see projects that have tasks assigned to them.
exports.list = asyncHandler(async (req, res) => {
  let filter;
  if (req.user.role === 'manager') {
    filter = { owner: req.user._id };
  } else {
    const ids = await Task.distinct('project', { assignee: req.user._id });
    filter = { _id: { $in: ids } };
  }
  const projects = await Project.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ projects });
});

exports.create = asyncHandler(async (req, res) => {
  const project = await Project.create({
    title: v.str(req.body.title, 'Title', { required: true, min: 3, max: 100 }),
    description: v.str(req.body.description, 'Description', { max: 500 }) || '',
    targetDate: v.date(req.body.targetDate, 'Target date'),
    owner: req.user._id,
  });
  res.status(201).json({ project });
});

async function getOwned(id, user) {
  v.objectId(id, 'Project id', { required: true });
  const project = await Project.findOne({ _id: id, owner: user._id }); // ownership check on the server
  if (!project) throw new HttpError(404, 'Project not found');
  return project;
}

exports.update = asyncHandler(async (req, res) => {
  const project = await getOwned(req.params.id, req.user);
  const b = req.body;
  if ('title' in b) project.title = v.str(b.title, 'Title', { required: true, min: 3, max: 100 });
  if ('description' in b) project.description = v.str(b.description, 'Description', { max: 500 }) || '';
  if ('targetDate' in b) project.targetDate = v.date(b.targetDate, 'Target date');
  await project.save();
  res.json({ project });
});

exports.remove = asyncHandler(async (req, res) => {
  const project = await getOwned(req.params.id, req.user);
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: 'Project deleted' });
});
