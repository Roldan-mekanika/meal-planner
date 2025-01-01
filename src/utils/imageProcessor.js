// src/utils/imageProcessor.js
export class ImageProcessingError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ImageProcessingError';
    }
  }
  
  export const processImage = async (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculer les nouvelles dimensions en conservant le ratio
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
  
          // Créer un canvas pour redimensionner
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
  
          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height);
  
          // Convertir en blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new ImageProcessingError("Échec de la conversion de l'image"));
                return;
              }
              // Créer un nouveau fichier avec un nom unique
              const processedFile = new File(
                [blob],
                `${Date.now()}-${file.name}`,
                { type: 'image/jpeg' }
              );
              resolve(processedFile);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => {
          reject(new ImageProcessingError("Échec du chargement de l'image"));
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        reject(new ImageProcessingError("Échec de la lecture du fichier"));
      };
      reader.readAsDataURL(file);
    });
  };
  
  export const validateRecipe = (recipe) => {
    const errors = [];
  
    if (!recipe.title?.trim()) {
      errors.push("Le titre est requis");
    }
  
    if (!recipe.preparation_time || recipe.preparation_time <= 0) {
      errors.push("Le temps de préparation doit être supérieur à 0");
    }
  
    if (!recipe.cooking_time || recipe.cooking_time <= 0) {
      errors.push("Le temps de cuisson doit être supérieur à 0");
    }
  
    if (!recipe.servings || recipe.servings <= 0) {
      errors.push("Le nombre de portions doit être supérieur à 0");
    }
  
    if (!recipe.base_ingredients?.length) {
      errors.push("Au moins un ingrédient est requis");
    }
  
    if (recipe.hasVariants && (!recipe.variants?.length || 
        recipe.variants.some(v => !v.name?.trim()))) {
      errors.push("Les variantes doivent avoir un nom");
    }
  
    return errors;
  };
  
  export const formatErrorMessage = (error) => {
    if (error.code === 'storage/unauthorized') {
      return "Erreur d'autorisation lors du téléchargement de l'image";
    }
    if (error.code === 'storage/canceled') {
      return "Téléchargement annulé";
    }
    if (error.code === 'storage/unknown') {
      return "Une erreur inconnue s'est produite";
    }
    return error.message || "Une erreur s'est produite";
  };