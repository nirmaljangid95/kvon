const Issue = require('../models/Issue');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

const logActivity = async (userId, issueId, projectId, action) => {
  try {
    await Activity.create({
      userId,
      issueId,
      projectId,
      action
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

const getIssues = async (req, res) => {
  try {
    const { status, priority, projectId, page = 1, limit = 50 } = req.query;

    const userProjects = await Project.find({ createdBy: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    let query = { projectId: { $in: projectIds } };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (projectId) {
      if (!projectIds.some(id => id.toString() === projectId)) {
        return res.status(403).json({ message: 'Not authorized to access issues from this project' });
      }
      query.projectId = projectId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const issues = await Issue.find(query)
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Issue.countDocuments(query);

    res.json({
      issues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('projectId', 'name createdBy');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.projectId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this issue' });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createIssue = async (req, res) => {
  try {
    const { title, description, status, priority, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add issues to this project' });
    }

    const issue = await Issue.create({
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      projectId,
      createdBy: req.user._id
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('createdBy', 'name email')
      .populate('projectId', 'name');

    await logActivity(
      req.user._id,
      issue._id,
      projectId,
      `${req.user.name} created issue "${title}"`
    );

    if (global.io) {
      global.io.to(`project-${projectId}`).emit('issue-created', populatedIssue);
    }

    res.status(201).json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('projectId');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (issue.projectId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this issue' });
    }

    const { title, description, status, priority } = req.body;
    const oldStatus = issue.status;
    const newStatus = status || issue.status;

    issue.title = title || issue.title;
    issue.description = description !== undefined ? description : issue.description;
    issue.status = newStatus;
    issue.priority = priority || issue.priority;

    const updatedIssue = await issue.save();
    const populatedIssue = await Issue.findById(updatedIssue._id)
      .populate('createdBy', 'name email')
      .populate('projectId', 'name');

    if (oldStatus !== newStatus) {
      await logActivity(
        req.user._id,
        issue._id,
        issue.projectId._id,
        `${req.user.name} changed issue status from "${oldStatus}" to "${newStatus}"`
      );
    } else {
      await logActivity(
        req.user._id,
        issue._id,
        issue.projectId._id,
        `${req.user.name} updated issue "${issue.title}"`
      );
    }

    if (global.io) {
      global.io.to(`project-${issue.projectId._id}`).emit('issue-updated', populatedIssue);
    }

    res.json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('projectId');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

  
    if (issue.projectId.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }

    const projectId = issue.projectId._id;
    const issueId = issue._id;

    await issue.deleteOne();
    if (global.io) {
      global.io.to(`project-${projectId}`).emit('issue-deleted', { _id: issueId });
    }

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchIssues = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({ issues: [] });
    }


    const userProjects = await Project.find({ createdBy: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const issues = await Issue.find({
      projectId: { $in: projectIds },
      title: { $regex: q, $options: 'i' }
    })
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ issues });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const userProjects = await Project.find({ createdBy: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const issues = await Issue.find({ projectId: { $in: projectIds } })
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIssues,
  getAllIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  searchIssues
};
