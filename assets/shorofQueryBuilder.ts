/**
 * Expo SQLite Query Builder Helper
 * Letakkan kode ini di folder: /src/expo-sqlite/utils/shorofQueryBuilder.ts
 */
export const ShorofQueryBuilder = {
  buildDictionaryQuery(searchQuery: string, binaFilter: string) {
    let sql = "SELECT * FROM dictionary";
    const params: string[] = [];
    const conditions: string[] = [];

    if (searchQuery) {
      conditions.push("(fa LIKE ? OR ain LIKE ? OR lam LIKE ? OR translation LIKE ?)");
      const pattern = `%${searchQuery}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    if (binaFilter && binaFilter !== "All") {
      conditions.push("bina = ?");
      params.push(binaFilter);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY fa, ain, lam ASC";
    return { sql, params };
  }
};
