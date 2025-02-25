export const getToken = async () => {
    const response = await fetch("/api/openai/token");
    const data = await response.json();
    return data.client_secret.value;
  };