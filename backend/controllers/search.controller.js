// backend/controllers/search.controller.js
const Project = require("../models/Project.model");
const Snippet = require("../models/Snippet.model");
const Doc = require("../models/Doc.model");
const Note = require("../models/Note.model");
const Bookmark = require("../models/Bookmark.model");
const Team = require("../models/Team.model");

const LIMIT_PER_TYPE = 5;

// Build a query that matches user-owned OR team-shared items
async function ownerOrTeamFilter(userId) {
  // Find all teams the user belongs to
  const teams = await Team.find({ "members.user": userId }).select("_id").lean();
  const teamIds = teams.map((t) => t._id);
  return {
    $or: [
      { owner: userId },
      ...(teamIds.length ? [{ teamId: { $in: teamIds } }] : []),
    ],
  };
}

// Truncate long text to a short preview
function excerpt(text, len = 120) {
  if (!text) return "";
  const clean = text.replace(/[#*`>\-_]/g, "").trim();
  return clean.length > len ? clean.slice(0, len) + "…" : clean;
}

// @route   GET /api/search?q=&type=
// @access  Private
const globalSearch = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const type = (req.query.type || "all").toLowerCase();

    if (!q || q.length < 2) {
      return res.json({ success: true, results: {}, total: 0 });
    }

    const userId = req.user._id;
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const accessFilter = await ownerOrTeamFilter(userId);

    const results = {};
    let total = 0;

    const runSearch = async (name, Model, buildQuery, buildResult) => {
      if (type !== "all" && type !== name) return;
      const docs = await Model.find({
        ...accessFilter,
        ...buildQuery(regex),
      })
        .limit(LIMIT_PER_TYPE)
        .lean();
      results[name] = docs.map(buildResult);
      total += results[name].length;
    };

    await Promise.all([
      runSearch(
        "projects",
        Project,
        (rx) => ({ $or: [{ title: rx }, { description: rx }] }),
        (p) => ({
          id: p._id,
          type: "project",
          title: p.title,
          preview: excerpt(p.description),
          meta: p.status,
          path: "/projects",
        })
      ),
      runSearch(
        "snippets",
        Snippet,
        (rx) => ({ $or: [{ title: rx }, { description: rx }, { code: rx }] }),
        (s) => ({
          id: s._id,
          type: "snippet",
          title: s.title,
          preview: excerpt(s.description || s.code),
          meta: s.language,
          path: "/snippets",
        })
      ),
      runSearch(
        "docs",
        Doc,
        (rx) => ({ $or: [{ title: rx }, { content: rx }] }),
        (d) => ({
          id: d._id,
          type: "doc",
          title: d.title,
          preview: excerpt(d.content),
          meta: d.category,
          path: "/docs",
        })
      ),
      runSearch(
        "notes",
        Note,
        (rx) => ({ $or: [{ title: rx }, { content: rx }] }),
        (n) => ({
          id: n._id,
          type: "note",
          title: n.title,
          preview: excerpt(n.content),
          meta: n.folder,
          path: "/notes",
        })
      ),
      runSearch(
        "bookmarks",
        Bookmark,
        (rx) => ({ $or: [{ title: rx }, { url: rx }, { notes: rx }] }),
        (b) => ({
          id: b._id,
          type: "bookmark",
          title: b.title,
          preview: b.url,
          meta: b.category,
          path: "/bookmarks",
        })
      ),
    ]);

    res.json({ success: true, q, results, total });
  } catch (err) {
    next(err);
  }
};

module.exports = { globalSearch };
