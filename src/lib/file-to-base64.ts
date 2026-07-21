export function fileToBase64(file: File): Promise<{ dataBase64: string; contentType: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const result = reader.result as string;
      const commaIdx = result.indexOf(",");
      const dataBase64 = commaIdx >= 0 ? result.slice(commaIdx + 1) : result;
      resolve({
        dataBase64,
        contentType: file.type || "application/octet-stream",
        filename: file.name,
      });
    };
    reader.readAsDataURL(file);
  });
}
