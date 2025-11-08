/**
 * Prompt Preview & Export System (v1.1.2)
 * Alinhado com os backends v1.1.0:
 * - template_generator.py (Porta 8001)
 * - api-endpoint.py (Porta 8000)
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
     * v1.1.0: Chama o endpoint de exportação do backend
     */
    async exportAndDownload(agentData) {
        try {
            // v1.1.2 CORREÇÃO: Aponta para a API correta (porta 8001)
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
            this.showFeedback('❌ Erro no download.', 'error');
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
// INTEGRAÇÃO NO APP (v1.1.2)
// =====================================================

// v1.1.2 CORREÇÃO: A API do *Construtor* roda na porta 8001
const previewExporter = new PromptPreviewExporter('http://localhost:8001');

// v1.1.2 CORREÇÃO: A API de *Análise (SD)* roda na porta 8000
const SD_API_URL = 'http://localhost:8000/api/v1/analyze-alignment';


// Botão "Gerar Preview"
document.querySelector('#generate-preview-btn')?.addEventListener('click', async () => {
    
    const validatedSdScore = parseFloat(localStorage.getItem('tempSdScore') || 0.0);

    const agentData = {
        name: document.querySelector('#agent-name-input').value,
        domain: document.querySelector('#domain-input').value,
        mission: document.querySelector('#core-principle-input').value, 
        protocol_items: getProtocolItems(),
        baseshot_examples: getBaseshotExamples(), 
        sd_score: validatedSdScore
    };

    localStorage.setItem('tempAgentData', JSON.stringify(agentData));

    try {
        // Chama a porta 8001
        const data = await previewExporter.generatePreview(agentData); 
        previewExporter.renderPreview(data, '#prompt-preview-container', agentData);
    
    } catch (error) {
        alert('Erro ao gerar preview: ' + error.message + "\n\nO backend Python 'tools/template_generator.py' (porta 8001) está rodando?");
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
            examples.push({ type, input, output });
        }
    });

    const antiPatternReason = document.querySelector('#anti-pattern-input').value.trim();
    const antiPatternOutput = document.querySelector('#anti-pattern-output-input')?.value.trim() || "(Exemplo de saída ruim)";

    if (antiPatternReason) {
        examples.push({
            type: "negative",
            input: antiPatternReason,
            output: antiPatternOutput
        });
    }
    
    return examples;
}

// =====================================================
// PATCH v1.1.2 - LÓGICA DE FORMULÁRIO INTERATIVO
// =====================================================

/**
 * v1.1.2 CORREÇÃO: Lógica para o botão "Validar Densidade Semântica"
 * - Não usa mais a classe 'AlignmentVisualizer'.
 * - Faz sua própria chamada 'fetch' para a porta 8000.
 */
const sdBtn = document.querySelector('#validate-sd-btn');
const sdDisplay = document.querySelector('#sd-display');

sdBtn?.addEventListener('click', async () => {
    const agentName = document.querySelector('#agent-name-input').value;
    const domain = document.querySelector('#domain-input').value;

    if (!agentName || !domain) {
        alert("Preencha o Nome do Agente e o Domínio para validar o SD.");
        return;
    }

    sdDisplay.textContent = 'Calculando...';
    sdBtn.disabled = true;

    try {
        // v1.1.2: Faz a chamada fetch para a API de análise (porta 8000)
        const response = await fetch(SD_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agent_name: agentName,
                domain: domain
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Erro de servidor');
        }

        const data = await response.json();
        const sdScore = data.semantic_density;
        
        sdDisplay.textContent = `${sdScore.toFixed(3)} ${sdScore >= 0.8 ? '✅' : '⚠️'}`;
        
        // Salva o score no localStorage para o 'generate-preview-btn' usar
        localStorage.setItem('tempSdScore', sdScore.toFixed(3));
        
    } catch (error) {
        console.error("Erro ao validar SD:", error);
        sdDisplay.textContent = 'Erro';
        alert("Erro ao validar SD. O backend Python 'tools/api-endpoint.py' (porta 8000) está rodando?");
    } finally {
        sdBtn.disabled = false;
    }
});

/**
 * Lógica para o botão "+ Adicionar Item ao Protocolo"
 */
const addProtocolBtn = document.querySelector('#add-protocol-item-btn');
const protocolContainer = document.querySelector('#protocol-items-container');

addProtocolBtn?.addEventListener('click', () => {
    const itemCount = protocolContainer.querySelectorAll('.protocol-item').length;
    
    const newItem = document.createElement('div');
    newItem.className = 'form-group protocol-item';
    newItem.innerHTML = `
        <input 
          type="text" 
          class="protocol-item-input" 
          placeholder="Ex: ${itemCount + 1}. Nova regra do protocolo..."
        />
        <button class="remove-item-btn">X</button>
    `;
    
    newItem.querySelector('.remove-item-btn').addEventListener('click', () => {
        newItem.remove();
    });
    
    protocolContainer.appendChild(newItem);
});

/**
 * Lógica para o botão "+ Adicionar Exemplo (✅ ou ⚠️)"
 */
const addBaseshotBtn = document.querySelector('#add-baseshot-example-btn');
const baseshotContainer = document.querySelector('#baseshot-examples-container');

addBaseshotBtn?.addEventListener('click', () => {
    const newItem = document.createElement('div');
    newItem.className = 'form-group baseshot-example';
    
    newItem.innerHTML = `
        <div class="baseshot-header">
            <select class="example-type-select">
                <option value="positive">✅ Caso Ideal</option>
                <option value="edge">⚠️ Edge Case</option>
            </select>
            <button class="remove-item-btn">X</button>
        </div>
        <label>Input do Exemplo:</label>
        <textarea class="example-input" rows="2" placeholder="Input: ..."></textarea>
        <label>Output Esperado:</label>
        <textarea class="example-output" rows="2" placeholder="Output: ..."></textarea>
    `;
    
    newItem.querySelector('.remove-item-btn').addEventListener('click', () => {
        newItem.remove();
    });
    
    baseshotContainer.appendChild(newItem);
});

/**
 * Adiciona listeners aos botões "remover" que já existem no HTML
 * (Este trecho é para botões pré-carregados, se houver)
 */
document.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.form-group').remove();
    });
});
