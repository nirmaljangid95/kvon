const Activity = require('../models/Activity');
const Project = require('../models/Project');

const getActivities = async (req, res) => {
  try {
    const { projectId, limit = 20 } = req.query;

    let query = {};

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      if (project.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view activities for this project' });
      }
      query.projectId = projectId;
    } else {
      const userProjects = await Project.find({ createdBy: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.projectId = { $in: projectIds };
    }

    const activities = await Activity.find(query)
      .populate('userId', 'name email')
      .populate('issueId', 'title')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActivities };
