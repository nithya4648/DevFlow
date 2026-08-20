const Project = require("../models/Project.model");
const Snippet = require("../models/Snippet.model");
const Doc = require("../models/Doc.model");
const Note = require("../models/Note.model");
const Bookmark = require("../models/Bookmark.model");
const Activity = require("../models/Activity.model");
const ToolUsage = require("../models/ToolUsage.model");
const mongoose = require("mongoose");

// @desc    Get dashboard analytics overview
// @route   GET /api/analytics/overview
// @access  Private
const getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // For Activity, we assume we want activities related to the user.
    // If the Activity model tracks 'user', we can query by 'user: userId'.

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalProjects,
      totalSnippets,
      totalDocs,
      totalNotes,
      totalBookmarks,
      projectsByStatus,
      snippetsByLanguage,
      weeklyActivity,
      topTools
    ] = await Promise.all([
      Project.countDocuments({ owner: userId }),
      Snippet.countDocuments({ owner: userId }),
      Doc.countDocuments({ owner: userId }),
      Note.countDocuments({ owner: userId }),
      Bookmark.countDocuments({ owner: userId }),
      
      // Projects by status
      Project.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      
      // Snippets by language
      Snippet.aggregate([
        { $match: { owner: userId } },
        { $group: { _id: "$language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Weekly activity count (last 7 days)
      Activity.aggregate([
        { 
          $match: { 
            user: userId,
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Most used dev tools
      ToolUsage.aggregate([
        { $match: { user: userId } },
        { $group: { _id: "$tool", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Format weekly activity to ensure all 7 days are present even if 0
    const formattedWeeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = weeklyActivity.find(a => a._id === dateStr);
      formattedWeeklyActivity.push({
        date: dateStr,
        count: found ? found.count : 0
      });
    }

    res.status(200).json({
      success: true,
      totals: {
        projects: totalProjects,
        snippets: totalSnippets,
        docs: totalDocs,
        notes: totalNotes,
        bookmarks: totalBookmarks
      },
      projectsByStatus,
      snippetsByLanguage,
      weeklyActivity: formattedWeeklyActivity,
      topTools
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log tool usage
// @route   POST /api/analytics/tool-usage
// @access  Private
const logToolUsage = async (req, res, next) => {
  try {
    const { tool } = req.body;
    if (!tool) {
      const error = new Error("Tool name is required");
      error.statusCode = 400;
      return next(error);
    }

    await ToolUsage.create({
      tool,
      user: req.user._id
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily activity counts for the last N days (GitHub-style contribution calendar)
// @route   GET /api/analytics/contributions?days=365
// @access  Private
const getContributions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = Math.min(parseInt(req.query.days, 10) || 365, 365);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const raw = await Activity.aggregate([
      { $match: { user: userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);

    const countByDate = raw.reduce((acc, r) => {
      acc[r._id] = r.count;
      return acc;
    }, {});

    const contributions = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      contributions.push({ date: dateStr, count: countByDate[dateStr] || 0 });
    }

    res.status(200).json({ success: true, contributions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  logToolUsage,
  getContributions,
};
