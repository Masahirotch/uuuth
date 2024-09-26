export const util = {
    methods: {
        /* 改行を<br>に
        **************************************************/
        nl2br(value) {
            if (value != undefined) {
                if (value.indexOf('http') != -1) {
                    var exp = /(http(s)?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                    var test = value.replace(exp, "<a href='$1" + "?openExternalBrowser=1" + "' target='_blank'>$1</a>")
                    return test.replace(/\r?\n/g, '<br>')
                }
                else {
                    return this.escapeHtml(value).replace(/\r?\n/g, '<br>')
                }
            }
        },
        /* htmlエスケープ
        **************************************************/
        escapeHtml: function (convertString) {
            if (typeof convertString !== 'string') return convertString;
            var patterns = {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                '\'': '&#x27;',
                '`': '&#x60;'
            }
            return convertString.replace(/[<>&"'`]/g, function (match) {
                return patterns[match];
            })
        },
    }
}
