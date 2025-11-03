import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";
import cors from "cors"; // <-- Make sure this is imported

const app = express();
const port = 8000; // <-- Backend port
const saltRounds = 10;

// PostgreSQL Database Connection
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

// --- Middleware Setup ---
app.use(cors()); // <-- Make sure this is present
app.use(express.json()); // <-- Make sure this is present
app.use(express.static("public"));

// --- API Routes ---

// GET /blogs (Get all posts)
app.get("/blogs", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT b.blog_id, b.title, b.body, b.date_created, u.name as author_name, b.creator_user_id FROM blogs b JOIN users u ON b.creator_user_id = u.user_id ORDER BY b.date_created DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error retrieving blogs." });
  }
});

// GET /blogs/:id (Get one post)
app.get('/blogs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch post." });
  }
});

// POST /login
app.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE user_id = $1", [userId]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      
      bcrypt.compare(password, storedPassword, (err, isMatch) => {
        if (err || !isMatch) {
          res.status(401).json({ error: "Invalid credentials." });
        } else {
          res.json({
            message: "Login successful",
            user: { user_id: user.user_id, name: user.name }
          });
        }
      });
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed." });
  }
});

// POST /signup
app.post("/signup", async (req, res) => {
  const { userId, name, password } = req.body;
  try {
    const checkUser = await db.query("SELECT * FROM users WHERE user_id = $1", [userId]);
    if (checkUser.rows.length > 0) {
      res.status(400).json({ error: "User ID already exists. Please choose another." });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Error hashing password." });
        }
        await db.query("INSERT INTO users (user_id, name, password) VALUES ($1, $2, $3)", [userId, name, hash]);
        res.status(201).json({ message: "User created successfully." });
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed." });
  }
});

// POST /blogs (Create new post)
app.post("/blogs", async (req, res) => {
  const { title, body, user_id } = req.body;
  
  if (!title || !body || !user_id) {
    return res.status(400).json({ error: "Title, body, and user_id are required." });
  }

  try {
    const result = await db.query(
      "INSERT INTO blogs (title, body, creator_user_id) VALUES ($1, $2, $3) RETURNING *", 
      [title, body, user_id]
    );
    
    const newPost = result.rows[0];
    const userResult = await db.query("SELECT name FROM users WHERE user_id = $1", [user_id]);
    
    const postWithAuthor = {
        ...newPost,
        author_name: userResult.rows[0].name
    };

    res.status(201).json(postWithAuthor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post." });
  }
});

// PUT /blogs/:id (Update post)
app.put('/blogs/:id', async (req, res) => {
  const postId = parseInt(req.params.id);
  const { title, body, user_id } = req.body; 

  try {
    const checkResult = await db.query("SELECT creator_user_id FROM blogs WHERE blog_id = $1", [postId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (checkResult.rows[0].creator_user_id === user_id) {
      await db.query("UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3", [title, body, postId]);
      res.json({ message: 'Post updated successfully' });
    } else {
      res.status(403).json({ error: "You are not authorized to update this post." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update post." });
  }
});

// DELETE /blogs/:id (Delete post)
app.delete('/blogs/:id', async (req, res) => {
  const postId = parseInt(req.params.id);
  const { user_id } = req.body; 

  if (!user_id) {
    return res.status(401).json({ error: "Authentication required." });
  }
  
  try {
    const checkResult = await db.query("SELECT creator_user_id FROM blogs WHERE blog_id = $1", [postId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (checkResult.rows[0].creator_user_id === user_id) {
      await db.query("DELETE FROM blogs WHERE blog_id = $1", [postId]);
      res.json({ message: 'Post deleted successfully' });
    } else {
      res.status(403).json({ error: "You are not authorized to delete this post." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete post." });
  }
});

// GET /profile/:user_id (Bonus challenge)
app.get('/profile/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const userQuery = "SELECT user_id, name FROM users WHERE user_id = $1";
        const postsQuery = "SELECT * FROM blogs WHERE creator_user_id = $1 ORDER BY date_created DESC";

        const userResult = await db.query(userQuery, [user_id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        const postsResult = await db.query(postsQuery, [user_id]);
        const profileData = userResult.rows[0];
        profileData.posts = postsResult.rows;

        res.json(profileData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load profile." });
    }
});


app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});