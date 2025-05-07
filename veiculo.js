// js/Veiculo.js
import { Manutencao } from './Manutencao.js';

/**
 * @class Veiculo
 * @classdesc Classe base para representar um veículo genérico.
 * Possui propriedades e métodos comuns a todos os tipos de veículos.
 */
export class Veiculo {
    /**
     * Cria uma instância de Veiculo.
     * @param {string} modelo - O modelo do veículo.
     * @param {string} cor - A cor do veículo.
     */
    constructor(modelo, cor) {
        /** @property {string} modelo - O modelo do veículo. */
        this.modelo = modelo;
        /** @property {string} cor - A cor do veículo. */
        this.cor = cor;
        /** @property {boolean} ligado - Indica se o veículo está ligado ou desligado. */
        this.ligado = false;
        /** @property {string} imagemUrl - URL da imagem padrão para este tipo de veículo. */
        this.imagemUrl = "images/carro_default.png";
        /** @property {number} velocidadeMaxima - A velocidade máxima que o veículo pode atingir. */
        this.velocidadeMaxima = 180; // Valor padrão, pode ser sobrescrito
        /** @property {Manutencao[]} historicoManutencao - Array de objetos Manutencao. */
        this.historicoManutencao = [];
        /** @protected @property {string} _tipoVeiculo - Identificador do tipo do veículo (nome da classe). */
        this._tipoVeiculo = this.constructor.name; // Ex: "Carro", "Caminhao"

        // Sons (não serializados, recriados na instanciação)
        this.audioLigar = new Audio('audio/ligar_som.mp3');
        this.audioDesligar = new Audio('audio/desligar_som.mp3');
        this.audioErro = new Audio('audio/erro_som.mp3');
    }

    /**
     * Reproduz um som associado a uma ação do veículo.
     * @protected
     * @param {HTMLAudioElement} audio - O objeto de áudio a ser reproduzido.
     */
    _playSound(audio) {
        if (audio) {
            audio.currentTime = 0; // Reinicia o áudio
            audio.play().catch(e => console.warn("Erro ao tocar áudio:", e.message)); // Evita erros se o usuário não interagiu com a página
        }
    }

    /**
     * Adiciona um registro de manutenção ao histórico do veículo.
     * A manutenção é validada antes de ser adicionada. O histórico é mantido ordenado pela data mais recente primeiro.
     * @param {Manutencao} manutencaoObj - Uma instância da classe Manutencao.
     * @returns {boolean} True se a manutenção foi adicionada com sucesso, false caso contrário.
     */
    adicionarManutencao(manutencaoObj) {
        if (manutencaoObj instanceof Manutencao && manutencaoObj.validar()) {
            this.historicoManutencao.push(manutencaoObj);
            // Ordena por data, mais recente primeiro
            this.historicoManutencao.sort((a, b) => b.data - a.data);
            return true;
        }
        console.warn("Tentativa de adicionar manutenção inválida:", manutencaoObj);
        return false;
    }

    /**
     * Obtém o histórico de manutenções formatado.
     * Pode filtrar para obter apenas manutenções futuras (agendamentos) ou passadas (histórico).
     * @param {boolean} [apenasFuturos=false] - Se true, retorna apenas manutenções com data igual ou posterior a hoje.
     *                                         Se false, retorna apenas manutenções com data anterior a hoje.
     * @returns {string[]} Um array de strings, cada uma representando uma manutenção formatada.
     */
    obterHistoricoManutencaoFormatado(apenasFuturos = false) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas datas

        return this.historicoManutencao
            .filter(m => {
                const dataManutencao = new Date(m.data); // Assegura que é um objeto Date
                dataManutencao.setHours(0,0,0,0); // Zera a hora para comparação correta
                return apenasFuturos ? dataManutencao >= hoje : dataManutencao < hoje;
            })
            .map(m => m.formatar());
    }

    /**
     * Liga o veículo se estiver desligado.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            this._playSound(this.audioLigar);
            return `${this._tipoVeiculo} '${this.modelo}' ligado.`;
        }
        this._playSound(this.audioErro);
        return `${this._tipoVeiculo} '${this.modelo}' já está ligado.`;
    }

    /**
     * Desliga o veículo se estiver ligado.
     * @returns {string} Mensagem indicando o resultado da ação.
     */
    desligar() {
        if (this.ligado) {
            this.ligado = false;
            this._playSound(this.audioDesligar);
            return `${this._tipoVeiculo} '${this.modelo}' desligado.`;
        }
        this._playSound(this.audioErro);
        return `${this._tipoVeiculo} '${this.modelo}' já está desligado.`;
    }

    /**
     * Emite o som da buzina do veículo.
     * Requer que o veículo esteja ligado.
     * @returns {string} Mensagem indicando o resultado da ação ou som da buzina.
     */
    buzinar() {
        if (!this.ligado) {
            this._playSound(this.audioErro);
            return `${this._tipoVeiculo} '${this.modelo}' precisa estar ligado para buzinar.`;
        }
        // Som da buzina será específico nas classes filhas
        return `Veículo '${this.modelo}': Beep! Beep! (Som genérico)`;
    }

    /**
     * Exibe informações básicas sobre o veículo.
     * Inclui tipo, modelo, cor e estado (ligado/desligado).
     * @returns {string} Uma string formatada com as informações do veículo.
     */
    exibirInformacoes() {
        const status = this.ligado ? '<span class="status-ligado">Ligado ✔️</span>' : '<span class="status-desligado">Desligado ❌</span>';
        return `== ${this._tipoVeiculo}: ${this.modelo} ==\nCor: ${this.cor}\nEstado: ${status}`;
    }
}