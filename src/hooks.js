import { getDistAndSimilarity, getEmbeddings } from "./utils";
import { useState, useEffect } from "react";
// Custom hook for searching
export function useSearch(debouncedSearchTerm, terms, searchMode) {
  const [matchingTerms, setMatchingTerms] = useState([]);

  useEffect(() => {
    const handleSearch = async () => {
      let newMatchingTerms = {};
      if (!debouncedSearchTerm.text?.length) return;
      if (searchMode === "traditional") {
        newMatchingTerms = terms.filter((term) =>
          term.text
            .toLowerCase()
            .includes(debouncedSearchTerm.text.toLowerCase())
        );
      } else if (searchMode === "semantic") {
        const searchTermEmbedding = debouncedSearchTerm.embedding;
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
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5);
      }
      newMatchingTerms = newMatchingTerms.reduce((acc, curr, i) => {
        acc[curr.text] = { rank: i + 1 };
        return acc;
      }, {});
      setMatchingTerms(newMatchingTerms);
    };

    handleSearch();
  }, [debouncedSearchTerm, terms, searchMode]);

  return matchingTerms;
}

// Custom hook for managing and fetching embeddings for a search term
export function useSearchTerm(initialText, searchMode) {
  const [searchTerm, setSearchTerm] = useState({
    text: initialText,
    embedding: [0],
  });

  useEffect(() => {
    const fetchEmbedding = async () => {
      if (searchTerm.text.length && searchMode === "semantic") {
        const [embedding] = await getEmbeddings(searchTerm.text);
        setSearchTerm((prev) => ({ ...prev, embedding }));
      }
    };
    fetchEmbedding();
  }, [searchTerm.text, searchMode]);

  const updateSearchTerm = (newSearchText) => {
    setSearchTerm({ text: newSearchText, embedding: [0] });
  };

  return [searchTerm, updateSearchTerm];
}
