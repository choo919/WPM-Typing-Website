export const words = [
  "the","and","to","of","a","in","that","is","it","you","for","on","with","as","I",
  "this","be","at","or","have","from","by","not","but","they","his","she","we","say",
  "her","will","my","one","all","would","there","their","what","so","up","out","if",
  "about","who","get","which","go","me","when","make","can","like","time","no","just",
  "him","know","take","people","into","year","your","good","some","could","them",
  "see","other","than","then","now","look","only","come","its","over","think","also",
  "back","after","use","two","how","our","work","first","well","way","even","new",
  "want","because","any","these","give","day","most","us"
];

// in-place Fisher–Yates shuffle helper
export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}