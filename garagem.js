// js/Garagem.js
import { Manutencao } from './Manutencao.js';
import { Veiculo } from 'veiculo.js'; // Importado para referência, mas não instanciado diretamente
import { Carro } from 'carro.js';
import { CarroEsportivo } from 'carroEsportivo.js';
import { Caminhao } from 'caminhao.js';

const GARAGEM_STORAGE_KEY = 'garagemUnificada_V3_Final_Mod'; // Chave única para LocalStorage

/**
 * @class Garagem
 * @classdesc Gerencia a coleção de veículos, a interface do usuário e a persistência de dados.
 */
export class Garagem {
    /**
     * Inicializa a garagem, carrega dados do LocalStorage e configura listeners.
     * @constructor
     */
    constructor() {
        /** @property {Veiculo[]} veiculos - Array de veículos na garagem. */
        this.veiculos = [];
        /** @property {number} veiculoSelecionadoIndex - Índice do veículo atualmente selecionado na lista. -1 se nenhum. */
        this.veiculoSelecionadoIndex = -1;
        /** @property {string} activeViewId - ID da view (aba) atualmente ativa. */
        this.activeViewId = 'minha-garagem-view'; // View inicial

        this.el = {
            navLinks: document.querySelectorAll('.app-nav .nav-link'),
            contentViews: document.querySelectorAll('.main-area .view'),
            notificacoesGlobais: document.getElementById('notificacoes-globais'),
            // Notificações de Lembretes - Supondo que você queira separar visualmente
            notificacoesLembretesContainer: document.getElementById('notificacoes-lembretes-container') || document.getElementById('notificacoes-globais'), // Fallback
            formAddVeiculo: document.getElementById('form-add-veiculo'),
            addTipoSelect: document.getElementById('add-veiculo-tipo'),
            addModeloInput: document.getElementById('add-veiculo-modelo'),
            addCorInput: document.getElementById('add-veiculo-cor'),
            addCamposCaminhaoDiv: document.getElementById('add-campos-caminhao'),
            addCapacidadeCaminhaoInput: document.getElementById('add-caminhao-capacidade'),
            listaGaragemUl: document.getElementById('listaGaragem'),
            detalhesVeiculoSelecionadoContainer: document.getElementById('detalhes-veiculo-selecionado-container'),
            detalhesVeiculoTitulo: document.getElementById('detalhes-veiculo-titulo-selecionado'),
            imagemVeiculo: document.getElementById('imagemVeiculoSelecionado'),
            informacoesVeiculo: document.getElementById('informacoesVeiculoSelecionado'),
            velocimetroContainer: document.getElementById('velocimetro-container'),
            velocimetroBarra: document.getElementById('velocimetro-barra'),
            btnLigar: document.getElementById('btn-ligar'),
            btnDesligar: document.getElementById('btn-desligar'),
            btnAcelerar: document.getElementById('btn-acelerar'),
            btnFrear: document.getElementById('btn-frear'),
            btnBuzinar: document.getElementById('btn-buzinar'),
            acoesEspecificasContainer: document.getElementById('acoes-especificas-selecionado'),
            btnTurboAtivar: document.getElementById('btn-turbo-ativar'),
            btnTurboDesativar: document.getElementById('btn-turbo-desativar'),
            cargaControlsDiv: document.getElementById('carga-controls'),
            inputCarga: document.getElementById('carga-valor'),
            btnCarregar: document.getElementById('btn-carregar'),
            btnDescarregar: document.getElementById('btn-descarregar'),
            formAgendarManutencao: document.getElementById('form-agendar-manutencao-selecionado'),
            manutencaoDataInput: document.getElementById('manutencao-data'),
            manutencaoTipoInput: document.getElementById('manutencao-tipo'),
            manutencaoCustoInput: document.getElementById('manutencao-custo'),
            manutencaoDescricaoInput: document.getElementById('manutencao-descricao'),
            listaHistoricoManutencao: document.getElementById('lista-historico-manutencao-selecionado'),
            listaAgendamentosManutencao: document.getElementById('lista-agendamentos-manutencao-selecionado'),
            listaTodosAgendamentos: document.getElementById('lista-todos-agendamentos'),
        };

        this.carregarDoLocalStorage();
        this.configurarListenersGlobais();
        this.mostrarView(this.activeViewId); // Mostrar view inicial
        // renderizarListaVeiculos será chamado por mostrarView se for 'minha-garagem-view'
        this.verificarAgendamentosParaLembretes();
    }

