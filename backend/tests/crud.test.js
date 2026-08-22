const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const Doc = require("../models/Doc.model");
const Project = require("../models/Project.model");
const Snippet = require("../models/Snippet.model");
const Note = require("../models/Note.model");
const Bookmark = require("../models/Bookmark.model");

describe("Core CRUD Integration Tests", () => {
  let authCookie;
  let testUser;

  jest.setTimeout(30000);

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // Ensure clean state
    await User.deleteMany({});
    await Doc.deleteMany({});
    await Project.deleteMany({});
    await Snippet.deleteMany({});
    await Note.deleteMany({});
    await Bookmark.deleteMany({});

    // Register test user
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "CRUD Tester",
        email: "crudtester@example.com",
        password: "Password123!",
      });

    testUser = await User.findOne({ email: "crudtester@example.com" });
    // Verify email directly
    testUser.isVerified = true;
    testUser.verificationToken = undefined;
    await testUser.save();

    // Login to get session cookie
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "crudtester@example.com",
        password: "Password123!",
      });

    authCookie = loginRes.headers["set-cookie"];
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Doc.deleteMany({});
    await Project.deleteMany({});
    await Snippet.deleteMany({});
    await Note.deleteMany({});
    await Bookmark.deleteMany({});
  });

  // --- DOCUMENTS ---
  describe("Documents CRUD & Pagination", () => {
    let createdDocId;

    test("POST /api/docs - creates a document", async () => {
      const res = await request(app)
        .post("/api/docs")
        .set("Cookie", authCookie)
        .send({
          title: "API Architecture Spec",
          category: "Backend",
          content: "# System Architecture\nDetails here.",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("API Architecture Spec");
      createdDocId = res.body.data._id;
    });

    test("GET /api/docs - returns paginated docs with metadata", async () => {
      const res = await request(app)
        .get("/api/docs?page=1&limit=10")
        .set("Cookie", authCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
      expect(res.body.meta.categories).toContain("Backend");
    });

    test("GET /api/docs with regex search sanitization", async () => {
      const res = await request(app)
        .get("/api/docs?search=Architecture+Spec[0-9]*")
        .set("Cookie", authCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test("PUT /api/docs/:id - updates doc and creates version snapshot", async () => {
      const res = await request(app)
        .put(`/api/docs/${createdDocId}`)
        .set("Cookie", authCookie)
        .send({
          title: "API Architecture Spec v2",
          content: "# System Architecture v2",
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("API Architecture Spec v2");

      const versionsRes = await request(app)
        .get(`/api/docs/${createdDocId}/versions`)
        .set("Cookie", authCookie)
        .expect(200);

      expect(versionsRes.body.data.length).toBeGreaterThanOrEqual(1);
    });

    test("DELETE /api/docs/:id - deletes doc", async () => {
      await request(app)
        .delete(`/api/docs/${createdDocId}`)
        .set("Cookie", authCookie)
        .expect(200);

      await request(app)
        .get(`/api/docs/${createdDocId}`)
        .set("Cookie", authCookie)
        .expect(404);
    });
  });

  // --- PROJECTS ---
  describe("Projects CRUD & Filters", () => {
    let projectId;

    test("POST /api/projects - creates a project", async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Cookie", authCookie)
        .send({
          title: "CI Pipeline Implementation",
          description: "Setup GitHub Actions workflow",
          status: "in-progress",
          priority: "high",
          labels: ["devops", "ci"],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      projectId = res.body.data._id;
    });

    test("GET /api/projects - paginated with status filter", async () => {
      const res = await request(app)
        .get("/api/projects?status=in-progress")
        .set("Cookie", authCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].priority).toBe("high");
    });

    test("DELETE /api/projects/:id - deletes project", async () => {
      await request(app)
        .delete(`/api/projects/${projectId}`)
        .set("Cookie", authCookie)
        .expect(200);
    });
  });

  // --- SNIPPETS ---
  describe("Snippets CRUD & Search", () => {
    let snippetId;

    test("POST /api/snippets - creates snippet", async () => {
      const res = await request(app)
        .post("/api/snippets")
        .set("Cookie", authCookie)
        .send({
          title: "escapeRegex utility",
          language: "javascript",
          code: "const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');",
          tags: ["security", "regex"],
          folder: "Utilities",
          isFavorite: true,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      snippetId = res.body.data._id;
    });

    test("GET /api/snippets - with favorite filter and folders", async () => {
      const res = await request(app)
        .get("/api/snippets?favorite=true")
        .set("Cookie", authCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.meta.folders).toContain("Utilities");
    });

    test("DELETE /api/snippets/:id - deletes snippet", async () => {
      await request(app)
        .delete(`/api/snippets/${snippetId}`)
        .set("Cookie", authCookie)
        .expect(200);
    });
  });

  // --- NOTES ---
  describe("Notes CRUD", () => {
    let noteId;

    test("POST /api/notes - creates a note", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set("Cookie", authCookie)
        .send({
          title: "Interview Prep Notes",
          content: "System Design and Security highlights",
          folder: "Career",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      noteId = res.body.data._id;
    });

    test("GET /api/notes - paginated list with folder metadata", async () => {
      const res = await request(app)
        .get("/api/notes")
        .set("Cookie", authCookie)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.meta.folders).toContain("Career");
    });

    test("DELETE /api/notes/:id - deletes note", async () => {
      await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Cookie", authCookie)
        .expect(200);
    });
  });
});
