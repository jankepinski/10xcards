/**
 * Hook do nawigacji między stronami
 * Używa standardowego window.location dla Astro
 */
export const useNavigate = () => {
  /**
   * Nawigacja do podanej ścieżki
   * @param path Ścieżka do której nawigujemy
   */
  const navigate = (path: string) => {
    window.location.href = path;
  };

  return navigate;
};
