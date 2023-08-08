import axios from "axios";
import { get } from "lodash";
import sampleTerms from "./sampleTerms.json";
import sampleJokes from "./sampleJokes.json";

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

const jokes = [
  "Why do barbers make the best bank robbers? Because they know all the shortcuts!", // funny, standalone
  "Man, I ain't seen a traffic jam like this since my grandma tried to parallel park!", // funny, standalone
  "Every time I try to eat healthy, a chocolate bar looks at me and snickers.", // funny, similar to the next
  "Diet tip: If you think you're hungry, you might just be thirsty. Or bored. Or maybe you just saw a pizza commercial.", // funny, similar to the previous
  "Did you hear about the claustrophobic astronaut? He just needed a little space.", // funny, standalone
  "Why did the scarecrow win an award? Because he was outstanding in his field!", // funny, similar to the next
  "If you see a crime at an Apple Store, does that make you an iWitness?", // funny, standalone
  "I told my wife she should embrace her mistakes. She gave me a hug.", // funny, similar to the next
  "My friend wants to become an archaeologist, but I tried to put him off. You know how upset he'll be when he realizes his career is in ruins?", // funny, standalone
  "Every time I see a limo, I wonder if it's just a regular car taking its time.", // funny, similar to the next
  "Why did the bicycle fall over? It was two-tired.", // funny, standalone
  "Man, my ceiling isn’t the best, but it’s up there.", // funny, similar to the previous
  "They say money talks, but mine only ever says 'Goodbye!'", // funny, standalone
  "You ever notice how pickles are just cucumbers that went through a tough time?", // funny, similar to the next
  "Being an adult is like trying to fold a fitted sheet.", // funny, standalone
];

export const getSampleTerms = async (fakeIt = true) => {
  if (fakeIt) return sampleJokes;
  const embeddings = await getEmbeddings(jokes);
  const termsWithEmbeddings = jokes.map((str, i) => {
    return {
      text: str,
      embedding: embeddings[i],
    };
  });
  console.log(termsWithEmbeddings);
  return termsWithEmbeddings;
};

export const getEmbeddings = async (strs) => {
  const isArr = Array.isArray(strs);
  const response = await axios.post(
    `${process.env.REACT_APP_RAP_CLOUDS_SERVER_URL}/getEmbeddings`,
    {
      strCollection: typeof isArr ? strs : [strs],
    }
  );
  const embeddings = get(response, "data.embeddings", [[0]]);
  return embeddings;
};
