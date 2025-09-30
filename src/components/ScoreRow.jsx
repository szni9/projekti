import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Box,
  Button,
} from '@mui/material';

function ScoreRow({
  player,
  scores,
  updateScore,
  par,
  offset = 0,
  obPenalties = [],
  updateOBPenalty,
}) {
  const [longPressIndex, setLongPressIndex] = useState(null);
  const [longPressTimeout, setLongPressTimeout] = useState(null);

  // Total score and vsPar calculation
  const total = par.reduce((sum, _, i) => {
    const num = parseInt(scores[offset + i]);
    return !isNaN(num) ? sum + num : sum;
  }, 0);

  const vsPar = par.reduce((sum, holePar, i) => {
    const score = scores[offset + i];
    const num = parseInt(score);
    return !isNaN(num) ? sum + (num - holePar) : sum;
  }, 0);

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        <Typography fontWeight="bold">{player}</Typography>
      </TableCell>

      {par.map((holePar, i) => {
        const actualIndex = i + offset;
        const score = scores[actualIndex] ?? '';
        const numericScore = parseInt(score);
        const isValid = !isNaN(numericScore);
        const diff = isValid ? numericScore - holePar : null;
        const diffDisplay = diff === 0 ? 'Par' : diff > 0 ? `+${diff}` : `${diff}`;
        const obCount = obPenalties[`${player}-${actualIndex}`] || 0;

        return (
          <TableCell key={i} align="left" sx={{ p: 0 }}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              onClick={() => {
                const current = parseInt(score) || 0;
                updateScore(player, actualIndex, current + 1);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                const current = parseInt(score) || 0;
                const newScore = Math.max(1, current - 1);
                updateScore(player, actualIndex, newScore);
              }}
              onTouchStart={() => {
                setLongPressIndex(i);
                const timeoutId = setTimeout(() => {
                  const current = parseInt(score) || 0;
                  const newScore = Math.max(1, current - 1);
                  updateScore(player, actualIndex, newScore);
                  setLongPressIndex(null);
                }, 600);
                setLongPressTimeout(timeoutId); // Save timeout ID
              }}
              onTouchEnd={() => {
                clearTimeout(longPressTimeout);
                setLongPressIndex(null);
              }}
              onTouchMove={() => {
                clearTimeout(longPressTimeout);
                setLongPressIndex(null);
              }}
              sx={{                
                width: 55,
                height: 60,
                
                border: longPressIndex === i ? '2px solid #2196f3' : '1px solid',
                borderRadius: '4px',
                bgcolor: longPressIndex === i
                  ? '#e3f2fd'
                  : diff === 0
                    ? '#979797d5'
                    : diff > 0
                      ? 'error.main'
                      : diff < 0
                        ? 'success.main'
                        : 'background.default',
                transition: 'background-color 0.2s, border 0.2s',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <Typography variant="body2">{score || '-'}</Typography>

              {isValid && (
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 'bold', lineHeight: 1 }}
                >
                  {diffDisplay}
                </Typography>
              )}

              {obCount > 0 && (
                <Typography
                  variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 'medium', mt: 0.2 }}
                  >
                    OB x{obCount}
                  </Typography>
                )}

            </Box>

            {/* OB Button */}
            <Button
              size="small"
              variant="outlined"              
              color="error"
              onClick={() => updateOBPenalty(player, actualIndex, 'increment')}
              sx={{
                mt: 0.5,
                fontSize: '0.7rem',
                fontWeight: 'bold',
                padding: '2px 4px',
                minWidth: 'unset',
              }}
            >
              OB
            </Button>
            {/* Reset OB Button */}
            {obCount > 0 && (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={() => updateOBPenalty(player, actualIndex, 'reset')}
                sx={{
                  mt: 0.2,
                  fontSize: '0.9rem',
                  padding: '3px 6px',
                  minWidth: 'unset',
                  lineHeight: 1,
                }}
              >
                x
              </Button>
            )}
          </TableCell>
        );
      })}

      <TableCell align="center">
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography fontWeight="medium">{total}</Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.primary', fontWeight: 'bold' }}
          >
            {isNaN(vsPar) ? '-' : vsPar === 0 ? '0' : vsPar > 0 ? `+${vsPar}` : vsPar}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}

export default ScoreRow;
