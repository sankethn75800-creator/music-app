const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Music App Backend is running!');
});

const songs = [
  { 
    id: 1, 
    title: "Aaya Sher", 
    artist: "Anirudh Ravichander", 
    duration: "3:45",
    url: "https://res.cloudinary.com/dtitbzklp/video/upload/aaya_yxzz5p.mp3",
    image: "https://res.cloudinary.com/dtitbzklp/image/upload/aaya_vzjx90.jpg"
  },
  { 
    id: 2, 
    title: "Are Bommale", 
    artist: "Rzee", 
    duration: "4:20",
    url: "https://res.cloudinary.com/dtitbzklp/video/upload/bommale_wubwyi.mp3",
    image: "https://res.cloudinary.com/dtitbzklp/image/upload/bommale_rxuaul.jpg"
  },
  { 
    id: 3, 
    title: "Paravashanadenu", 
    artist: "Puneeth Rajkumar", 
    duration: "2:55",
    url: "https://res.cloudinary.com/dtitbzklp/video/upload/paravasha_nu2dsn.mp3",
    image: "https://res.cloudinary.com/dtitbzklp/image/upload/paravasha_gqwyud.jpg"
  },
];

app.get('/api/songs', (req, res) => {
  res.json(songs);
});

// Liked songs
const likesFile = path.join(__dirname, 'likes.json');
const getLikes = () => {
  if (!fs.existsSync(likesFile)) return {};
  return JSON.parse(fs.readFileSync(likesFile, 'utf8'));
};
const saveLikes = (likes) => {
  fs.writeFileSync(likesFile, JSON.stringify(likes, null, 2));
};

app.get('/api/likes/:email', (req, res) => {
  const likes = getLikes();
  res.json(likes[req.params.email] || []);
});

app.post('/api/likes/toggle', (req, res) => {
  const { email, songId } = req.body;
  const likes = getLikes();
  if (!likes[email]) likes[email] = [];
  const index = likes[email].indexOf(songId);
  if (index === -1) {
    likes[email].push(songId);
  } else {
    likes[email].splice(index, 1);
  }
  saveLikes(likes);
  res.json(likes[email]);
});

// Playlists
const playlistsFile = path.join(__dirname, 'playlists.json');
const getPlaylists = () => {
  if (!fs.existsSync(playlistsFile)) return {};
  return JSON.parse(fs.readFileSync(playlistsFile, 'utf8'));
};
const savePlaylists = (playlists) => {
  fs.writeFileSync(playlistsFile, JSON.stringify(playlists, null, 2));
};

app.get('/api/playlists/:email', (req, res) => {
  const playlists = getPlaylists();
  res.json(playlists[req.params.email] || []);
});

app.post('/api/playlists/create', (req, res) => {
  const { email, name } = req.body;
  const playlists = getPlaylists();
  if (!playlists[email]) playlists[email] = [];
  const newPlaylist = { id: Date.now(), name, songs: [] };
  playlists[email].push(newPlaylist);
  savePlaylists(playlists);
  res.json(playlists[email]);
});

app.post('/api/playlists/add-song', (req, res) => {
  const { email, playlistId, songId } = req.body;
  const playlists = getPlaylists();
  if (!playlists[email]) return res.status(404).json({ message: 'No playlists found' });
  const playlist = playlists[email].find(p => p.id === playlistId);
  if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
  if (!playlist.songs.includes(songId)) {
    playlist.songs.push(songId);
  }
  savePlaylists(playlists);
  res.json(playlists[email]);
});

app.delete('/api/playlists/:email/:playlistId', (req, res) => {
  const { email, playlistId } = req.params;
  const playlists = getPlaylists();
  if (!playlists[email]) return res.status(404).json({ message: 'No playlists found' });
  playlists[email] = playlists[email].filter(p => p.id !== parseInt(playlistId));
  savePlaylists(playlists);
  res.json(playlists[email]);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('MongoDB connection failed:', err.message);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without database)`);
    });
  });