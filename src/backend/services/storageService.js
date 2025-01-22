import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadProfilePhoto = async (file, userId) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    throw new Error('Erro ao fazer upload da foto');
  }
};