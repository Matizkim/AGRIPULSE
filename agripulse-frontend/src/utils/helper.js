export const safeJSON = (v) => {
  try { return JSON.parse(JSON.stringify(v)); }
  catch(e) { return String(v); }
};
