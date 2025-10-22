import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, AppBar, Toolbar, Typography, Container, Paper, Box,
  CssBaseline, Divider, Button, ThemeProvider, IconButton
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import logo from './assets/logo.png';
import { lightTheme, darkTheme } from './theme';

import PlayerForm from './components/PlayerForm';
import ScoreCard from './components/ScoreCard';
import CourseSelector from './components/CourseSelector';
import SavedRounds from './components/SavedRounds';
import SignUp from './components/SignUp';
import Login from './components/Login';
import courses from './data/courses';

import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const [savedRounds, setSavedRounds] = useState([]);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [obPenalties, setObPenalties] = useState({});

  const [user, setUser] = useState(null);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // Monitor auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchRounds = async () => {
      if (user) {
        const q = query(collection(db, 'rounds'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const roundsFromFirestore = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedRounds(roundsFromFirestore);
      } else {
        const roundsFromLocal = JSON.parse(localStorage.getItem('fgScores4') || '[]');
        setSavedRounds(roundsFromLocal);
      }
    };

    fetchRounds();
  }, [user]);


  const addPlayer = (name) => {
    if (!selectedCourse) return;
    const holeCount = selectedCourse.par.length;
    setPlayers(prev => [...prev, name]);
    setScores(prev => ({ ...prev, [name]: Array(holeCount).fill("") }));
  };

  const updateScore = (player, holeIndex, newValue) => {
    setScores(prevScores => ({
      ...prevScores,
      [player]: prevScores[player].map((score, i) =>
        i === holeIndex ? newValue : score
      )
    }));
  };

  const updateOBPenalty = (player, index, action = 'increment') => {
    const key = `${player}-${index}`;
    setObPenalties(prev => {
      const current = prev[key] || 0;
      if (action === 'reset') {
        return { ...prev, [key]: 0 };
      }
      return { ...prev, [key]: current + 1 };
    });

    if (action === 'increment') {
      const currentScore = parseInt(scores[player]?.[index]) || 0;
      updateScore(player, index, currentScore + 1);
    } else if (action === 'reset') {
      const currentScore = parseInt(scores[player]?.[index]) || 0;
      const penalty = obPenalties[key] || 0;
      updateScore(player, index, Math.max(1, currentScore - penalty));
    }
  };

  const saveCurrentRound = async () => {
    if (!selectedCourse || players.length === 0) {
      alert("Please select a course and add players before saving.");
      return;
    }

    const date = new Date().toLocaleString();
    const simplifiedScores = {};

    players.forEach((player) => {
      simplifiedScores[player] = selectedCourse.par.map((parValue, index) => {
        const score = scores[player]?.[index];
        if (score === "" || isNaN(score)) return null;

        const key = `${player}-${index}`;
        const obCount = obPenalties[key] || 0;

        return {
          hole: index + 1,
          diffToPar: score - parValue,
          obCount,
        };
      }).filter(Boolean);
    });

    const roundData = {
      userId: user ? user.uid : null, // add userId for Firestore queries
      date,
      course: selectedCourse.name,
      par: selectedCourse.par,
      players,
      scores: simplifiedScores,
    };

    if (user) {
      try {
        await addDoc(collection(db, 'rounds'), roundData);
        // Refresh savedRounds after adding
        const q = query(collection(db, 'rounds'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const roundsFromFirestore = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedRounds(roundsFromFirestore);
        alert("Round saved to cloud!");
      } catch (err) {
        alert("Error saving to cloud: " + err.message);
      }
    } else {
      // Save locally
      const updatedRounds = [...savedRounds, roundData];
      setSavedRounds(updatedRounds);
      localStorage.setItem('fgScores4', JSON.stringify(updatedRounds));
      alert("Round saved locally!");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Box component="img" src={logo} alt="Logo" sx={{ height: 40, mr: 2 }} />
          <Typography variant="h6" component="div">
            Frisbeegolf tuloslaskuri
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* Sign up, Login, Logout button */}
          {user ? (
            <Button color="inherit" onClick={() => signOut(auth)}>
              Logout
            </Button>
          ) : (
            <>
              <Button color="inherit" onClick={() => setShowLogin(true)}>
                Login
              </Button>
              <Button color="inherit" onClick={() => setShowSignUp(true)}>
                Sign Up
              </Button>
            </>
          )}          
        </Toolbar>
      </AppBar>

      {/* Login Dialog */}
      <Dialog open={showLogin} onClose={() => setShowLogin(false)}>
        <DialogContent>
          <Login />
        </DialogContent>
      </Dialog>

      {/* Sign Up Dialog */}
      <Dialog open={showSignUp} onClose={() => setShowSignUp(false)}>
        <DialogContent>
          <SignUp />
        </DialogContent>
      </Dialog> 

      <Container maxWidth="80%" sx={{ mt: 4 }}>        
        <Paper elevation={3} sx={{ p: 3 }}>
          <CourseSelector courses={courses} setSelectedCourse={setSelectedCourse} />

          {selectedCourse && (
            <Box mt={3}>
              <Typography variant="body1" gutterBottom>
                Rata: {selectedCourse.name}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <PlayerForm addPlayer={addPlayer} />

              <Box mt={4}>
                <ScoreCard
                  players={players}
                  scores={scores}
                  updateScore={updateScore}
                  par={selectedCourse.par}
                  obPenalties={obPenalties}
                  updateOBPenalty={updateOBPenalty}
                />
                <Button variant="contained" color="primary" onClick={saveCurrentRound}>
                  💾 Tallenna
                </Button>
              </Box>
            </Box>
          )}

          <SavedRounds savedRounds={savedRounds} setSavedRounds={setSavedRounds} />
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
