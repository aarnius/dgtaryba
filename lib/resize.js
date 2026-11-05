// Sumažina nuotrauką naršyklėje prieš įkeliant (telefonų nuotraukos būna 5+ MB)
export async function resizeImage(file, max = 1600, quality = 0.82) {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    if (!blob) throw new Error("toBlob");
    return { file: new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }), w, h };
  } catch {
    return { file, w: null, h: null }; // pvz. HEIC kai kuriose naršyklėse
  }
}
