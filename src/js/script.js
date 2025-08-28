(function () {
    // ---- utility
    const DEFAULT_NODE_COLORS = {
        "Literature": "#66c2a5",
        "RPG/Board Games": "#8da0cb",
        "Video Games": "#fc8d62",
        "Cinema/TV": "#e78ac3",
        "Comics": "#a6d854",
        "Mythology": "#ffd92f"
    };
    const REL_COLORS = {
        "lit": "#1b9e77",
        "weird": "#d95f02",
        "ttrpg": "#3182bd",
        "game": "#e7298a",
        "hybrid": "#756bb1"
    };

    const EXAMPLE = {
        "format": "cytoscapeJSON",
        "generated": "2025-08-28T01:25:00Z",
        "styleLegend": {
            "nodeColors": {
                "Literature": "#66c2a5",
                "RPG/Board Games": "#8da0cb",
                "Video Games": "#fc8d62",
                "Cinema/TV": "#e78ac3",
                "Comics": "#a6d854",
                "Mythology": "#ffd92f"
            },
            "edgeColors": {
                "lit": "#1b9e77",
                "weird": "#d95f02",
                "ttrpg": "#3182bd",
                "game": "#e7298a",
                "hybrid": "#756bb1",
                "mythological": "#e6ab02",
                "visual": "#7570b3"
            }
        },
        "elements": {
            "nodes": [],
            "edges": []
        }
    };

    // ---- mobile detection
    function isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // ---- init cytoscape
    let cy = cytoscape({
        container: document.getElementById('cy'),
        pixelRatio: 1,
        wheelSensitivity: isMobile() ? 0.5 : 0.2,
        minZoom: 0.05,
        maxZoom: 4,
        autoungrabify: false,
        autounselectify: false,
        autolock: false,
        autoResize: true,
        hideEdgesOnViewport: false,
        touchTapThreshold: 8,
        desktopTapThreshold: 4,
        style: [
            {
                selector: 'node',
                style: {
                    'shape': 'circle',
                    'background-color': ele => getNodeColor(ele),
                    'border-width': 1,
                    'border-color': '#22303b',
                    'color': 'black',
                    'font-family': 'system-ui, Segoe UI, Roboto, Arial',
                    'text-halign': 'center',
                    'text-valign': 'center',
                    'label': ele => labelFor(ele),
                    'width': ele => getNodeDimension(ele) + 'px',
                    'height': ele => getNodeDimension(ele) + 'px',
                    'text-wrap': 'wrap',
                    'text-max-width': ele => Math.max(180, getNodeDimension(ele) * 0.8),
                    'font-size': ele => {
                        const scale = getNodeSize(ele);
                        return Math.max(8, 10 * scale) + 'px';
                    }
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': ele => getEdgeColor(ele),
                    'target-arrow-color': ele => getEdgeColor(ele),
                    'target-arrow-shape': 'triangle',
                    'target-arrow-size': isMobile() ? 72 : 144,
                    'arrow-scale': isMobile() ? 6.0 : 12.0,
                    'curve-style': 'bezier',
                    'opacity': 0.95
                }
            },
            { selector: '.faded', style: { 'opacity': 0.15 } },
            { selector: '.hidden', style: { 'display': 'none' } },
            { selector: '.highlight', style: { 'border-width': 2, 'border-color': '#f6c177', 'shadow-blur': 8, 'shadow-color': '#000', 'shadow-opacity': 0.4, 'shadow-offset-x': 0, 'shadow-offset-y': 1 } }
        ],
        layout: { name: 'dagre', rankDir: 'TB', nodeSep: 15, rankSep: 40, edgeSep: 5 }
    });

    // global state
    let CURRENT = null; // loaded json (with optional styleLegend)
    let CAT_COLORS = { ...DEFAULT_NODE_COLORS };
    let REL_COLOR_MAP = { ...REL_COLORS };

    function getElements() {
        // Load JSON data directly from srv/data.json
        fetch('srv/data.json')
            .then(response => response.json())
            .then(data => {
                loadElements(data);
            })
            .catch(error => {
                console.error('Error loading JSON data:', error);
            });
    }

    function getNodeColor(ele) {
        const cat = ele.data('category') || 'Literature';
        return CAT_COLORS[cat] || DEFAULT_NODE_COLORS[cat] || '#7aa7c7';
    }
    function getNodeSize(ele) {
        const degree = ele.degree();
        // Scale down for mobile
        const baseScale = isMobile() ? 0.7 : 1.0;
        const maxBonus = isMobile() ? 2.0 : 3.0;
        const connectionBonus = baseScale + Math.min(degree * 0.15, maxBonus);
        return connectionBonus;
    }
    function calculateTextSize(text, fontSize = 10) {
        // Rough estimation: average character width is ~0.6 of fontSize
        const charWidth = fontSize * 0.6;
        const lineHeight = fontSize * 1.2;
        
        // Adjust character limit for mobile
        const maxCharsPerLine = isMobile() ? 20 : 25;
        const words = text.split(' ');
        let lines = [''];
        let currentLine = 0;
        
        for (const word of words) {
            if ((lines[currentLine] + ' ' + word).length > maxCharsPerLine) {
                currentLine++;
                lines[currentLine] = word;
            } else {
                lines[currentLine] = lines[currentLine] ? lines[currentLine] + ' ' + word : word;
            }
        }
        
        const textWidth = Math.max(...lines.map(line => line.length * charWidth));
        const textHeight = lines.length * lineHeight;
        
        // Return diameter needed for a circle (add padding)
        return Math.max(textWidth, textHeight) + 20; // 20px padding
    }
    function getNodeDimension(ele) {
        const degree = ele.degree();
        const scale = getNodeSize(ele);
        const label = labelFor(ele) || '';
        const fontSize = Math.max(8, 10 * scale);
        
        // Calculate minimum size needed for text
        const textBasedSize = calculateTextSize(label, fontSize);
        
        // Apply scaling to the text-based size, smaller minimum for mobile
        const minSize = isMobile() ? 45 : 60;
        return Math.max(minSize, textBasedSize * scale);
    }
    function getEdgeColor(ele) {
        const c = ele.data('color');
        if (c) return c;
        const rel = ele.data('relation');
        return REL_COLOR_MAP[rel] || '#9aa6b2';
    }
    function shortLabel(s) {
        if (!s) return '';
        return s.length > 60 ? s.slice(0, 57) + '…' : s;
    }
    function wrapLabel(s, width = 25) {
        if (!s) return '';
        const words = s.split(' ');
        let lines = [''], i = 0;
        for (const w of words) {
            if ((lines[i] + ' ' + w).length > width) { i++; lines[i] = w; }
            else lines[i] = (lines[i] ? lines[i] + ' ' : '') + w;
        }
        return lines.join('\n');
    }
    function labelFor(ele) {
        const L = ele.data('label') || '';
        if ($('#chkWrap').prop('checked')) return wrapLabel(L, 25);
        if ($('#chkShort').prop('checked')) return shortLabel(L);
        return L;
    }
    function refreshLabels() {
        cy.nodes().forEach(n => n.style('label', labelFor(n)));
    }

    // ---- load elements
    function loadElements(json) {
        // supports: {elements:{nodes,edges}} or directly {nodes,edges}
        const els = json.elements ? json.elements : json;
        if (!els || !Array.isArray(els.nodes) || !Array.isArray(els.edges)) {
            alert('Invalid JSON: must find elements.nodes and elements.edges (or nodes/edges at root).');
            return;
        }
        CURRENT = json;
        // custom colors if present
        if (json.styleLegend && json.styleLegend.nodeColors) {
            CAT_COLORS = { ...DEFAULT_NODE_COLORS, ...json.styleLegend.nodeColors };
        }
        if (json.styleLegend && json.styleLegend.edgeColors) {
            REL_COLOR_MAP = { ...REL_COLORS, ...json.styleLegend.edgeColors };
        }

        cy.elements().remove();
        cy.add(els);
        buildFilters();       // filters from actually present categories/relations
        refreshLabels();
        applyLayout();
        cy.fit();
    }

    // ---- filters
    function buildFilters() {
        const cats = new Set(cy.nodes().map(n => n.data('category')).filter(Boolean));
        const rels = new Set(cy.edges().map(e => e.data('relation')).filter(Boolean));

        const $cat = $('#catFilters').empty();
        const $rel = $('#relFilters').empty();

        [...cats].sort().forEach(c => {
            const color = CAT_COLORS[c] || '#556';
            const id = 'cat_' + c.replace(/\W+/g, '_');
            $cat.append(`
        <label title="${c}">
          <input type="checkbox" id="${id}" data-cat="${c}" checked>
          <span class="sw" style="background:${color}"></span>${c}
        </label>
      `);
        });

        [...rels].sort().forEach(r => {
            const color = REL_COLOR_MAP[r] || '#888';
            const id = 'rel_' + r.replace(/\W+/g, '_');
            $rel.append(`
        <label title="${r}">
          <input type="checkbox" id="${id}" data-rel="${r}" checked>
          <span class="sw" style="background:${color}"></span>${r}
        </label>
      `);
        });

        // bind
        $('#catFilters input[type=checkbox]').off('change').on('change', () => {
            const enabled = new Set($('#catFilters input:checked').map((_, el) => $(el).data('cat')).get());
            cy.nodes().forEach(n => {
                const on = enabled.has(n.data('category'));
                n.toggleClass('hidden', !on);
            });
            // hide edges connecting hidden nodes
            cy.edges().forEach(e => {
                const on = e.source().visible() && e.target().visible();
                e.toggleClass('hidden', !on);
            });
        });

        $('#relFilters input[type=checkbox]').off('change').on('change', () => {
            const enabled = new Set($('#relFilters input:checked').map((_, el) => $(el).data('rel')).get());
            cy.edges().forEach(e => {
                const on = enabled.has(e.data('relation'));
                e.toggleClass('hidden', !on);
            });
        });
    }

    // ---- layout
    function getLayout() {
        const name = $('#layoutSel').val();
        if (name === 'dagre') {
            return { name: 'dagre', rankDir: 'TB', nodeSep: 50, rankSep: 120, edgeSep: 20 };
        }
        if (name === 'breadthfirst') {
            return { name: 'breadthfirst', directed: true, spacingFactor: 1.5, padding: 50 };
        }
        if (name === 'cose') {
            return { 
                name: 'cose', 
                padding: 200, 
                nodeRepulsion: 300000, 
                idealEdgeLength: 400,
                edgeElasticity: 40,
                gravity: 1.2, 
                numIter: 5000,
                avoidOverlap: true,
                nodeOverlap: 120,
                coolingFactor: 0.9,
                minTemp: 0.5,
                componentSpacing: 250
            };
        }
        if (name === 'concentric') {
            return { name: 'concentric', minNodeSpacing: 20, padding: 30 };
        }
        if (name === 'grid') {
            return { name: 'grid', padding: 20, avoidOverlap: true };
        }
        if (name === 'circle') {
            return { name: 'circle', padding: 20 };
        }
        return { name: 'dagre' };
    }
    function applyLayout() {
        const l = cy.layout(getLayout());
        l.run();
    }

    // ---- search
    function clearSearch() {
        cy.elements().removeClass('faded highlight');
        $('#search').val('');
    }
    function doSearch(q) {
        cy.elements().removeClass('highlight');
        if (!q) { cy.elements().removeClass('faded'); return; }
        let rx = null;
        try { rx = new RegExp(q, 'i'); } catch (e) { rx = null; }
        const matched = cy.nodes().filter(n => {
            const lab = n.data('label') || '';
            return rx ? rx.test(lab) : lab.toLowerCase().includes(q.toLowerCase());
        });
        cy.elements().addClass('faded');
        matched.removeClass('faded').addClass('highlight');
        if (matched.length) cy.fit(matched, 50);
    }

    // ---- export
    function exportPNG() {
        const png64 = cy.png({ full: true, scale: 2, bg: '#0d1319' });
        const a = document.createElement('a');
        a.href = png64;
        a.download = 'fantasy_map.png';
        a.click();
    }

    // ---- file input & dragdrop
    $('#fileInput').on('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result);
                loadElements(json);
            } catch (err) {
                alert('Invalid JSON: ' + err.message);
            }
        };
        reader.readAsText(f);
    });

    const dz = document.getElementById('dropzone');
    if (dz) {
        dz.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor = '#2e3944'; });
        dz.addEventListener('dragleave', e => { dz.style.borderColor = 'var(--line)'; });
        dz.addEventListener('drop', e => {
            e.preventDefault();
            dz.style.borderColor = 'var(--line)';
            const f = e.dataTransfer.files && e.dataTransfer.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const json = JSON.parse(reader.result);
                    loadElements(json);
                } catch (err) {
                    alert('Invalid JSON: ' + err.message);
                }
            };
            reader.readAsText(f);
        });
    }

    // ---- binds
    $('#btnFit').on('click', () => cy.fit());
    $('#btnLayout').on('click', applyLayout);
    $('#btnPNG').on('click', exportPNG);
    $('#search').on('input', e => doSearch(e.target.value.trim()));
    $('#btnClear').on('click', clearSearch);
    $('#chkShort, #chkWrap').on('change', refreshLabels);
    $('#layoutSel').on('change', applyLayout);

    // ---- prevent canvas resize bug
    function updateMobileHeaderHeight() {
        if (isMobile()) {
            const header = document.querySelector('header');
            if (header) {
                const headerHeight = header.offsetHeight + 8; // Add some padding
                document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            }
        }
    }

    window.addEventListener('resize', () => {
        updateMobileHeaderHeight();
        cy.resize();
        cy.fit();
    });

    // Force initial resize to prevent expanding canvas
    setTimeout(() => {
        updateMobileHeaderHeight();
        cy.resize();
        cy.fit();
    }, 100);

    // ---- mobile filters toggle
    $('#mobileFilters').on('click', () => {
        const $aside = $('aside');
        const $overlay = $('#mobileOverlay');
        const $button = $('#mobileFilters');
        
        $aside.toggleClass('show');
        $overlay.toggleClass('show');
        
        // Update ARIA attributes for accessibility
        const isExpanded = $aside.hasClass('show');
        $button.attr('aria-expanded', isExpanded);
        $overlay.attr('aria-hidden', !isExpanded);
    });

    $('#mobileOverlay').on('click', () => {
        $('aside').removeClass('show');
        $('#mobileOverlay').removeClass('show');
        $('#mobileFilters').attr('aria-expanded', 'false');
        $('#mobileOverlay').attr('aria-hidden', 'true');
    });

    // ---- startup with minimal demo
    getElements();
})();