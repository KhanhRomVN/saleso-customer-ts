import { imageDB } from "@/firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export const handleImageSelect = (
  event: React.ChangeEvent<HTMLInputElement>,
  setSelectedImages: React.Dispatch<React.SetStateAction<File[]>>,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (event.target.files && event.target.files.length > 0) {
    const filesArray = Array.from(event.target.files);
    setSelectedImages(filesArray);
    setIsModalOpen(true);
  }
};

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const cropImageFile = async (
  croppedAreaPixels: CroppedAreaPixels,
  selectedImage: string
): Promise<Blob | null> => {
  if (!croppedAreaPixels || !selectedImage) return null;

  const canvas = document.createElement("canvas");
  const image = new Image();
  image.src = selectedImage;

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  ctx.drawImage(
    image,
    croppedAreaPixels.x * scaleX,
    croppedAreaPixels.y * scaleY,
    croppedAreaPixels.width * scaleX,
    croppedAreaPixels.height * scaleY,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};

export const handleUploadCroppedImage = async (
  croppedImage: Blob
): Promise<string | null> => {
  const storageRef = ref(imageDB, `images/${uuidv4()}`);

  try {
    await uploadBytes(storageRef, croppedImage);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading image: ", error);
    return null;
  }
};
