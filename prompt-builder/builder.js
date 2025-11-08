/**
 * Prompt Preview & Export System (v1.1.0)
 * Alinhado com o backend 'template_generator.py' (v1.1.0)
 */

class PromptPreviewExporter {
    constructor(apiBaseUrl = 'http://localhost:8000') {
        this.apiBaseUrl = apiBaseUrl;
        
        // v1.1.0 CHANGE: O backend agora envia 'markdown_template'
        this.currentMarkdownTemplate = '';
    }

    /**
     * Gera preview do prompt
     */
    async generatePreview(agentData) {
        try {
            // v1.1.0 CHANGE: Endpoint corrigido de '/api/generate-prompt'
            const response = await fetch(`${this.apiBaseUrl}/api/v1/generate-template`, {
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
            
            // v1.1.0 CHANGE: Armazena 'markdown_template' em vez de 'markdown'
            this.currentMarkdownTemplate = data.markdown_template;

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

        // v1.1.0 CHANGE: A "Aba Visual" agora é uma <pre> para o ASCII-box.
        // A função markdownToHTML() foi removida pois não é mais necessária.
        // Nós exibimos o texto pré-formatado (ASCII) em ambas as abas.
        const asciiPreview = this.escapeHTML(data.markdown_template);

        const html = `
            <div class="prompt-preview-container">
                <div class="preview-header">
                    <h3>📋 Preview do Template (v1.1.0)</h3>
                    <div class="preview-metrics">
                        <span class="metric">
                            <strong>Tokens:</strong> ${data.token_count}
                            ${data.token_count > 200 ? '⚠️' : '✅'}
                        </span>
                        <span class="metric">
                            <strong>SD:</strong> ${data.sd_score ? data.sd_score.toFixed(3) : 'N/A'}
                        </span>
                    </div>
                </div>

                ${data.warnings.length > 0 ? this.renderWarnings(data.warnings) : ''}

                <div class="preview-tabs">
                    <button class="tab-btn active" data-tab="visual">
                        👁️ Visual (ASCII)
                    </button>
                    <button class="tab-btn" data-tab="markdown">
                        📝 Markdown (Raw)
                    </button>
                </div>

                <div class="tab-content active" data-tab-content="visual">
                    <pre class="preview-visual-ascii"><code>${asciiPreview}</code></pre>
                </div>

                <div class="tab-content" data-tab-content="markdown">
                    <pre class="preview-markdown"><code>${asciiPreview}</code></pre>
                </div>

                <div class="preview-actions">
                    <button class="btn btn-primary" id="copy-prompt-btn">
                        📋 Copiar Template
                    </button>
                    <button class="btn btn-secondary" id="download-prompt-btn">
                        💾 Download .md
                    </button>
                    </div>
            </div>
        `;

        container.innerHTML = html;

        // Adicionar event listeners
        // v1.1.0 CHANGE: Passa o 'agentData' para o handler de download
        const agentData = JSON.parse(localStorage.getItem('tempAgentData') || '{}');
        this.attachEventListeners(container, data, agentData);
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
    attachEventListeners(container, data, agentData) {
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
            this.copyToClipboard(this.currentMarkdownTemplate);
        });

        // Download
        const downloadBtn = container.querySelector('#download-prompt-btn');
        downloadBtn.addEventListener('click', () => {
            // v1.1.0 CHANGE: Chama o endpoint de exportação do backend,
            // que já lida com a criação do arquivo.
            this.exportAndDownload(agentData);
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
            this.showFeedback('✅ Template copiado!', 'success');
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = markdown;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showFeedback('✅ Template copiado!', 'success');
        }
    }

    /**
     * v1.1.0 CHANGE: Nova função para chamar o endpoint de exportação do backend
     * O backend agora cria o arquivo .md para nós.
     */
    async exportAndDownload(agentData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/v1/export-template`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agentData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Erro ao exportar');
            }

            const blob = await response.blob();
            const filename = response.headers.get('content-disposition')?.split('filename=')[1] || 'agente-exportado.md';
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showFeedback('💾 Download iniciado!', 'success');

        } catch (error) {
            console.error('Erro no download:', error);
            this.showFeedback('❌ Erro no download.', 'error'); // 'error' type needs to be defined in CSS
        }
    }
    
    // v1.1.0 CHANGE: Removida a função downloadMarkdown() pois foi substituída por exportAndDownload()
    // v1.1.0 CHANGE: Removida a função sharePrompt() por simplicidade

    /**
     * Mostra feedback visual
     */
    showFeedback(message, type = 'success') {
        // ... (o código de feedback está bom, sem mudanças) ...
        const feedback = document.createElement('div');
        feedback.className = `feedback feedback-${type}`; // (Ensure 'feedback-error' is styled in CSS)
        feedback.textContent = message;
        document.body.appendChild(feedback);
        setTimeout(() => {
            feedback.classList.add('fade-out');
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }
}

// =====================================================
// INTEGRAÇÃO NO APP (v1.1.0)
// =====================================================

const previewExporter = new PromptPreviewExporter('http://localhost:8000');

// Botão "Gerar Preview"
document.querySelector('#generate-preview-btn')?.addEventListener('click', async () => {
    
    // v1.1.0 CHANGE: O payload (JSON) foi alinhado com o backend v1.1.0 (Python)
    const agentData = {
        name: document.querySelector('#agent-name-input').value,
        domain: document.querySelector('#domain-input').value,
        
        // v1.1.0 CHANGE: 'core_principle' (v1.0) foi renomeado para 'mission' (v1.1.0)
        mission: document.querySelector('#core-principle-input').value, 
        
        protocol_items: getProtocolItems(),
        
        // v1.1.0 CHANGE: O 'anti_pattern' (v1.0) agora é tratado
        // pela função getBaseshotExamples (v1.1.0)
        baseshot_examples: getBaseshotExamples(), 
        
        sd_score: parseFloat(document.querySelector('#sd-display')?.textContent || 0.0)
    };

    // v1.1.0 CHANGE: Salva os dados no localStorage para que o botão
    // de Download (que é renderizado dinamicamente) possa acessá-los.
    localStorage.setItem('tempAgentData', JSON.stringify(agentData));

    try {
        const data = await previewExporter.generatePreview(agentData);
        previewExporter.renderPreview(data, '#prompt-preview-container', agentData);
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

// v1.1.0 CHANGE: Esta função agora também captura o "Anti-Padrão"
// e o insere na lista de 'baseshot' como 'type: "negative"'.
function getBaseshotExamples() {
    const examples = [];
    
    // 1. Pega todos os exemplos dinâmicos (positivos e edge)
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

    // 2. Pega o "Anti-Padrão" (o Erro Comum) e o formata como um 'negative' baseshot
    const antiPatternReason = document.querySelector('#anti-pattern-input').value.trim();
    const antiPatternOutput = document.querySelector('#anti-pattern-output-input')?.value.trim() || "(Exemplo de saída ruim)"; // Opcional

    if (antiPatternReason) {
        examples.push({
            type: "negative",
            // No v1.1.0, o "input" é a *razão* do erro, e o "output" é o exemplo de saída ruim
            input: antiPatternReason,
            output: antiPatternOutput
        });
    }
    
    return examples;
}
