export async function fileToBase64(file: File): Promise<{
  filename: string;
  contentType: string;
  dataBase64: string;
}> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return {
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    dataBase64: btoa(binary),
  };
}
