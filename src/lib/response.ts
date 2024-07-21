export const APIResponse = (message: string, status: number, data?: any) => {
  return {
    status: status,
    message,
    data,
  };
};
