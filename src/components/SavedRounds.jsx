import React, { useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableBody, TableRow,
  TableCell, Paper, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Collapse, Divider, IconButton
} from '@mui/material';
import { ExpandMore, ExpandLess, Delete } from '@mui/icons-material';

import { db, auth } from '../firebase';
import { deleteDoc, doc } from 'firebase/firestore';

function formatDiff(num) {
  const rounded = parseFloat(num);
  const isNegative = rounded < 0;
  const abs = Math.abs(rounded);
  const display = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(1);
  return isNegative ? `-${display}` : `+${display}`;
}

function SavedRounds({ savedRounds, setSavedRounds }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState([]);
  const [expandedDates, setExpandedDates] = useState([]);


  const user = auth.currentUser;

  const roundsByCourse = savedRounds.reduce((acc, round, idx) => {
    if (!acc[round.course]) acc[round.course] = [];
    acc[round.course].push({ ...round, originalIndex: idx });
    return acc;
  }, {});

  const toggleCourseExpanded = (course) => {
    setExpandedCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course]
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const { id, originalIndex } = deleteTarget;

    const updatedRounds = savedRounds.filter((_, idx) => idx !== originalIndex);
    setSavedRounds(updatedRounds);

    if (user && id) {
      // Delete from Firestore
      try {
        await deleteDoc(doc(db, 'rounds', id));
        console.log('Deleted from Firestore:', id);
      } catch (error) {
        console.error('Error deleting from Firestore:', error);
        alert('Failed to delete from cloud.');
      }
    } else {
      // Delete from localStorage
      localStorage.setItem('fgScores4', JSON.stringify(updatedRounds));
    }

    setDeleteTarget(null);
  };

  const cancelDelete = () => setDeleteTarget(null);

  if (!savedRounds.length) {
    return (
      <Box mt={2}>
        <Typography variant="body2">No saved rounds yet.</Typography>
      </Box>
    );
  }

  return (
    <Box mt={2}>
      <Typography variant="body1" gutterBottom>
        Saved Rounds
      </Typography>

      {Object.entries(roundsByCourse).map(([course, rounds]) => {
        const isExpanded = expandedCourses.includes(course);
        const holeCount = rounds[0]?.scores[rounds[0].players[0]]?.length || 0;
        const holes = rounds[0]?.scores[rounds[0].players[0]]?.map((s) => s.hole) || [];
        const pars = rounds[0]?.par || [];

        const totalScores = [];
        const holeAverages = Array(holeCount).fill(0);
        const holeCounts = Array(holeCount).fill(0);

        rounds.forEach(round => {
          round.players.forEach(player => {
            const diffs = round.scores[player];
            const total = diffs.reduce((sum, s) => sum + s.diffToPar, 0);
            totalScores.push(total);
            diffs.forEach((s, i) => {
              holeAverages[i] += s.diffToPar;
              holeCounts[i]++;
            });
          });
        });

        const averageTotalScore = (
          totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length
        ).toFixed(1);

        const averagePerHole = holeAverages.map((sum, i) =>
          (sum / holeCounts[i]).toFixed(1)
        );

        return (
          <Paper key={course} sx={{ mb: 2, p: 1, overflowX: 'auto', borderRadius: 1 }} elevation={1}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => toggleCourseExpanded(course)}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{course}</Typography>
              <IconButton size="small" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
                {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </IconButton>
            </Box>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 0.5 }} />

              <Table size="small" sx={{ '& td, & th': { py: 0.1, px: 0.3 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.75rem' }}>v</TableCell>
                    {holes.map((hole) => (
                      <TableCell
                        key={hole}
                        align="center"
                        sx={{
                          fontSize: '0.9rem',
                          color: 'text.secondary',
                          borderRight: '1px solid grey',
                        }}
                      >
                        {hole}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontSize: '0.75rem' }}>
                      <strong>total</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                      Par
                    </TableCell>
                    {pars.map((par, i) => (
                      <TableCell
                        key={i}
                        align="center"
                        sx={{
                          fontSize: '0.9rem',
                          color: 'text.secondary',
                          borderRight: '1px solid grey',
                        }}
                      >
                        {par}
                      </TableCell>
                    ))}
                    <TableCell />
                  </TableRow>
                                    
                  {rounds.map((round, idx) => (
                    <React.Fragment key={idx}>
                      {round.players.map((player) => {
                        const diffs = round.scores[player];
                        const total = diffs.reduce((sum, s) => sum + s.diffToPar, 0);

                        return (
                          <TableRow key={`${round.date}-${player}`}>
                            <TableCell sx={{ fontSize: '0.75rem' }}>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                  onClick={() =>
                                    setExpandedDates((prev) =>
                                      prev.includes(round.date)
                                        ? prev.filter((d) => d !== round.date)
                                        : [...prev, round.date]
                                    )
                                  }
                                >
                                  {player}
                                </Typography>
                                {expandedDates.includes(round.date) && (
                                  <Typography variant="caption" color="text.secondary">
                                    {round.date}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>

                            {diffs.map(({ hole, diffToPar, obCount }) => (
                              <TableCell
                                key={hole}
                                align="center"
                                sx={{
                                  width: '40px',
                                  borderRight: '1px solid white',
                                  backgroundColor:
                                    diffToPar === -2
                                      ? '#1976d2'
                                      : diffToPar > 0
                                        ? 'error.light'
                                        : diffToPar < 0
                                          ? 'success.main'
                                          : '#979797d5',
                                }}
                              >
                                <Typography variant="body1" sx={{ lineHeight: 1 }}>
                                  {obCount >= 1
                                    ? `(${diffToPar > 0 ? `+${diffToPar}` : diffToPar})${obCount}`
                                    : diffToPar > 0
                                      ? `+${diffToPar}`
                                      : diffToPar}
                                </Typography>
                              </TableCell>
                            ))}

                            {/* Total column */}
                            <TableCell align="center">
                              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                <strong>{total > 0 ? `+${total}` : total}</strong>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteTarget(round)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))}


                  <TableRow>
                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Avg</TableCell>
                    {averagePerHole.map((avg, i) => (
                      <TableCell
                        key={i}
                        align="center"
                        sx={{
                          fontSize: '0.75rem',
                          borderRight: '1px solid grey',                          
                        }}
                      >
                        {avg === 0 ? '0' : formatDiff(avg)}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontSize: '0.8rem' }}>
                      <strong>
                        {averageTotalScore > 0 ? `+${averageTotalScore}` : averageTotalScore}
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Collapse>
          </Paper>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onClose={cancelDelete} fullWidth maxWidth="xs">
        <DialogTitle>Delete Round?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Haluatko varmasti poistaa kierroksen?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary" size="small">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" size="small">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SavedRounds;
