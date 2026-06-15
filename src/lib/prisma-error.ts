export const isTableMissingError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes("does not exist") || message.includes("tabledoesnotexist") || message.includes("p2021");
};
