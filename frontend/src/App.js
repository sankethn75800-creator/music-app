import React, { useState, useEffect, useRef } from 'react';
import Login from './Login';
import Register from './Register';
import './App.css';

function App() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [activeTab, setActiveTab] = useState('home');
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/songs')
      .then(res => res.json())
      .then(data => setSongs(data));
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetch(`http://localhost:5000/api/likes/${userEmail}`)
        .then(res => res.json())
        .then(data => setLikedSongs(data));
      fetch(`http://localhost:5000/api/playlists/${userEmail}`)
        .then(res => res.json())
        .then(data => setPlaylists(data));
    }
  }, [userEmail]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [currentSong]);

  const playSong = (song, index) => {
    setCurrentSong(song);
    setCurrentIndex(index);
    setIsPlaying(true);
    setProgress(0);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = song.url;
        audioRef.current.volume = volume;
        audioRef.current.play();
      }
    }, 100);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex], nextIndex);
  };

  const playPrev = () => {
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex], prevIndex);
  };

  const handleVolume = (e) => {
    const val = e.target.value;
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const handleProgress = (e) => {
    const val = e.target.value;
    setProgress(val);
    if (audioRef.current) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    }
  };

  const toggleLike = async (songId) => {
    const res = await fetch('http://localhost:5000/api/likes/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, songId })
    });
    const data = await res.json();
    setLikedSongs(data);
  };

  const createPlaylist = async () => {
    if (!newPlaylistName) return;
    const res = await fetch('http://localhost:5000/api/playlists/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, name: newPlaylistName })
    });
    const data = await res.json();
    setPlaylists(data);
    setNewPlaylistName('');
    setShowPlaylistModal(false);
  };

  const addToPlaylist = async (playlistId, songId) => {
    const res = await fetch('http://localhost:5000/api/playlists/add-song', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, playlistId, songId })
    });
    const data = await res.json();
    setPlaylists(data);
    setShowAddToPlaylist(null);
    alert('Song added to playlist!');
  };

  const deletePlaylist = async (playlistId) => {
    const res = await fetch(`http://localhost:5000/api/playlists/${userEmail}/${playlistId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    setPlaylists(data);
    setSelectedPlaylist(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    setUserEmail('');
    setLikedSongs([]);
    setPlaylists([]);
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(search.toLowerCase()) ||
    song.artist.toLowerCase().includes(search.toLowerCase())
  );

  const favouriteSongs = songs.filter(song => likedSongs.includes(song.id));

  const playlistSongs = selectedPlaylist
    ? songs.filter(song => selectedPlaylist.songs.includes(song.id))
    : [];

  const displaySongs = activeTab === 'library' ? favouriteSongs
    : selectedPlaylist ? playlistSongs
    : filteredSongs;

  if (showRegister) {
    return <Register onRegister={() => setShowRegister(false)} onBack={() => setShowRegister(false)} />;
  }

  if (!isLoggedIn) {
    return <Login onLogin={(name, email) => { setIsLoggedIn(true); setUserName(name); setUserEmail(email); }} onRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className="app-container">
      <audio ref={audioRef} onEnded={playNext} />

      {/* Create Playlist Modal */}
      {showPlaylistModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#1e1e1e', padding: '30px', borderRadius: '12px', width: '300px'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#1db954' }}>Create Playlist</h3>
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                border: 'none', backgroundColor: '#333', color: 'white',
                fontSize: '16px', marginBottom: '15px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={createPlaylist} style={{
                flex: 1, padding: '10px', backgroundColor: '#1db954',
                color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
              }}>Create</button>
              <button onClick={() => setShowPlaylistModal(false)} style={{
                flex: 1, padding: '10px', backgroundColor: '#333',
                color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {showAddToPlaylist && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#1e1e1e', padding: '30px', borderRadius: '12px', width: '300px'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#1db954' }}>Add to Playlist</h3>
            {playlists.length === 0 ? (
              <p style={{ color: '#aaa' }}>No playlists yet! Create one first.</p>
            ) : (
              playlists.map(playlist => (
                <div key={playlist.id} onClick={() => addToPlaylist(playlist.id, showAddToPlaylist)}
                  style={{
                    padding: '10px', backgroundColor: '#333', borderRadius: '8px',
                    marginBottom: '10px', cursor: 'pointer'
                  }}>
                  📋 {playlist.name}
                </div>
              ))
            )}
            <button onClick={() => setShowAddToPlaylist(null)} style={{
              width: '100%', padding: '10px', backgroundColor: '#444',
              color: 'white', border: 'none', borderRadius: '8px',
              cursor: 'pointer', marginTop: '10px'
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">🎵 MusicApp</div>
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'home' && !selectedPlaylist ? 'active' : ''}`}
            onClick={() => { setActiveTab('home'); setSelectedPlaylist(null); }}>
            🏠 Home
          </div>
          <div className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => { setActiveTab('search'); setSelectedPlaylist(null); }}>
            🔍 Search
          </div>
          <div className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => { setActiveTab('library'); setSelectedPlaylist(null); }}>
            ❤️ Favourites ({likedSongs.length})
          </div>

          {/* Playlists */}
          <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#aaa', fontSize: '13px' }}>PLAYLISTS</span>
              <button onClick={() => setShowPlaylistModal(true)} style={{
                background: '#1db954', color: 'white', border: 'none',
                borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '16px'
              }}>+</button>
            </div>
            {playlists.map(playlist => (
              <div key={playlist.id}
                className={`nav-item ${selectedPlaylist?.id === playlist.id ? 'active' : ''}`}
                onClick={() => setSelectedPlaylist(playlist)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>📋 {playlist.name}</span>
                <span onClick={e => { e.stopPropagation(); deletePlaylist(playlist.id); }}
                  style={{ color: '#aaa', fontSize: '12px', cursor: 'pointer' }}>✕</span>
              </div>
            ))}
          </div>
        </nav>
        <div className="sidebar-bottom">
          <div className="nav-item" onClick={handleLogout}>🚪 Logout</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search songs or artists..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="user-info">👤 {userName || 'User'}</div>
        </div>

        <div className="content-area">
          <h2 className="section-title">
            {selectedPlaylist ? `📋 ${selectedPlaylist.name}`
              : activeTab === 'home' ? '🎵 All Songs'
              : activeTab === 'search' ? '🔍 Search Results'
              : '❤️ Favourite Songs'}
          </h2>

          {activeTab === 'home' && !selectedPlaylist && (
            <div className="featured-banner">
              <div className="featured-text">
                <h2>Welcome Back, {userName}! 🎵</h2>
                <p>Listen to your favorite songs</p>
              </div>
            </div>
          )}

          <div className="songs-grid">
            {displaySongs.length === 0 ? (
              <p style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>
                {activeTab === 'library' ? 'No favourite songs yet! Like some songs ❤️'
                  : selectedPlaylist ? 'No songs in this playlist yet!'
                  : 'No songs found 😕'}
              </p>
            ) : (
              displaySongs.map((song, index) => (
                <div
                  key={song.id}
                  className={`song-card ${currentSong?.id === song.id ? 'active' : ''}`}
                  onClick={() => playSong(song, index)}
                >
                  <div className="song-thumbnail">
                    <img src={song.image} alt={song.title}
                      style={{width:'45px', height:'45px', borderRadius:'8px', objectFit:'cover'}}
                      onError={e => e.target.src='https://via.placeholder.com/45'}
                    />
                  </div>
                  <div className="song-info">
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                  </div>
                  <div className="song-duration">{song.duration}</div>
                  <button onClick={e => { e.stopPropagation(); toggleLike(song.id); }}
                    style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', marginRight: '5px' }}>
                    {likedSongs.includes(song.id) ? '❤️' : '🤍'}
                  </button>
                  <button onClick={e => { e.stopPropagation(); setShowAddToPlaylist(song.id); }}
                    style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#aaa' }}>
                    ➕
                  </button>
                  <div className="play-icon">
                    {currentSong?.id === song.id && isPlaying ? '⏸' : '▶'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Player */}
      {currentSong && (
        <div className="player-bar">
          <div className="player-song-info">
            <div className="player-thumbnail">
              <img src={currentSong.image} alt={currentSong.title}
                style={{width:'45px', height:'45px', borderRadius:'8px', objectFit:'cover'}}
                onError={e => e.target.src='https://via.placeholder.com/45'}
              />
            </div>
            <div>
              <h4>{currentSong.title}</h4>
              <p>{currentSong.artist}</p>
            </div>
            <button onClick={() => toggleLike(currentSong.id)}
              style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', marginLeft: '10px' }}>
              {likedSongs.includes(currentSong.id) ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="player-controls">
            <button onClick={playPrev}>⏮</button>
            <button className="play-btn" onClick={togglePlay}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={playNext}>⏭</button>
            <div className="progress-bar">
              <input type="range" min="0" max="100" value={progress} onChange={handleProgress} />
            </div>
          </div>

          <div className="volume-control">
            🔊
            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolume} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;