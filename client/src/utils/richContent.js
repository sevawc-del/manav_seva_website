export const stripRichText = (value = '') => {
  if (!value) return '';

  let text = String(value);

  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`[^`]*`/g, ' ');
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, ' $1 ');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, ' $1 ');
  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/^[\s>*#-]+/gm, ' ');
  text = text.replace(/\|/g, ' ');
  text = text.replace(/[*_~]/g, '');
  text = text.replace(/https?:\/\/\S+/gi, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
};

export const isLikelyHtml = (value = '') => /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
