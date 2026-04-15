export const pickImageFile = () =>
  new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(null);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = () => {
      const file = input.files?.[0] || null;
      resolve(file);
      input.remove();
    };

    document.body.appendChild(input);
    input.click();
  });

export const createMarkdownImageCommandFilter = ({ uploadImage, onError }) => {
  if (typeof uploadImage !== 'function') {
    return undefined;
  }

  return (command, isExtra) => {
    if (isExtra || command?.name !== 'image') {
      return command;
    }

    return {
      ...command,
      execute: (state, api) => {
        (async () => {
          try {
            const file = await pickImageFile();
            if (!file) return;

            const response = await uploadImage(file);
            const imageUrl = String(
              response?.data?.imageUrl || response?.data?.url || ''
            ).trim();

            if (!imageUrl) {
              throw new Error('Upload succeeded but no image URL returned');
            }

            const selectedText = String(state?.selectedText || '').trim();
            const altText = selectedText || 'image';
            api.replaceSelection(`![${altText}](${imageUrl})`);
          } catch (error) {
            console.error('Inline image upload failed:', error);
            const message =
              error?.response?.data?.message || 'Failed to upload image';
            if (typeof onError === 'function') {
              onError(message);
            }
          }
        })();
      }
    };
  };
};
