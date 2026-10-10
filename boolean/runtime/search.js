// boolean/runtime/search.js
// Keyword search (BM25) over Bean title and text, with an optional
// embedding score blended in when the caller supplies an embed function.
// Pure JavaScript so the same code runs in Node and in React Native.

'use strict';

const STOPWORDS = new Set((
 'a an and are as at be but by can did do does for from had has have he her his how i if in into is it its ' +
 'me my no not of on or our she so than that the their them then there these they this those to too us was ' +
 'we were what when where which who whom why will with would you your about tell'
).split(' '));

const tokenize = (text) => (String(text || '').toLowerCase().match(/[a-z0-9]+(?:'[a-z]+)?/g) || [])
 .map((t) => t.replace(/'s$/, ''))
 .filter((t) => t.length > 1 && !STOPWORDS.has(t));

class Bm25Index {
 constructor(docs, { k1 = 1.2, b = 0.75 } = {}) {
  this.k1 = k1;
  this.b = b;
  this.docs = docs.map((doc) => {
   const tokens = tokenize(`${doc.title || ''} ${doc.title || ''} ${doc.text || ''}`);
   const tf = new Map();
   for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
   return { id: doc.bean_id, length: tokens.length, tf };
  });
  this.avgLength = this.docs.reduce((sum, d) => sum + d.length, 0) / Math.max(this.docs.length, 1);
  this.df = new Map();
  for (const d of this.docs) for (const t of d.tf.keys()) this.df.set(t, (this.df.get(t) || 0) + 1);
 }

 /** Returns Map of bean_id -> score for docs matching at least one query term. */
 score(query) {
  const terms = [...new Set(tokenize(query))];
  const n = this.docs.length;
  const scores = new Map();
  for (const d of this.docs) {
   let s = 0;
   for (const t of terms) {
    const f = d.tf.get(t);
    if (!f) continue;
    const df = this.df.get(t);
    const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
    s += idf * (f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + this.b * d.length / this.avgLength));
   }
   if (s > 0) scores.set(d.id, s);
  }
  return scores;
 }
}

const cosine = (a, b) => {
 let dot = 0;
 let na = 0;
 let nb = 0;
 for (let i = 0; i < a.length; i++) {
  dot += a[i] * b[i];
  na += a[i] * a[i];
  nb += b[i] * b[i];
 }
 return na && nb ? dot / Math.sqrt(na * nb) : 0;
};

module.exports = { tokenize, Bm25Index, cosine, STOPWORDS };
