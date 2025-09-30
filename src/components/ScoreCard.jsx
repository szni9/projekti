import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import ScoreRow from './ScoreRow';

function ScoreCard({ players, scores, updateScore, par, obPenalties, updateOBPenalty }) {
  const frontNine = par.slice(0, 9);
  const backNine = par.slice(9, 18);
  const extraHoles = par.slice(18);
  const hasBackNine = backNine.length > 0;
  const hasExtra = extraHoles.length > 0;
  
  return (
    <Box>
      {/* Front 9 */}
      <Typography variant="body1" gutterBottom>
        Tuloskortti (F9)
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3, overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>V</TableCell>
              {frontNine.map((_, i) => (
                <TableCell key={i} align="center">{`#${i + 1}`}</TableCell>
              ))}
              <TableCell align="center"><strong>F9</strong></TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Par</strong></TableCell>
              {frontNine.map((p, i) => (
                <TableCell key={i} align="center">{p}</TableCell>
              ))}
              <TableCell align="center">
                <strong>{frontNine.reduce((a, b) => a + b, 0)}</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
              <ScoreRow
                key={player + '-front'}
                player={player}
                scores={scores[player]}
                updateScore={(p, i, v) => updateScore(p, i, v)}
                par={frontNine}
                offset={0}
                obPenalties={obPenalties}
                updateOBPenalty={updateOBPenalty}
                
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Back 9 */}
      {hasBackNine && (
        <>
          <Divider />
          <Typography variant="body1" gutterBottom>
            Tuloskortti (B9)
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>V</TableCell>
                  {backNine.map((_, i) => (
                    <TableCell key={i} align="center" sx={{ p: 0 }}>{`#${i + 10}`}</TableCell>
                  ))}
                  <TableCell align="center"><strong>B9</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Par</strong></TableCell>
                  {backNine.map((p, i) => (
                    <TableCell key={i} align="center">{p}</TableCell>
                  ))}
                  <TableCell align="center">
                    <strong>{backNine.reduce((a, b) => a + b, 0)}</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map((player) => (
                  <ScoreRow
                    key={player + '-back'}
                    player={player}
                    scores={scores[player]}
                    updateScore={updateScore}
                    par={backNine}
                    offset={9}
                    obPenalties={obPenalties}
                    updateOBPenalty={updateOBPenalty}
                  />

                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {/* Extra */}
      {hasExtra && (
        <>
          <Divider />
          <Typography variant="body1" gutterBottom>
            Tuloskortti (Extra)
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Väylä</TableCell>
                  {extraHoles.map((_, i) => (
                    <TableCell key={i} align="center" sx={{ p: 0 }}>{`#${i + 19}`}</TableCell>
                  ))}
                  <TableCell align="center"><strong>Extra</strong></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Par</strong></TableCell>
                  {extraHoles.map((p, i) => (
                    <TableCell key={i} align="center">{p}</TableCell>
                  ))}
                  <TableCell align="center">
                    <strong>{extraHoles.reduce((a, b) => a + b, 0)}</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map((player) => (
                  <ScoreRow
                    key={player + '-extra'}
                    player={player}
                    scores={scores[player]}
                    updateScore={updateScore}
                    par={extraHoles}
                    offset={18}
                    obPenalties={obPenalties}
                    updateOBPenalty={updateOBPenalty}
                  />

                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

          {/* Total Summary */}
          <Box mt={4}>
            <Typography variant="body1" gutterBottom>
              Total Score Summary
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Pelaaja</TableCell>                    
                    <TableCell align="center"><strong>Total Par</strong></TableCell>
                    <TableCell align="center"><strong>Heittoja yht.</strong></TableCell>
                    <TableCell align="center"><strong>Tulos</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {players.map((player) => {
                    const totalScore = scores[player].reduce((a, b) => a + (parseInt(b) || 0), 0);
                    const totalPar = par.reduce((a, b) => a + b, 0);

                    const vsPar = scores[player].reduce((sum, val, i) => {
                    const num = parseInt(val);
                    return !isNaN(num) ? sum + (num - par[i]) : sum;
                    }, 0);

                    const vsParDisplay = vsPar === 0 ? '0' : vsPar > 0 ? `+${vsPar}` : vsPar;

                    let color = 'text.secondary';
                    if (vsPar > 0) color = 'text.primary';
                    else if (vsPar < 0) color = 'text.primary';

                    return (
                      <TableRow key={player + '-total'}>
                        <TableCell>{player}</TableCell>
                        <TableCell align="center">{totalPar}</TableCell>
                        <TableCell align="center">{totalScore}</TableCell>
                        <TableCell align="center">
                          <Typography color={color} fontWeight="bold">
                            {vsParDisplay}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        
      
    </Box>
  );
}

export default ScoreCard;
