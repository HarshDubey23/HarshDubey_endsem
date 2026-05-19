export function getApiError(err, fallback = "Something went wrong. Please try again.") {
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  if (err.response?.data?.error) {
    return err.response.data.error;
  }

  if (err.code === "ERR_NETWORK") {
    return "Cannot reach server. Render may be waking up — wait 30 seconds and click Register again.";
  }

  if (err.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  if (err.message) {
    return err.message;
  }

  return fallback;
}
