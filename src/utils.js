import axios from "axios";
import { get } from "lodash";

export function cosineSimilarity(embedding1, embedding2) {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += Math.pow(embedding1[i], 2);
    norm2 += Math.pow(embedding2[i], 2);
  }
  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  return similarity;
}

export function euclideanDistance(embedding1, embedding2) {
  let sum = 0;
  for (let i = 0; i < embedding1.length; i++) {
    sum += Math.pow(embedding1[i] - embedding2[i], 2);
  }
  return Math.sqrt(sum);
}

export function getDistAndSimilarity(embedding1, embedding2) {
  const dist = euclideanDistance(embedding1, embedding2);
  const similarity = cosineSimilarity(embedding1, embedding2);
  return { dist, similarity };
}

export const words = [
  "cat",
  "kitten", // similar
  "apple", // different
  "car",
  "vehicle", // similar
  "flower",
  "rose", // similar
  "ocean", // different
  "book",
  "novel", // similar
  "computer", // different
  "city",
  "metropolis", // similar
  "bird",
  "sparrow", // similar
  "mountain", // different
  "shoe",
  "sneaker", // similar
  "space", // different
  "river",
  "stream", // similar
  "instrument",
  "guitar", // similar
  "planet", // different
  "dog",
  "puppy", // similar
  "fruit",
  "banana", // similar
  "sky", // different
  "music",
  "melody", // similar
  "forest", // different
  "movie",
  "film", // similar
  "lake",
  "pond", // similar
  "star", // different
  "phone",
  "mobile", // similar
  "beach", // different
  "bicycle",
  "bike", // similar
];

export const getWords = async () => {
  const embeddings = await Promise.all(words.map((word) => getEmbedding(word)));
  const wordsWithEmbeddings = words.map((word, i) => {
    return {
      text: word,
      embedding: embeddings[i],
    };
  });
  return wordsWithEmbeddings;
};

export const getEmbedding = async (str) => {
  const model = "text-embedding-ada-002";
  const response = await axios.post(
    "https://api.openai.com/v1/embeddings",
    {
      model,
      input: str,
      max_tokens: 64,
      // n: Math.ceil(terms.length * 0.25), // Get the top 25% of matches
    },
    {
      headers: {
        Authorization:
          "Bearer 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",
        "Content-Type": "application/json",
      },
    }
  );
  const embedding = get(response, "data.data[0].embedding", [0]);
  return embedding;
};
