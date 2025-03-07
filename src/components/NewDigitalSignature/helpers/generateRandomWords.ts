export const generateRandomWords = (numWords: number, words: string[]): string => {
  const selectedWords = [];
  for (let i = 0; i < numWords; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    selectedWords.push(words[randomIndex]);
  }
  return selectedWords.join(" ");
};
