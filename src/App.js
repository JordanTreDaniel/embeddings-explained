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
import { getSampleTerms, getEmbeddings } from "./utils";
import { useSearch, useSearchTerm } from "./hooks";

function App() {
  const [terms, setTerms] = useState([]);
  const [text, setText] = useState("");
  const [searchMode, setSearchMode] = useState("semantic");
  const [searchTerm, setSearchTerm] = useSearchTerm("", searchMode);
  const debouncedSearchTerm = useDebounce(searchTerm, 2000); //TODO: This doesn't work
  const matchingTerms = useSearch(debouncedSearchTerm, terms, searchMode);

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
  };

  const handleSearchTermChange = (e) => {
    e.preventDefault();
    const newSearchText = e.target.value;
    setSearchTerm(newSearchText);
  };

  const handleDelete = (term) => {
    const newTerms = terms.filter((t) => t !== term);
    setTerms(newTerms);
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
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchTermChange(e);
    }
  };

  const handleTextKeyDown = (e) => {
    if (e.key === "Enter") {
      handleNewStrSubmission(e);
    }
  };

  return (
    <Container maxWidth="sm">
      <AppBar position="static">
        <Typography variant="h6">Vector Embedding Demonstration</Typography>
      </AppBar>

      <Box my={2}>
        <Typography variant="body1">Search:</Typography>
        <TextField
          fullWidth
          value={searchTerm.text}
          onChange={handleSearchTermChange}
          onKeyDown={handleSearchKeyDown}
        />

        <Box my={2}>
          <ToggleButtonGroup
            value={searchMode}
            exclusive
            onChange={(e, newMode) => {
              console.log({ newMode });
              handleSetSearchMode(newMode);
            }}
          >
            <ToggleButton value="traditional">Regular Search</ToggleButton>
            <ToggleButton value="semantic">Search By Meaning</ToggleButton>
          </ToggleButtonGroup>
        </Box>
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

        <TextField
          inputProps={{ maxLength: 140 }}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleTextKeyDown}
        />

        <Box mt={2}>
          <Button variant="contained" type="submit">
            Add String
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
