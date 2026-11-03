const Project = require('../models/Project');
const Issue = require('../models/Issue');

const getDashboardStats = async (req, res) => {
  try {
    const userProjects = await Project.find({ createdBy: req.user._id }).select('_id');
    const projectIds = userProjects.map(p => p._id);
    const totalProjects = userProjects.length;

    const allIssues = await Issue.find({ projectId: { $in: projectIds } });

    const totalIssues = allIssues.length;
    const openIssues = allIssues.filter(issue => issue.status === 'To Do').length;
    const inProgressIssues = allIssues.filter(issue => issue.status === 'In Progress').length;
    const completedIssues = allIssues.filter(issue => issue.status === 'Done').length;
    const highPriorityIssues = allIssues.filter(issue => issue.priority === 'High').length;

    res.json({
      totalProjects,
      totalIssues,
      openIssues,
      inProgressIssues,
      completedIssues,
      highPriorityIssues
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
