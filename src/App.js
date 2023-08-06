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
  const [searchTerm, setSearchTerm] = useState(""); //TODO: Efficiency: calculate the emedding when setting search term.

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
    handleSearch(e);
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
    handleSearch(e);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    let newMatchingTerms = [];
    if (searchMode === "traditional") {
      newMatchingTerms = terms.filter((term) =>
        term.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
      newMatchingTerms = searchResults
        .sort((a, b) => {
          return b.similarity - a.similarity; // this is prob not right. How can i figure out which ones are closer?
        })
        .slice(0, 5);
    }
    newMatchingTerms = newMatchingTerms.reduce((acc, curr, i) => {
      acc[curr.text] = { rank: i + 1 };
      return acc;
    }, {});
    setMatchingTerms(newMatchingTerms);
  };

  return (
    <Container maxWidth="sm">
      <AppBar position="static">
        <Typography variant="h6">Vector Embedding Demonstration</Typography>
      </AppBar>

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
              <ToggleButton
                value="traditional"
                onClick={() => {
                  setSearchMode("traditional");
                  handleSearch();
                }}
              >
                Regular Search
              </ToggleButton>
              <ToggleButton
                value="semantic"
                onClick={() => {
                  setSearchMode("semantic");
                  handleSearch();
                }}
              >
                Search By Meaning
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </form>
      </Box>

      {/* <Box my={2}>
        <Typography variant="body1">Results:</Typography>
        {matchingTerms.map((term, i) => (
          <Chip
            key={i}
            label={term.text}
            variant="outlined"
            style={{ backgroundColor: "green", color: "white" }}
          />
        ))}
      </Box> */}

      <Box my={2}>
        <Typography variant="body1">Example Words & Ideas</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {terms.map((term, i) => {
            const isMatching = searchTerm.length && matchingTerms[term.text];
            return (
              <Chip
                key={i}
                label={
                  term.text +
                  (isMatching ? ` (${matchingTerms[term.text].rank})` : "")
                }
                onDelete={() => handleDelete(term)}
                variant="outlined"
                style={{
                  backgroundColor: isMatching ? "green" : "red",
                  color: "white",
                }}
              />
            );
          })}
        </Stack>
      </Box>

      <Box my={2}>
        <Typography variant="body1">
          Enter your own words and sentences here:
        </Typography>

        <form onSubmit={handleNewStrSubmission}>
          <TextField
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
    </Container>
  );
}

export default App;
