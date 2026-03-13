const BASE_URL = "http://localhost:5000/api/riwayat";

export const getRiwayat = async () => {
  const response = await fetch(`${BASE_URL}/all`);
  return await response.json();
};

export const updateRiwayat = async (data) => {
  const response = await fetch(`${BASE_URL}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await response.json();
};