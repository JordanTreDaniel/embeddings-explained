import {
  Container,
  Box,
  AppBar,
  TextField,
  Button,
  Typography,
  Pill,
} from "@mui/material";
import "./App.css";
import { useState } from "react";
import * as React from "react";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

function App() {
  const [terms, setTerms] = useState([]);
  const [text, setText] = useState("");

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleDelete = (term) => {
    const newTerms = terms.filter((term, i) => i !== term);
    setTerms(newTerms);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTerms([...terms, text]);
    setText("");
  };

  return (
    <Container maxWidth="sm">
      <AppBar position="static">
        <Typography variant="h6">Vector Embedding Demonstration</Typography>
      </AppBar>

      <Box my={2}>
        <Typography variant="body1">
          Enter your text below (up to 140 characters):
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            multiline
            fullWidth
            rows={4}
            inputProps={{ maxLength: 140 }}
            value={text}
            onChange={handleInputChange}
          />

          <Box mt={2}>
            <Button variant="contained" type="submit">
              Add String
            </Button>
          </Box>
        </form>
      </Box>

      <Box my={2}>
        <Typography variant="body1">My Phrases</Typography>
        <Stack direction="row" spacing={1}>
          {terms.map((term, i) => {
            return (
              <>
                <Chip
                  key={i}
                  label={term}
                  onDelete={() => handleDelete(term)}
                  variant="outlined"
                />
              </>
            );
          })}
        </Stack>
      </Box>
      <Box my={2}>
        <Typography variant="body1">Search:</Typography>

        <TextField fullWidth />

        <Box my={2}>
          <Button variant="outlined">Traditional Search</Button>
          <Button variant="outlined">Vector Search</Button>
        </Box>
      </Box>

      <Box my={2}>
        <Typography variant="body1">Results:</Typography>
        {/* Results will go here */}
      </Box>
    </Container>
  );
}

export default App;
