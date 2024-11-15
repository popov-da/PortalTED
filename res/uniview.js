(function (solo) {
    if (!solo.uniview) solo.uniview = {
        config: {}
    };
    if (!solo.uniview.config) solo.uniview.config = {};

    var config = solo.uniview.config;

    if (config.soloUrl) solo.baseURL = config.soloUrl;

    var m_mem = config.totalMemory || config.mem || 16,
        m_src = config.src || '',
        m_skinUrl = config.skinUrl || '',
        m_specUrl = config.specUrl || '';

    if (location.search) {
        if (/[\?&]mem=(\d+)/.exec(location.search)) {
            m_mem = Math.min(Math.max(16, parseInt(RegExp.$1)), 1024);
        }
        if (location.search != '?') {
            var p = location.search.substring(1).split('&')[0];
            if (p && p.indexOf('=') < 0) {
                m_src = decodeURIComponent(p);
            }
        }
    }

    solo.use('require')
        .then(function () {
            return solo.use("Cortona3DSoloSkin", {
                baseUrl: m_skinUrl
            });
        })
        .then(function () {
            // load solo-uniview as app skin
            return solo.skin.create('app').use('solo-uniview', {
                factory: config.factory,
                features: +config.features || 0,
                skipUIPublishOptions: false,
                useDiscardableGeometryData: false,
                baseUrl: m_specUrl,
                src: m_src,
                totalMemory: m_mem
            });
        })
        .catch(function (e) {
            if (typeof e === 'object' && typeof e.message === 'string') {
                var lastErrorText = solo.core ? solo.core.lastErrorText : e.message;
                if (config.enableMemoryAutoIncrease && /(Cannot enlarge memory)/i.test(lastErrorText)) {
                    if (m_mem < 1024) {
                        if (m_mem < 256) {
                            m_mem *= 2;
                        } else if (m_mem < 1024) {
                            m_mem += 128;
                        }
                        location.replace(location.origin + location.pathname + (location.search || '?').replace(/&mem=\d+/, '') + '&mem=' + m_mem);
                    }
                }
            }
            console.error(e);
        });
})(Cortona3DSolo);