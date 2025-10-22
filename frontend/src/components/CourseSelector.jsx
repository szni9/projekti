import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';

function CourseSelector({ courses, setSelectedCourse }) {
  const handleChange = (e) => {
    const selectedId = e.target.value;
    const course = courses.find((c) => c.id === selectedId);
    setSelectedCourse(course);
  };

  return (
    <Box mt={2}>
      <FormControl fullWidth>
        <InputLabel id="course-select-label">Valitse rata</InputLabel>
        <Select
          labelId="course-select-label"
          defaultValue=""
          onChange={handleChange}
          label="Select Golf Course"
        >
          {courses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {course.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

export default CourseSelector;