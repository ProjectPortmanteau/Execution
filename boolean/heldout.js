// boolean/heldout.js
// The frozen held-out slice for the disguise test.
//
// Membership is a hash of a salt and the bean_id, so a Bean's side never
// moves between runs and new Beans are assigned without reshuffling old
// ones. The salt and fraction are written to a manifest on the first run;
// later runs must use the same fraction or they refuse to export.

'use strict';

const crypto = require('crypto');
const fs = require('fs');

const DEFAULT_FRACTION = 0.1; // the Ledger's suggested 10%; still an open decision

const bucket = (salt, beanId) => {
 const digest = crypto.createHash('sha256').update(`${salt}:${beanId}`).digest();
 return digest.readUInt32BE(0) / 0x100000000;
};

const isHeldOut = (manifest, beanId) => bucket(manifest.salt, beanId) < manifest.fraction;

/**
 * Reads the manifest at manifestPath, or creates it when absent.
 * Throws when a fraction is requested that differs from the frozen one.
 */
const loadOrFreeze = (manifestPath, requestedFraction) => {
 if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (requestedFraction !== undefined && requestedFraction !== manifest.fraction) {
   throw new Error(
    `Held-out slice is frozen at ${manifest.fraction} (${manifestPath}); ` +
    `refusing to export with ${requestedFraction}. Changing it would leak eval items into training.`
   );
  }
  return { manifest, created: false };
 }

 const fraction = requestedFraction === undefined ? DEFAULT_FRACTION : requestedFraction;
 if (!(fraction > 0 && fraction < 1)) throw new Error(`held-out fraction must be between 0 and 1, got ${fraction}`);

 const manifest = {
  frozen_at: new Date().toISOString(),
  fraction,
  salt: crypto.randomBytes(16).toString('hex'),
 };
 fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
 return { manifest, created: true };
};

module.exports = { DEFAULT_FRACTION, bucket, isHeldOut, loadOrFreeze };
