export const toolOk = (data) => ({
  content: [{ type: "text", text: JSON.stringify(data) }],
});

export const toolErr = (error) => toolOk({ error });

export const callApi = async (fn) => {
  try {
    const { data } = await fn();
    return toolOk(data);
  } catch (err) {
    const message =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      "Request failed with error status code " + err.response?.status;

    return toolErr(message);
  }
};
