const isFlatObject = (obj) => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) return false;

  // If any top-level key contains a dot, assume flat
  return keys.some(key => key.includes('.'));
}

export default isFlatObject;