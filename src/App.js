import * as React from "react";
import { useState, useEffect } from "react";
import {
  Container,
  Box,
  AppBar,
  TextField,
  Button,
  Typography,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import "./App.css";
import { getDistAndSimilarity, getWords, getEmbedding } from "./utils";

function App() {
  const [terms, setTerms] = useState([]);
  const [text, setText] = useState("");
  const [matchingTerms, setMatchingTerms] = useState([]);
  const [searchMode, setSearchMode] = useState("semantic");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const initializeWords = async () => {
      const words = await getWords();
      setTerms(words);
    };
    initializeWords();
  }, []);

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (term) => {
    const newTerms = terms.filter((t) => t !== term);
    setTerms(newTerms);
  };

  const handleNewStrSubmission = async (e) => {
    e.preventDefault();
    const embedding = await getEmbedding(text);
    const newTerm = {
      text,
      embedding,
    };
    setTerms([...terms, newTerm]);
    setText("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchMode === "traditional") {
      const newMatchingTerms = terms.filter((term) =>
        term.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setMatchingTerms(newMatchingTerms);
    } else if (searchMode === "semantic") {
      const searchTermEmbedding = await getEmbedding(searchTerm);
      const searchResults = terms.map((term) => {
        const { distance, similarity } = getDistAndSimilarity(
          searchTermEmbedding,
          term.embedding
        );
        return {
          ...term,
          distance,
          similarity,
        };
      });
      const newMatchingTerms = searchResults
        .sort((a, b) => {
          return b.similarity - a.similarity; // this is prob not right. How can i figure out which ones are closer?
        })
        .slice(0, 3);
      setMatchingTerms(newMatchingTerms);
    }
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

        <form onSubmit={handleNewStrSubmission}>
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
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {terms.map((term, i) => (
            <Chip
              key={i}
              label={term.text}
              onDelete={() => handleDelete(term)}
              variant="outlined"
            />
          ))}
        </Stack>
      </Box>
      <Box my={2}>
        <Typography variant="body1">Search:</Typography>
        <form onSubmit={handleSearch}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={handleSearchTermChange}
          />

          <Box my={2}>
            <ToggleButtonGroup
              value={searchMode}
              exclusive
              onChange={(e, newMode) => setSearchMode(newMode)}
            >
              <ToggleButton value="traditional">Traditional</ToggleButton>
              <ToggleButton value="semantic">Semantic</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box my={2}>
            <Button variant="outlined" type={"submit"}>
              Search
            </Button>
          </Box>
        </form>
      </Box>

      <Box my={2}>
        <Typography variant="body1">Results:</Typography>
        {matchingTerms.map((term, i) => (
          <Chip key={i} label={term.text} variant="outlined" />
        ))}
      </Box>
    </Container>
  );
}

export default App;
