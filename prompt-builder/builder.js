/**
 * Prompt Preview & Export System
 * Visualiza preview do prompt e permite copiar/download
 */

class PromptPreviewExporter {
    constructor(apiBaseUrl = 'http://localhost:8000') {
        this.apiBaseUrl = apiBaseUrl;
        this.currentMarkdown = '';
    }

    /**
     * Gera preview do prompt
     */
    async generatePreview(agentData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/generate-prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agentData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Erro ao gerar prompt');
            }

            const data = await response.json();
            this.currentMarkdown = data.markdown;

            return data;

        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    }

    /**
     * Renderiza preview na interface
     */
    renderPreview(data, containerSelector) {
        const container = document.querySelector(containerSelector);

        if (!container) {
            console.error('Container não encontrado');
            return;
        }

        // Converter Markdown para HTML para preview visual
        const htmlPreview = this.markdownToHTML(data.markdown);

        const html = `
            <div class="prompt-preview-container">
                <div class="preview-header">
                    <h3>📋 Preview do Prompt</h3>
                    <div class="preview-metrics">
                        <span class="metric">
                            <strong>Tokens:</strong> ~${data.token_estimate}
                            ${data.token_estimate > 200 ? '⚠️' : '✅'}
                        </span>
                        <span class="metric">
                            <strong>SD:</strong> ${data.sd_score ? data.sd_score.toFixed(3) : 'N/A'}
                        </span>
                    </div>
                </div>

                ${data.warnings.length > 0 ? this.renderWarnings(data.warnings) : ''}

                <div class="preview-tabs">
                    <button class="tab-btn active" data-tab="visual">
                        👁️ Visual
                    </button>
                    <button class="tab-btn" data-tab="markdown">
                        📝 Markdown
                    </button>
                </div>

                <div class="tab-content active" data-tab-content="visual">
                    <div class="preview-visual">
                        ${htmlPreview}
                    </div>
                </div>

                <div class="tab-content" data-tab-content="markdown">
                    <pre class="preview-markdown"><code>${this.escapeHTML(data.markdown)}</code></pre>
                </div>

                <div class="preview-actions">
                    <button class="btn btn-primary" id="copy-prompt-btn">
                        📋 Copiar Prompt
                    </button>
                    <button class="btn btn-secondary" id="download-prompt-btn">
                        💾 Download .md
                    </button>
                    <button class="btn btn-tertiary" id="share-prompt-btn">
                        🔗 Compartilhar
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Adicionar event listeners
        this.attachEventListeners(container, data);
    }

    /**
     * Renderiza warnings
     */
    renderWarnings(warnings) {
        return `
            <div class="preview-warnings">
                ${warnings.map(w => `<div class="warning-item">${w}</div>`).join('')}
            </div>
        `;
    }

    /**
     * Converte Markdown simples para HTML
     * (versão simplificada, para produção use biblioteca como marked.js)
     */
    markdownToHTML(markdown) {
        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

        // Lists
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Horizontal rule
        html = html.replace(/^---$/gim, '<hr>');

        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';

        return html;
    }

    /**
     * Escapa HTML para exibir código
     */
    escapeHTML(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Adiciona event listeners
     */
    attachEventListeners(container, data) {
        // Tabs
        const tabBtns = container.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(container, tab);
            });
        });

        // Copiar
        const copyBtn = container.querySelector('#copy-prompt-btn');
        copyBtn.addEventListener('click', () => {
            this.copyToClipboard(this.currentMarkdown);
        });

        // Download
        const downloadBtn = container.querySelector('#download-prompt-btn');
        downloadBtn.addEventListener('click', () => {
            this.downloadMarkdown(this.currentMarkdown, data);
        });

        // Compartilhar
        const shareBtn = container.querySelector('#share-prompt-btn');
        shareBtn.addEventListener('click', () => {
            this.sharePrompt(this.currentMarkdown);
        });
    }

    /**
     * Troca entre tabs
     */
    switchTab(container, tabName) {
        // Desativar todas as tabs
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        container.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Ativar tab selecionada
        container.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        container.querySelector(`[data-tab-content="${tabName}"]`).classList.add('active');
    }

    /**
     * Copia prompt para clipboard
     */
    async copyToClipboard(markdown) {
        try {
            await navigator.clipboard.writeText(markdown);
            this.showFeedback('✅ Prompt copiado!', 'success');
        } catch (err) {
            // Fallback para navegadores antigos
            const textarea = document.createElement('textarea');
            textarea.value = markdown;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            this.showFeedback('✅ Prompt copiado!', 'success');
        }
    }

    /**
     * Download do prompt como arquivo .md
     */
    downloadMarkdown(markdown, data) {
        const agentName = data.markdown.match(/# 🔪 (.*)/)?.[1] || 'agente';
        const safeName = agentName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[-\s]+/g, '-');
        const filename = `agente-${safeName}.md`;

        const blob = new Blob([markdown], {
            type: 'text/markdown'
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        this.showFeedback('💾 Download iniciado!', 'success');
    }

    /**
     * Compartilha prompt (Web Share API ou fallback)
     */
    async sharePrompt(markdown) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Agente Canivete Cirúrgico',
                    text: markdown.substring(0, 200) + '...',
                    url: window.location.href
                });
                this.showFeedback('🔗 Compartilhado!', 'success');
            } catch (err) {
                console.log('Compartilhamento cancelado');
            }
        } else {
            // Fallback: copiar link
            await navigator.clipboard.writeText(window.location.href);
            this.showFeedback('🔗 Link copiado!', 'success');
        }
    }

    /**
     * Mostra feedback visual
     */
    showFeedback(message, type = 'success') {
        const feedback = document.createElement('div');
        feedback.className = `feedback feedback-${type}`;
        feedback.textContent = message;

        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.classList.add('fade-out');
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }
}

// =====================================================
// INTEGRAÇÃO NO APP
// =====================================================

const previewExporter = new PromptPreviewExporter('http://localhost:8000');

// Botão "Gerar Preview"
document.querySelector('#generate-preview-btn')?.addEventListener('click', async () => {
    const agentData = {
        name: document.querySelector('#agent-name-input').value,
        domain: document.querySelector('#domain-input').value,
        core_principle: document.querySelector('#core-principle-input').value,
        anti_pattern: document.querySelector('#anti-pattern-input').value,
        protocol_items: getProtocolItems(), // Função custom para extrair lista
        baseshot_examples: getBaseshotExamples(), // Função custom
        sd_score: parseFloat(document.querySelector('#sd-display').textContent)
    };

    try {
        const data = await previewExporter.generatePreview(agentData);
        previewExporter.renderPreview(data, '#prompt-preview-container');
    } catch (error) {
        alert('Erro ao gerar preview: ' + error.message);
    }
});

// Helpers
function getProtocolItems() {
    const items = [];
    document.querySelectorAll('.protocol-item-input').forEach(input => {
        if (input.value.trim()) {
            items.push(input.value.trim());
        }
    });
    return items;
}

function getBaseshotExamples() {
    const examples = [];
    document.querySelectorAll('.baseshot-example').forEach(example => {
        const type = example.querySelector('.example-type-select').value;
        const input = example.querySelector('.example-input').value;
        const output = example.querySelector('.example-output').value;

        if (input && output) {
            examples.push({
                type,
                input,
                output
            });
        }
    });
    return examples;
}
