import * as React from "react";
import { useState, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";
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
import { getDistAndSimilarity, getSampleTerms, getEmbeddings } from "./utils";

function App() {
  const [terms, setTerms] = useState([]);
  const [text, setText] = useState("");
  const [matchingTerms, setMatchingTerms] = useState([]);
  const [searchMode, setSearchMode] = useState("semantic");
  const [searchTerm, setSearchTerm] = useState({ text: "", embedding: [0] }); //TODO: Efficiency: calculate the emedding when setting search term.
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const initializeWords = async () => {
      const words = await getSampleTerms();
      setTerms(words);
    };
    initializeWords();
  }, []);

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleSetSearchMode = (mode) => {
    if (!["traditional", "semantic"].includes(mode)) mode = "semantic";
    setSearchMode(mode);
    if (mode === "semantic") updateSearchTermEmbedding();
  };

  const handleSearchTermChange = async (e) => {
    e.preventDefault();
    const newSearchText = e.target.value;
    let newSearchEmbedding = [0];
    console.log({ newSearchText });
    await setSearchTerm({ text: newSearchText, embedding: [0] });
    if (newSearchText.length && searchMode === "semantic") {
      newSearchEmbedding = await updateSearchTermEmbedding(newSearchText);
    }
    handleSearch({ text: newSearchText, embedding: newSearchEmbedding });
  };

  const updateSearchTermEmbedding = async (newSearchText) => {
    const [embedding] = await getEmbeddings(newSearchText);
    setSearchTerm({ text: newSearchText, embedding });
    handleSearch({ text: newSearchText, embedding });
    return embedding;
  };

  const handleDelete = (term) => {
    const newTerms = terms.filter((t) => t !== term);
    setTerms(newTerms);
    handleSearch(searchTerm, newTerms);
  };

  const handleNewStrSubmission = async (e) => {
    e.preventDefault();
    const [embedding] = await getEmbeddings(text);
    const newTerm = {
      text,
      embedding,
    };
    const newTerms = [...terms, newTerm];
    setTerms(newTerms);
    setText("");
    handleSearch(searchTerm, newTerms);
  };

  const handleSearch = async (
    _searchTerm = debouncedSearchTerm,
    _terms = terms
  ) => {
    let newMatchingTerms = [];
    console.log({ _searchTerm, _terms, searchMode });
    if (!_searchTerm.text?.length) newMatchingTerms = [];
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("searching", _searchTerm.text.toLowerCase());
    if (searchMode === "traditional") {
      newMatchingTerms = _terms.filter((term) =>
        term.text.toLowerCase().includes(_searchTerm.text.toLowerCase())
      );
    } else if (searchMode === "semantic") {
      const searchTermEmbedding = _searchTerm.embedding;
      const searchResults = _terms.map((term) => {
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
        <form onSubmit={updateSearchTermEmbedding}>
          <TextField
            fullWidth
            value={searchTerm.text}
            onChange={handleSearchTermChange}
          />

          <Box my={2}>
            <ToggleButtonGroup
              value={searchMode}
              exclusive
              onChange={(e, newMode) => {
                console.log({ newMode });
                handleSetSearchMode(newMode);
                handleSearch(searchTerm);
              }}
            >
              <ToggleButton value="traditional">Regular Search</ToggleButton>
              <ToggleButton value="semantic">Search By Meaning</ToggleButton>
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
            const isMatching =
              searchTerm.text.length && matchingTerms[term.text];
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