    /**
     * Configura os event listeners globais da aplicação.
     * Inclui navegação, submissão de formulários e botões de interação.
     * @private
     */
    configurarListenersGlobais() {
        this.el.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = e.target.id.replace('nav-', '') + '-view';
                this.mostrarView(viewId);
            });
        });

        this.el.formAddVeiculo.addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarVeiculoViaForm();
        });
        this.el.addTipoSelect.addEventListener('change', () => this.atualizarCamposEspecificosFormAdicionar());

        this.el.btnLigar.onclick = () => this.interagirComSelecionado('ligar');
        this.el.btnDesligar.onclick = () => this.interagirComSelecionado('desligar');
        this.el.btnAcelerar.onclick = () => this.interagirComSelecionado('acelerar', 20); // Valor padrão de aceleração UI
        this.el.btnFrear.onclick = () => this.interagirComSelecionado('frear', 15);     // Valor padrão de frenagem UI
        this.el.btnBuzinar.onclick = () => this.interagirComSelecionado('buzinar');
        this.el.btnTurboAtivar.onclick = () => this.interagirComSelecionado('ativarTurbo');
        this.el.btnTurboDesativar.onclick = () => this.interagirComSelecionado('desativarTurbo');
        this.el.btnCarregar.onclick = () => this.interagirComSelecionado('carregar');
        this.el.btnDescarregar.onclick = () => this.interagirComSelecionado('descarregar');

        this.el.formAgendarManutencao.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAgendarManutencaoParaVeiculoSelecionado();
        });
    }

    /**
     * Exibe uma view específica e oculta as outras. Atualiza o link de navegação ativo.
     * @param {string} viewId - O ID do elemento da view a ser exibida (ex: 'minha-garagem-view').
     */
    mostrarView(viewId) {
        try {
            this.el.contentViews.forEach(view => view.classList.remove('active'));
            this.el.navLinks.forEach(link => link.classList.remove('active'));

            const activeView = document.getElementById(viewId);
            // Ajuste para o ID do link de navegação, tratando 'minha-garagem' como caso especial se necessário
            const navIdForView = viewId.replace('-view', '');
            const activeLink = document.getElementById(`nav-${navIdForView}`);

            if (activeView) activeView.classList.add('active');
            else console.warn(`View com ID '${viewId}' não encontrada.`);

            if (activeLink) activeLink.classList.add('active');
            else console.warn(`Link de navegação para '${navIdForView}' não encontrado.`);

            this.activeViewId = viewId;

            // Lógica específica para cada view ao ser exibida
            if (viewId === 'minha-garagem-view') {
                this.renderizarListaVeiculos();
                if (this.veiculoSelecionadoIndex === -1 || this.veiculos.length === 0) {
                    this.el.detalhesVeiculoSelecionadoContainer.classList.add('hidden');
                } else {
                    this.atualizarPainelDetalhesVeiculo(); // Re-renderiza detalhes se um veículo estava selecionado
                }
            } else if (viewId === 'painel-manutencoes-view') {
                this.renderizarPainelManutencoesGeral();
            } else if (viewId === 'adicionar-veiculo-view') {
                this.el.formAddVeiculo.reset(); // Limpa o form ao entrar
                this.atualizarCamposEspecificosFormAdicionar(); // Garante que campos condicionais estejam corretos
            }
            this.limparNotificacaoGlobal(); // Limpa notificações ao mudar de view
        } catch (error) {
            console.error("Erro ao mostrar view:", viewId, error);
            this.exibirNotificacaoGlobal("Erro ao carregar a seção da página.", "error");
        }
    }

    /**
     * Atualiza a visibilidade dos campos específicos no formulário de adicionar veículo,
     * baseado no tipo de veículo selecionado (ex: capacidade de carga para caminhão).
     * @private
     */
    atualizarCamposEspecificosFormAdicionar() {
        const tipo = this.el.addTipoSelect.value;
        this.el.addCamposCaminhaoDiv.classList.toggle('hidden', tipo !== 'Caminhao');
        if (tipo === 'Caminhao') {
            this.el.addCapacidadeCaminhaoInput.required = true;
        } else {
            this.el.addCapacidadeCaminhaoInput.required = false;
        }
    }

    /**
     * Adiciona um novo veículo à garagem com base nos dados do formulário.
     * Realiza validações e exibe notificações.
     */
    adicionarVeiculoViaForm() {
        try {
            const tipo = this.el.addTipoSelect.value;
            const modelo = this.el.addModeloInput.value.trim();
            const cor = this.el.addCorInput.value.trim();

            if (!modelo || !cor) {
                this.exibirNotificacaoGlobal("Modelo e Cor são obrigatórios!", "warning");
                return;
            }

            let novoVeiculo;
            switch (tipo) {
                case 'Carro':
                    novoVeiculo = new Carro(modelo, cor);
                    break;
                case 'CarroEsportivo':
                    novoVeiculo = new CarroEsportivo(modelo, cor);
                    break;
                case 'Caminhao':
                    const capacidade = parseInt(this.el.addCapacidadeCaminhaoInput.value);
                    if (isNaN(capacidade) || capacidade <= 0) {
                        this.exibirNotificacaoGlobal("Capacidade de carga do caminhão deve ser um número positivo!", "warning");
                        return;
                    }
                    novoVeiculo = new Caminhao(modelo, cor, capacidade);
                    break;
                default:
                    this.exibirNotificacaoGlobal("Tipo de veículo selecionado é inválido!", "error");
                    return;
            }

            this.veiculos.push(novoVeiculo);
            this.salvarNoLocalStorage();
            this.el.formAddVeiculo.reset();
            this.atualizarCamposEspecificosFormAdicionar(); // Reseta visibilidade dos campos
            this.exibirNotificacaoGlobal(`${tipo} '${modelo}' adicionado à garagem com sucesso!`, "success");
            this.mostrarView('minha-garagem-view'); // Volta para a lista de veículos
        } catch (error) {
            console.error("Erro ao adicionar veículo via formulário:", error);
            this.exibirNotificacaoGlobal("Ocorreu um erro inesperado ao tentar adicionar o veículo.", "error");
        }
    }

    /**
     * Renderiza a lista de veículos na UI (view 'Minha Garagem').
     * Se não houver veículos, exibe uma mensagem apropriada.
     */
    renderizarListaVeiculos() {
        this.el.listaGaragemUl.innerHTML = ''; // Limpa a lista existente
        if (this.veiculos.length === 0) {
            this.el.listaGaragemUl.innerHTML = '<li><p>Nenhum veículo na garagem. Adicione um na aba "Adicionar Veículo".</p></li>';
            this.el.detalhesVeiculoSelecionadoContainer.classList.add('hidden'); // Esconde painel de detalhes
            this.veiculoSelecionadoIndex = -1; // Garante que nenhum veículo está selecionado
            return;
        }

        this.veiculos.forEach((veiculo, index) => {
            const li = document.createElement('li');
            li.className = (index === this.veiculoSelecionadoIndex) ? 'selecionado' : '';

            const infoSpan = document.createElement('span');
            infoSpan.className = 'vehicle-info';
            infoSpan.textContent = `${veiculo._tipoVeiculo}: ${veiculo.modelo} (${veiculo.cor})`;
            infoSpan.onclick = () => this.selecionarVeiculo(index);
            li.appendChild(infoSpan);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'vehicle-actions';
            const btnRemover = document.createElement('button');
            btnRemover.textContent = 'Remover';
            btnRemover.className = 'danger'; // Estilo para botão de perigo
            btnRemover.onclick = (e) => {
                e.stopPropagation(); // Impede que o clique no botão também selecione o item
                this.removerVeiculo(index);
            };
            actionsDiv.appendChild(btnRemover);
            li.appendChild(actionsDiv);

            this.el.listaGaragemUl.appendChild(li);
        });
    }
    
    /**
     * Remove um veículo da garagem pelo seu índice.
     * Atualiza a UI e salva no LocalStorage.
     * @param {number} index - O índice do veículo a ser removido.
     */
    removerVeiculo(index) {
        if (index < 0 || index >= this.veiculos.length) {
            this.exibirNotificacaoGlobal("Índice de veículo inválido para remoção.", "error");
            return;
        }
        const veiculoRemovido = this.veiculos.splice(index, 1)[0];
        this.exibirNotificacaoGlobal(`${veiculoRemovido._tipoVeiculo} '${veiculoRemovido.modelo}' removido da garagem.`, "info");

        if (this.veiculoSelecionadoIndex === index) { // Se o veículo removido era o selecionado
            this.veiculoSelecionadoIndex = -1;
            this.el.detalhesVeiculoSelecionadoContainer.classList.add('hidden');
        } else if (this.veiculoSelecionadoIndex > index) { // Ajusta índice se um item anterior foi removido
            this.veiculoSelecionadoIndex--;
        }

        this.salvarNoLocalStorage();
        this.renderizarListaVeiculos(); // Re-renderiza a lista
        if (this.veiculos.length > 0 && this.veiculoSelecionadoIndex !== -1) {
            this.atualizarPainelDetalhesVeiculo(); // Atualiza painel se ainda houver um selecionado
        }
        this.verificarAgendamentosParaLembretes(); // Atualiza lembretes
        if(this.activeViewId === 'painel-manutencoes-view') this.renderizarPainelManutencoesGeral();
    }

    /**
     * Seleciona um veículo da lista para exibir seus detalhes e permitir interações.
     * @param {number} index - O índice do veículo na array `this.veiculos`.
     */
    selecionarVeiculo(index) {
        try {
            if (index < 0 || index >= this.veiculos.length) {
                this.veiculoSelecionadoIndex = -1;
                this.el.detalhesVeiculoSelecionadoContainer.classList.add('hidden');
                console.warn("Tentativa de selecionar índice inválido:", index);
            } else {
                this.veiculoSelecionadoIndex = index;
                this.el.detalhesVeiculoSelecionadoContainer.classList.remove('hidden');
                this.atualizarPainelDetalhesVeiculo();
            }
            this.renderizarListaVeiculos(); // Re-renderiza a lista para destacar o novo selecionado
        } catch (error) {
            console.error("Erro ao selecionar veículo:", error);
            this.exibirNotificacaoGlobal("Erro ao tentar exibir os detalhes do veículo.", "error");
            this.el.detalhesVeiculoSelecionadoContainer.classList.add('hidden');
        }
    }

    /**
     * Atualiza o painel de detalhes do veículo selecionado com suas informações e estado atual.
     * Ajusta a visibilidade e o estado dos botões de interação.
     * @private
     */
    atualizarPainelDetalhesVeiculo() {
        if (this.veiculoSelecionadoIndex < 0 || this.veiculoSelecionadoIndex >= this.veiculos.length) {
            this.el.detalhesVeiculoSelecionadoContainer.classList.add('hidden');
            return;
        }

        const v = this.veiculos[this.veiculoSelecionadoIndex];
        if (!v) {
            console.error("Veículo selecionado não encontrado no array.");
            this.el.detalhesVeiculoSelecionadoContainer.classList.add('hidden');
            return;
        }

        this.el.detalhesVeiculoTitulo.textContent = `Detalhes: ${v.modelo} (${v._tipoVeiculo})`;
        this.el.informacoesVeiculo.innerHTML = v.exibirInformacoes(); // innerHTML pois pode conter spans de status
        this.el.imagemVeiculo.src = v.imagemUrl;
        this.el.imagemVeiculo.alt = `Imagem do ${v._tipoVeiculo} ${v.modelo}`;
        this.el.imagemVeiculo.onerror = () => { this.el.imagemVeiculo.src = 'images/carro_default.png'; }; // Fallback

        // Velocímetro
        const isCar = v instanceof Carro; // Inclui Carro, CarroEsportivo, Caminhao
        this.el.velocimetroContainer.classList.toggle('hidden', !isCar);
        if (isCar) {
            this.atualizarVelocimetroUI(v.velocidade, v.velocidadeMaxima);
        }

        // Botões Gerais
        this.el.btnLigar.disabled = v.ligado;
        this.el.btnDesligar.disabled = !v.ligado || (isCar && v.velocidade > 0); // Caminhão/Carro não desliga em movimento
        this.el.btnAcelerar.disabled = !v.ligado || (isCar && v.velocidade >= v.velocidadeMaxima);
        this.el.btnFrear.disabled = !v.ligado || (isCar && v.velocidade === 0);
        this.el.btnBuzinar.disabled = !v.ligado;

        // Botões Específicos
        const isEsportivo = v instanceof CarroEsportivo;
        const isCaminhao = v instanceof Caminhao;

        this.el.acoesEspecificasContainer.classList.toggle('hidden', !(isEsportivo || isCaminhao));

        this.el.btnTurboAtivar.classList.toggle('hidden', !(isEsportivo && !v.turboAtivado));
        this.el.btnTurboDesativar.classList.toggle('hidden', !(isEsportivo && v.turboAtivado));
        if (isEsportivo) {
            this.el.btnTurboAtivar.disabled = !v.ligado || v.turboAtivado; // Desabilita se desligado ou turbo já ativo
            this.el.btnTurboDesativar.disabled = !v.turboAtivado; // Desabilita se turbo já inativo
        }
        
        this.el.cargaControlsDiv.classList.toggle('hidden', !isCaminhao);
        if (isCaminhao) {
            this.el.btnCarregar.disabled = v.ligado;
            this.el.btnDescarregar.disabled = v.ligado;
            this.el.inputCarga.value = 100; // Valor padrão para carga
        }

        this.renderizarManutencoesParaVeiculoSelecionado();
    }

    /**
     * Atualiza a barra de velocímetro na UI.
     * @param {number} velocidadeAtual - A velocidade atual do veículo.
     * @param {number} velocidadeMaxima - A velocidade máxima do veículo.
     * @private
     */
    atualizarVelocimetroUI(velocidadeAtual, velocidadeMaxima) {
        if (velocidadeMaxima === 0) { // Evitar divisão por zero
            this.el.velocimetroBarra.style.width = '0%';
            this.el.velocimetroBarra.textContent = `0 km/h`;
            this.el.velocimetroBarra.style.backgroundColor = '#007bff'; // Azul padrão
            return;
        }
        const percentual = Math.min(100, (velocidadeAtual / velocidadeMaxima) * 100);
        this.el.velocimetroBarra.style.width = `${percentual}%`;
        this.el.velocimetroBarra.textContent = `${velocidadeAtual.toFixed(0)} km/h`;

        if (percentual > 85) this.el.velocimetroBarra.style.backgroundColor = '#dc3545'; // Vermelho (perigo)
        else if (percentual > 60) this.el.velocimetroBarra.style.backgroundColor = '#ffc107'; // Amarelo (atenção)
        else this.el.velocimetroBarra.style.backgroundColor = '#007bff'; // Azul
    }

    /**
     * Executa uma ação no veículo selecionado (polimorfismo).
     * Ações como 'ligar', 'acelerar', 'carregar', etc.
     * @param {string} acao - O nome do método a ser chamado no objeto do veículo.
     * @param {*} [valor] - Um valor opcional a ser passado para o método (ex: quantidade para acelerar/carregar).
     */
    interagirComSelecionado(acao, valor) {
        try {
            if (this.veiculoSelecionadoIndex < 0 || this.veiculoSelecionadoIndex >= this.veiculos.length) {
                this.exibirNotificacaoGlobal("Nenhum veículo está selecionado para esta ação.", "warning");
                return;
            }
            const veiculo = this.veiculos[this.veiculoSelecionadoIndex];
            let resultadoAcao = "";

            if (typeof veiculo[acao] === 'function') {
                if (acao === 'carregar' || acao === 'descarregar') {
                    const cargaValor = parseInt(this.el.inputCarga.value);
                    if (!isNaN(cargaValor) && cargaValor > 0) {
                        resultadoAcao = veiculo[acao](cargaValor);
                    } else {
                        resultadoAcao = "Valor de carga inválido. Deve ser um número positivo.";
                    }
                } else {
                    resultadoAcao = veiculo[acao](valor); // Para outras ações como acelerar(valor), ligar(), etc.
                }
            } else {
                resultadoAcao = `Ação '${acao}' não é suportada por este ${veiculo._tipoVeiculo}.`;
                console.warn(resultadoAcao, veiculo);
            }

            // Determinar tipo de notificação baseado no resultado
            const resLower = resultadoAcao.toLowerCase();
            let tipoNotificacao = "info";
            if (resLower.includes("sucesso") || resLower.includes("ligado") || resLower.includes("desligado") ||
                resLower.includes("ativado") || resLower.includes("acelerando") || resLower.includes("freando") ||
                resLower.includes("carregado") || resLower.includes("descarregou") || resLower.includes("buzina") || // Supondo que buzinar seja sucesso
                (resLower.includes("turbo") && !resLower.includes("já está"))) {
                tipoNotificacao = "success";
            } else if (resLower.includes("erro") || resLower.includes("inválido") || resLower.includes("não pode") ||
                       resLower.includes("excedida") || resLower.includes("já está") || resLower.includes("desligado.") || // quando uma ação precisa estar ligado
                       resLower.includes("atingiu") || resLower.includes("parado.") || resLower.includes("desconhecida")) {
                tipoNotificacao = "error";
            } else if (resLower.includes("precisa estar") || resLower.includes("atenção")) {
                tipoNotificacao = "warning";
            }
            
            if (resultadoAcao) this.exibirNotificacaoGlobal(resultadoAcao, tipoNotificacao);
            
            this.atualizarPainelDetalhesVeiculo(); // Sempre atualiza o painel para refletir mudanças
            this.salvarNoLocalStorage();

        } catch (error) {
            console.error(`Erro ao executar ação '${acao}' no veículo selecionado:`, error);
            this.exibirNotificacaoGlobal(`Erro durante a ação '${acao}'. Consulte o console.`, "error");
        }
    }
    
    /**
     * Lida com o agendamento/registro de uma nova manutenção para o veículo selecionado.
     * Obtém dados do formulário de manutenção, cria um objeto Manutencao e o adiciona ao veículo.
     */
    handleAgendarManutencaoParaVeiculoSelecionado() {
        try {
            if (this.veiculoSelecionadoIndex < 0 || this.veiculoSelecionadoIndex >= this.veiculos.length) {
                this.exibirNotificacaoGlobal("Nenhum veículo selecionado para agendar manutenção.", "warning");
                return;
            }
            const veiculo = this.veiculos[this.veiculoSelecionadoIndex];

            const dataInput = this.el.manutencaoDataInput.value; // Formato YYYY-MM-DD
            const tipoInput = this.el.manutencaoTipoInput.value.trim();
            const custoInput = this.el.manutencaoCustoInput.value;
            const descricaoInput = this.el.manutencaoDescricaoInput.value.trim();

            if (!dataInput || !tipoInput) {
                this.exibirNotificacaoGlobal("Data e Tipo de serviço são obrigatórios para a manutenção.", "warning");
                return;
            }
            const custo = custoInput ? parseFloat(custoInput) : 0;
            if (isNaN(custo) || custo < 0) {
                this.exibirNotificacaoGlobal("Custo da manutenção, se informado, deve ser um número não negativo.", "warning");
                return;
            }
            
            // Adiciona 'T00:00:00Z' para tratar a data como UTC e evitar problemas de fuso horário na criação do objeto Date.
            const dataManutencao = new Date(dataInput + 'T00:00:00Z'); 

            const novaManutencao = new Manutencao(dataManutencao, tipoInput, custo, descricaoInput);

            if (!novaManutencao.validar()) {
                this.exibirNotificacaoGlobal("Dados da manutenção são inválidos. Verifique data e tipo.", "error");
                return;
            }

            if (veiculo.adicionarManutencao(novaManutencao)) {
                this.exibirNotificacaoGlobal("Manutenção registrada/agendada com sucesso!", "success");
                this.el.formAgendarManutencao.reset();
                this.renderizarManutencoesParaVeiculoSelecionado(); // Atualiza listas de manutenção do veículo
                this.salvarNoLocalStorage();
                this.verificarAgendamentosParaLembretes(); // Checa se há novos lembretes
                // Se o painel geral de manutenções estiver ativo, atualiza-o também
                if (this.activeViewId === 'painel-manutencoes-view') {
                    this.renderizarPainelManutencoesGeral();
                }
            } else {
                this.exibirNotificacaoGlobal("Falha ao adicionar a manutenção ao veículo.", "error");
            }
        } catch (error) {
            console.error("Erro ao agendar/registrar manutenção:", error);
            this.exibirNotificacaoGlobal("Erro inesperado ao processar a manutenção.", "error");
        }
    }

    /**
     * Renderiza as listas de histórico e agendamentos de manutenção para o veículo atualmente selecionado.
     * @private
     */
    renderizarManutencoesParaVeiculoSelecionado() {
        if (this.veiculoSelecionadoIndex < 0 || this.veiculoSelecionadoIndex >= this.veiculos.length) return;
        const veiculo = this.veiculos[this.veiculoSelecionadoIndex];
        if (!veiculo) return;

        const historicoFormatado = veiculo.obterHistoricoManutencaoFormatado(false); // false para passadas
        this.el.listaHistoricoManutencao.innerHTML = historicoFormatado.length > 0 ?
            historicoFormatado.map(item => `<li>${item}</li>`).join('') :
            '<li class="empty">Nenhum histórico de manutenção.</li>';

        const agendamentosFormatados = veiculo.obterHistoricoManutencaoFormatado(true); // true para futuras
        this.el.listaAgendamentosManutencao.innerHTML = agendamentosFormatados.length > 0 ?
            agendamentosFormatados.map(item => `<li>${item}</li>`).join('') :
            '<li class="empty">Nenhum agendamento futuro.</li>';
    }

    /**
     * Renderiza o painel geral com todos os agendamentos futuros de manutenção de todos os veículos.
     * @private
     */
    renderizarPainelManutencoesGeral() {
        let todosAgendamentos = [];
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Comparação baseada apenas na data

        this.veiculos.forEach(veiculo => {
            veiculo.historicoManutencao.forEach(manutencao => {
                const dataManutencao = new Date(manutencao.data); // Assegura que é um objeto Date
                dataManutencao.setHours(0,0,0,0); // Zera a hora para comparação correta
                if (dataManutencao >= hoje) {
                    todosAgendamentos.push({
                        veiculoModelo: veiculo.modelo,
                        veiculoTipo: veiculo._tipoVeiculo,
                        manutencaoInfo: manutencao.formatar(),
                        dataOrdenacao: dataManutencao // Usar para ordenar
                    });
                }
            });
        });

        // Ordena por data mais próxima primeiro
        todosAgendamentos.sort((a, b) => a.dataOrdenacao - b.dataOrdenacao);

        if (todosAgendamentos.length > 0) {
            this.el.listaTodosAgendamentos.innerHTML = todosAgendamentos
                .map(item => `<li class="maintenance-item"><strong>${item.veiculoModelo} (${item.veiculoTipo})</strong>: ${item.manutencaoInfo}</li>`)
                .join('');
        } else {
            this.el.listaTodosAgendamentos.innerHTML = '<li class="empty"><p>Nenhum agendamento futuro encontrado em toda a garagem.</p></li>';
        }
    }

    /**
     * Salva o estado atual da garagem (array de veículos) no LocalStorage.
     * Os objetos Veiculo são convertidos para um formato serializável (JSON).
     * Propriedades não serializáveis (como objetos Audio) são omitidas.
     * Objetos Manutencao dentro dos veículos são convertidos usando seu método `toJSON()`.
     */
    salvarNoLocalStorage() {
        try {
            const veiculosSerializaveis = this.veiculos.map(veiculo => {
                // Cria uma cópia superficial para não modificar o objeto original diretamente aqui
                const veiculoParaSalvar = { ...veiculo };
                
                // Converte o histórico de manutenção
                veiculoParaSalvar.historicoManutencao = veiculo.historicoManutencao.map(m => m.toJSON());

                // Remove propriedades que não devem/podem ser serializadas
                delete veiculoParaSalvar.audioLigar;
                delete veiculoParaSalvar.audioDesligar;
                delete veiculoParaSalvar.audioErro;
                delete veiculoParaSalvar.audioBuzina;
                delete veiculoParaSalvar.audioAcelerar;
                delete veiculoParaSalvar.audioFrear;
                delete veiculoParaSalvar.audioTurbo;
                // Adicione outras propriedades de áudio aqui se existirem

                return veiculoParaSalvar;
            });
            localStorage.setItem(GARAGEM_STORAGE_KEY, JSON.stringify(veiculosSerializaveis));
        } catch (e) {
            console.error("Erro ao salvar dados no LocalStorage:", e);
            this.exibirNotificacaoGlobal("Falha crítica ao tentar salvar os dados da garagem. Algumas alterações podem não persistir.", "error", true);
        }
    }

    /**
     * Carrega os dados da garagem do LocalStorage.
     * Reconstrói os objetos Veiculo e Manutencao a partir dos dados JSON,
     * restaurando seus protótipos e métodos.
     */
    carregarDoLocalStorage() {
        const dadosSalvos = localStorage.getItem(GARAGEM_STORAGE_KEY);
        if (dadosSalvos) {
            try {
                const veiculosParseados = JSON.parse(dadosSalvos);
                this.veiculos = veiculosParseados.map(vp => { // vp = veiculo parseado/plain
                    let veiculoReal;
                    // Recria a instância correta do veículo baseado no _tipoVeiculo
                    switch (vp._tipoVeiculo) {
                        case 'CarroEsportivo':
                            veiculoReal = new CarroEsportivo(vp.modelo, vp.cor);
                            veiculoReal.turboAtivado = vp.turboAtivado;
                            break;
                        case 'Caminhao':
                            veiculoReal = new Caminhao(vp.modelo, vp.cor, vp.capacidadeCarga);
                            veiculoReal.cargaAtual = vp.cargaAtual;
                            break;
                        case 'Carro': // Deve vir depois dos mais específicos se houver herança
                            veiculoReal = new Carro(vp.modelo, vp.cor);
                            break;
                        default: // Fallback para Veiculo base, caso _tipoVeiculo seja desconhecido ou genérico
                            console.warn(`Tipo de veículo desconhecido '${vp._tipoVeiculo}' encontrado no LocalStorage. Criando como Veiculo base.`);
                            veiculoReal = new Veiculo(vp.modelo, vp.cor); // Não deve acontecer se tudo estiver correto
                            break;
                    }

                    // Restaura propriedades comuns
                    veiculoReal.ligado = vp.ligado || false;
                    if (veiculoReal instanceof Carro) { // Carro e seus derivados (Esportivo, Caminhao)
                        veiculoReal.velocidade = vp.velocidade || 0;
                    }
                    // imagemUrl e _tipoVeiculo são definidos no construtor da classe recriada.

                    // Reconstrói o histórico de manutenção
                    if (Array.isArray(vp.historicoManutencao)) {
                        veiculoReal.historicoManutencao = vp.historicoManutencao.map(mJSON => {
                            // Adiciona 'T00:00:00Z' ao carregar para consistência com o salvamento
                            return new Manutencao(new Date(mJSON.data + 'T00:00:00Z'), mJSON.tipo, mJSON.custo, mJSON.descricao);
                        });
                    } else {
                        veiculoReal.historicoManutencao = [];
                    }
                    return veiculoReal;
                });
            } catch (e) {
                console.error("Erro ao carregar dados do LocalStorage ou dados corrompidos:", e);
                this.veiculos = []; // Reseta a garagem em caso de erro grave
                localStorage.removeItem(GARAGEM_STORAGE_KEY); // Limpa dados corrompidos
                this.exibirNotificacaoGlobal("Os dados salvos anteriormente estavam corrompidos e foram resetados. A garagem está vazia.", "error", true);
            }
        }
    }

    /**
     * Verifica todos os veículos por agendamentos de manutenção para hoje ou amanhã
     * e exibe notificações de lembrete.
     * @private
     */
    verificarAgendamentosParaLembretes() {
        if (!this.el.notificacoesLembretesContainer) return; // Container de lembretes não existe

        this.el.notificacoesLembretesContainer.innerHTML = ''; // Limpa lembretes antigos
        const hoje = new Date();
        hoje.setUTCHours(0, 0, 0, 0); // Compara apenas a data em UTC

        const amanha = new Date(hoje);
        amanha.setUTCDate(hoje.getUTCDate() + 1); // Data de amanhã em UTC

        this.veiculos.forEach(veiculo => {
            veiculo.historicoManutencao.forEach(manutencao => {
                const dataManutencao = new Date(manutencao.data);
                dataManutencao.setUTCHours(0, 0, 0, 0); // Compara apenas a data em UTC

                let mensagemLembrete = null;
                let tipoLembrete = "info";

                if (dataManutencao.getTime() === hoje.getTime()) {
                    mensagemLembrete = `LEMBRETE HOJE: ${manutencao.tipo} para ${veiculo.modelo} (${veiculo._tipoVeiculo}).`;
                    tipoLembrete = "warning"; // Destaque para hoje
                } else if (dataManutencao.getTime() === amanha.getTime()) {
                    mensagemLembrete = `LEMBRETE AMANHÃ: ${manutencao.tipo} para ${veiculo.modelo} (${veiculo._tipoVeiculo}).`;
                    tipoLembrete = "info";
                }

                if (mensagemLembrete) {
                    this.exibirNotificacaoLembrete(mensagemLembrete, tipoLembrete);
                }
            });
        });
    }

    /**
     * Exibe uma notificação de lembrete de manutenção.
     * Estas notificações são geralmente persistentes até serem fechadas pelo usuário.
     * @param {string} mensagem - A mensagem da notificação.
     * @param {string} [tipo="info"] - O tipo da notificação ('info', 'warning', 'success', 'error').
     * @param {number} [duracao=0] - Duração em milissegundos. 0 para permanente (requer botão de fechar).
     * @private
     */
    exibirNotificacaoLembrete(mensagem, tipo = "info", duracao = 0) {
        if (!this.el.notificacoesLembretesContainer) return;

        const notificacaoDiv = document.createElement('div');
        notificacaoDiv.className = `notificacao ${tipo}`;
        
        const textoSpan = document.createElement('span');
        textoSpan.textContent = mensagem;
        notificacaoDiv.appendChild(textoSpan);

        const btnFechar = document.createElement('button');
        btnFechar.innerHTML = '×'; // '×' caractere de fechar
        btnFechar.className = 'close-notif';
        btnFechar.setAttribute('aria-label', 'Fechar notificação');
        btnFechar.onclick = () => notificacaoDiv.remove();
        notificacaoDiv.appendChild(btnFechar);

        this.el.notificacoesLembretesContainer.appendChild(notificacaoDiv);

        if (duracao > 0) {
            setTimeout(() => {
                notificacaoDiv.remove();
            }, duracao);
        }
    }

    /**
     * Exibe uma notificação global para o usuário (feedback de ações, erros, etc.).
     * @param {string} mensagem - A mensagem a ser exibida.
     * @param {string} [tipo="info"] - O tipo da notificação ('info', 'success', 'warning', 'error').
     * @param {boolean} [permanente=false] - Se true, a notificação não desaparece automaticamente.
     */
    exibirNotificacaoGlobal(mensagem, tipo = "info", permanente = false) {
        const notificacaoDiv = document.createElement('div');
        notificacaoDiv.className = `notificacao ${tipo}`;
        
        const textoSpan = document.createElement('span');
        textoSpan.textContent = mensagem;
        notificacaoDiv.appendChild(textoSpan);

        const btnFechar = document.createElement('button');
        btnFechar.innerHTML = '×';
        btnFechar.className = 'close-notif';
        btnFechar.setAttribute('aria-label', 'Fechar notificação');
        btnFechar.onclick = () => notificacaoDiv.remove();
        notificacaoDiv.appendChild(btnFechar);

        this.el.notificacoesGlobais.prepend(notificacaoDiv); // Adiciona no topo para mais recentes aparecerem primeiro

        if (!permanente) {
            const tempoExibicao = tipo === 'error' || tipo === 'warning' ? 7000 : 4000; // Erros/avisos ficam mais tempo
            setTimeout(() => {
                notificacaoDiv.remove();
            }, tempoExibicao);
        }
    }

    /**
     * Remove todas as notificações globais da tela.
     * Útil ao trocar de view, por exemplo.
     * @private
     */
    limparNotificacaoGlobal() {
        // Não limpa os lembretes, apenas as notificações de ação.
        // Se o container de lembretes for o mesmo que o global, esta lógica precisaria ser ajustada
        // para preservar os lembretes, ou eles devem ter um container separado.
        // Assumindo que são separados ou que a limpeza é desejada:
        if (this.el.notificacoesGlobais !== this.el.notificacoesLembretesContainer) {
            this.el.notificacoesGlobais.innerHTML = '';
        } else {
            // Se forem o mesmo container, remove apenas as que não são lembretes (mais complexo)
            // Por simplicidade, se forem o mesmo, pode-se optar por não limpar automaticamente.
            // Ou adicionar uma classe específica para notificações de ação e remover apenas elas.
            // Para este exemplo, se forem o mesmo, não faremos nada aqui.
        }
    }
}