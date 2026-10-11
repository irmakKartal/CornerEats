const imageSignatures = {
  'image/jpeg': [Buffer.from([0xff, 0xd8, 0xff])],
  'image/png': [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  'image/webp': [
    Buffer.from([0x52, 0x49, 0x46, 0x46]),
    Buffer.from([0x57, 0x45, 0x42, 0x50]),
  ],
};

export const validateImageBuffer = (buffer, mimetype) => {
  if (!Buffer.isBuffer(buffer) || !mimetype || !imageSignatures[mimetype]) {
    return false;
  }

  const signature = imageSignatures[mimetype];
  return signature.some((bytes) => buffer.subarray(0, bytes.length).equals(bytes));
};
