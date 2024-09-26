export const util = {
    methods: {
        /* 半角数字（0～9）以外を入力させない
        ***************************************************/
        validate(e) {
            const charCode = (e.which) ? e.which : e.keyCode
            if (charCode > 31 && (charCode < 48 || charCode > 57)) { // 数字入力のみ許可する
                e.preventDefault()
            } else {
                return true
            }
        },
        format(val) {
            if (!val) { return '' }
            const replaced = val.replace(/\D/g, '') // 数字以外を除去
            return replaced ? replaced : ''
        },
        /* 改行を<br>に
        **************************************************/
        nl2br(value) {
            if (value != undefined) {
                if (value.indexOf('http') != -1) {
                    var exp = /(http(s)?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                    var test = value.replace(exp, "<a href='$1' target='_blank'>$1</a>")
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
