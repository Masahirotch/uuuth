// クエリ文字列をエスケープする
const escapeQuery = query => {
    if (!query) { return query }

    return query
        .replace(/\\/g, "\\\\")
        .replace(/\'/g, "\\\'")
        .replace(/\"/g, "\\\"")
        .replace(/\n/g, "\\\n")
        .replace(/\r/g, "\\\r")
        .replace(/\x00/g, "\\\x00")
        .replace(/\x1a/g, "\\\x1a")
}

module.exports = escapeQuery